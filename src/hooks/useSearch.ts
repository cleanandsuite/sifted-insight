// ============================================================================
// SIFTED INSIGHT SEARCH HOOKS
// React hooks for article search functionality
// ============================================================================

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface SearchResult {
  id: string;
  title: string;
  executive_summary: string;
  original_url: string;
  source_id: string;
  source_name: string;
  author: string;
  published_at: string;
  rank_score: number;
  relevance_score: number;
  ts_headline?: string;
  match_positions?: MatchPosition[];
  tags?: string[];
}

export interface MatchPosition {
  field: string;
  position: number;
  length: number;
}

export interface SearchFilters {
  status?: string;
  sourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'relevance' | 'date' | 'rank';
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: Error | null;
  suggestions: string[];
  filters: SearchFilters;
}

export interface UseSearchReturn extends SearchState {
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  clearSearch: () => void;
  setFilters: (filters: SearchFilters) => void;
  getSuggestions: (query: string) => Promise<void>;
}

// ============================================================================
// SEARCH HOOK (MAIN)
// ============================================================================

export const useSearch = (): UseSearchReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [state, setState] = useState<SearchState>({
    query: searchParams.get('q') || '',
    results: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    loading: false,
    error: null,
    suggestions: [],
    filters: {
      sortBy: 'relevance',
    },
  });

  // Parse URL params on mount
  useEffect(() => {
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = (searchParams.get('sort') as SearchFilters['sortBy']) || 'relevance';

    if (query) {
      setState((prev) => ({
        ...prev,
        query,
        page,
        filters: { ...prev.filters, sortBy },
      }));
      searchArticles(query, { sortBy }, page);
    }
  }, []);

  const searchArticles = async (
    query: string,
    filters: SearchFilters = {},
    page: number = 1
  ): Promise<void> => {
    if (!query.trim()) {
      setState((prev) => ({
        ...prev,
        results: [],
        totalCount: 0,
        loading: false,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      query,
      loading: true,
      error: null,
      filters: { ...prev.filters, ...filters },
    }));

    try {
      const { data, error } = await supabase.rpc('search_articles', {
        query_text: query,
        page_num: page,
        page_size: state.pageSize,
        status_filter: filters.status || 'published',
        source_filter: filters.sourceId || null,
        date_from: filters.dateFrom || null,
        date_to: filters.dateTo || null,
        sort_by: filters.sortBy || 'relevance',
      });

      if (error) throw error;

      const results = (data || []) as SearchResult[];
      
      setState((prev) => ({
        ...prev,
        results: page === 1 ? results : [...prev.results, ...results],
        totalCount: results.length > 0 ? (results[0] as any)?.total_count || prev.totalCount : prev.totalCount,
        page,
      }));

      // Update URL
      const params = new URLSearchParams();
      params.set('q', query);
      params.set('page', page.toString());
      if (filters.sortBy && filters.sortBy !== 'relevance') {
        params.set('sort', filters.sortBy);
      }
      setSearchParams(params, { replace: true });
      
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Search failed'),
      }));
    } finally {
      setState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  const loadMore = useCallback(async () => {
    if (state.loading || state.results.length >= state.totalCount) return;
    
    await searchArticles(state.query, state.filters, state.page + 1);
  }, [state.query, state.filters, state.page, state.loading, state.results.length, state.totalCount]);

  const clearSearch = useCallback(() => {
    setState({
      query: '',
      results: [],
      totalCount: 0,
      page: 1,
      pageSize: 20,
      loading: false,
      error: null,
      suggestions: [],
      filters: { sortBy: 'relevance' },
    });
    setSearchParams({}, { replace: true });
  }, []);

  const setFilters = useCallback((filters: SearchFilters) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      page: 1, // Reset to page 1 when filters change
      results: [], // Clear results for fresh search
    }));
    searchArticles(state.query, { ...state.filters, ...filters }, 1);
  }, [state.query, state.filters]);

  const getSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setState((prev) => ({ ...prev, suggestions: [] }));
      return;
    }

    try {
      const { data, error } = await supabase.rpc('search_suggestions', {
        query_text: query,
        limit_count: 10,
      });

      if (error) throw error;
      
      const suggestions = (data || []).map((item: any) => item.suggestion);
      setState((prev) => ({ ...prev, suggestions: suggestions.slice(0, 10) }));
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  }, []);

  return {
    ...state,
    search: searchArticles,
    loadMore,
    clearSearch,
    setFilters,
    getSuggestions,
  };
};

// ============================================================================
// SIMPLE SEARCH HOOK (For quick searches)
// ============================================================================

export const useSimpleSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string, limit = 20, offset = 0) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('search_articles_simple', {
        query_text: query,
        limit_count: limit,
        offset_count: offset,
      });

      if (rpcError) throw rpcError;
      setResults((data || []) as SearchResult[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clear };
};

// ============================================================================
// SEARCH SUGGESTIONS HOOK (Autocomplete)
// ============================================================================

export const useSearchSuggestions = (debounceMs = 300) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('search_suggestions', {
          query_text: query,
          limit_count: 10,
        });

        if (error) throw error;
        const uniqueSuggestions = [...new Set((data || []).map((item: any) => item.suggestion))];
        setSuggestions(uniqueSuggestions.slice(0, 10));
      } catch (err) {
        console.error('Suggestions error:', err);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { query, setQuery, suggestions, loading, clear: () => setSuggestions([]) };
};

// ============================================================================
// RELATED ARTICLES HOOK
// ============================================================================

export const useRelatedArticles = (articleId: string | undefined) => {
  const [articles, setArticles] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!articleId) {
      setArticles([]);
      return;
    }

    const fetchRelated = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabase.rpc('get_related_articles', {
          article_uuid: articleId,
          limit_count: 5,
        });

        if (rpcError) throw rpcError;
        setArticles((data || []) as SearchResult[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch related articles'));
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [articleId]);

  return { articles, loading, error };
};

// ============================================================================
// SEARCH DEBOUNCE HOOK
// ============================================================================

export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ============================================================================
// URL-BASED SEARCH HOOK
// ============================================================================

export const useUrlSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const sortBy = (searchParams.get('sort') as 'relevance' | 'date' | 'rank') || 'relevance';

  const setQuery = useCallback((newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set('q', newQuery);
      params.set('page', '1');
    } else {
      params.delete('q');
    }
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const setPage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const setSortBy = useCallback((newSort: 'relevance' | 'date' | 'rank') => {
    const params = new URLSearchParams(searchParams);
    if (newSort !== 'relevance') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const clearSearch = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return {
    query,
    page,
    sortBy,
    setQuery,
    setPage,
    setSortBy,
    clearSearch,
  };
};
