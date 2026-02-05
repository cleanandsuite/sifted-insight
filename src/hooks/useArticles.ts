import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type ContentCategory = Database['public']['Enums']['content_category'];

const ALL_CATEGORIES: ContentCategory[] = ['tech', 'finance', 'politics', 'climate'];
const VALID_STATUSES: Database['public']['Enums']['article_status'][] = ['published', 'pending'];

// Types matching frontend expectations
export interface ArticleSummary {
  keyPoints: string[];
  analysis: string;
  takeaways: string[];
}

export interface Article {
  id: string;
  originalTitle: string;
  aiSummary: string;
  summaryTabs: ArticleSummary;
  originalAuthor: string;
  sourcePublication: string;
  sourceUrl: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  tags: string[];
  originalReadTime: number;
  siftedReadTime: number;
  publishedAt: string;
  isFeatured?: boolean;
  topic?: string;
}

// Hook to fetch articles from database
export const useArticles = () => {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [regularArticles, setRegularArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // Fetch featured article
      const { data: featured, error: featuredError } = await supabase
        .from('articles')
        .select('*, sources(*), summaries(*)')
        .eq('is_featured', true)
        .eq('status', 'published')
        .order('rank_score', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (featuredError) throw featuredError;
      if (featured) {
        setFeaturedArticle(transformArticle(featured));
      }

      // Fetch regular articles (not featured)
      const { data: regular, error: regularError } = await supabase
        .from('articles')
        .select('*, sources(*), summaries(*)')
        .eq('status', 'published')
        .eq('is_featured', false)
        .order('rank_score', { ascending: false })
        .limit(12);
      
      if (regularError) throw regularError;
      setRegularArticles((regular || []).map(transformArticle));
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch articles'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return {
    featuredArticle,
    regularArticles,
    loading,
    error,
    refetch: fetchArticles,
  };
};

// Hook to fetch articles with category diversity and pagination
export const useArticlesWithDiversity = (categoryFilter?: string | null) => {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const BATCH_SIZE = 4;
  const INITIAL_LOAD = 10;

  // Normalize category filter to lowercase to match DB enum values
  const normalizedCategory = (categoryFilter?.toLowerCase().trim() || null) as ContentCategory | null;
  const isValidCategory = normalizedCategory !== null && ALL_CATEGORIES.includes(normalizedCategory);

  // Initial fetch - ensures category diversity
  const fetchInitial = async () => {
    try {
      setLoading(true);
      setArticles([]);
      setOffset(0);
      setHasMore(true);

      // If filtering by a valid category, just fetch that category
      if (isValidCategory) {
        const { data: featured, error: featuredError } = await supabase
          .from('articles')
          .select('*, sources(*), summaries(*)')
          .in('status', VALID_STATUSES)
          .eq('content_category', normalizedCategory)
          .order('rank_score', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (featuredError) throw featuredError;
        if (featured) {
          setFeaturedArticle(transformArticle(featured));
        } else {
          setFeaturedArticle(null);
        }

        const { data: regular, error: regularError } = await supabase
          .from('articles')
          .select('*, sources(*), summaries(*)')
          .in('status', VALID_STATUSES)
          .eq('content_category', normalizedCategory)
          .order('rank_score', { ascending: false })
          .range(1, INITIAL_LOAD);

        if (regularError) throw regularError;

        const fetchedArticles = (regular || []).map(transformArticle);
        setArticles(fetchedArticles);
        setOffset(INITIAL_LOAD + 1);
        setHasMore(fetchedArticles.length === INITIAL_LOAD);
        return;
      }

      // No filter - fetch with category diversity
      // First, fetch the featured article
      const { data: featured, error: featuredError } = await supabase
        .from('articles')
        .select('*, sources(*), summaries(*)')
        .eq('is_featured', true)
        .in('status', VALID_STATUSES)
        .order('rank_score', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (featuredError) throw featuredError;
      if (featured) {
        setFeaturedArticle(transformArticle(featured));
      }

      // Fetch top articles ensuring at least one from each category
      const seenIds = new Set<string>();
      if (featured) seenIds.add(featured.id);

      // First, get one article from each category for diversity
      const categoryArticles: Article[] = [];
      for (const category of ALL_CATEGORIES) {
        const { data, error } = await supabase
          .from('articles')
          .select('*, sources(*), summaries(*)')
          .in('status', VALID_STATUSES)
          .eq('content_category', category)
          .order('rank_score', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data && !seenIds.has(data.id)) {
          categoryArticles.push(transformArticle(data));
          seenIds.add(data.id);
        }
      }

      // Now fetch more articles by ranking to reach at least INITIAL_LOAD
      const remaining = INITIAL_LOAD - categoryArticles.length;
      if (remaining > 0) {
        const excludeIds = Array.from(seenIds);
        const { data: moreArticles, error: moreError } = await supabase
          .from('articles')
          .select('*, sources(*), summaries(*)')
          .in('status', VALID_STATUSES)
          .not('id', 'in', `(${excludeIds.join(',')})`)
          .order('rank_score', { ascending: false })
          .limit(remaining);

        if (!moreError && moreArticles) {
          for (const article of moreArticles) {
            if (!seenIds.has(article.id)) {
              categoryArticles.push(transformArticle(article));
              seenIds.add(article.id);
            }
          }
        }
      }

      setArticles(categoryArticles);
      setOffset(categoryArticles.length);
      setHasMore(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch articles'));
    } finally {
      setLoading(false);
    }
  };

  // Load more articles
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);

      let query = supabase
        .from('articles')
        .select('*, sources(*), summaries(*)')
        .in('status', VALID_STATUSES)
        .order('rank_score', { ascending: false });

      // Apply category filter if present
      if (isValidCategory) {
        query = query.eq('content_category', normalizedCategory);
      }

      // Exclude already loaded articles
      const existingIds = articles.map(a => a.id);
      if (featuredArticle) {
        existingIds.push(featuredArticle.id);
      }

      if (existingIds.length > 0) {
        query = query.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data, error } = await query.limit(BATCH_SIZE);

      if (error) throw error;

      const newArticles = (data || []).map(transformArticle);
      
      if (newArticles.length === 0) {
        setHasMore(false);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
        setOffset(prev => prev + newArticles.length);
        setHasMore(newArticles.length === BATCH_SIZE);
      }
    } catch (err) {
      console.error('Failed to load more articles:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, [categoryFilter]);

  return {
    featuredArticle,
    articles,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch: fetchInitial,
  };
};

// Hook to fetch single article by ID
export const useArticle = (id: string | undefined) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('articles')
          .select('*, sources(*), summaries(*)')
          .eq('id', id)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        if (data) {
          setArticle(transformArticle(data));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch article'));
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  return { article, loading, error };
};

// Hook for real-time updates
export const useRealtimeArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*, sources(*), summaries(*)')
        .eq('status', 'published')
        .order('rank_score', { ascending: false })
        .limit(20);
      
      setArticles((data || []).map(transformArticle));
      setLoading(false);
    };
    
    fetchArticles();

    // Subscribe to new articles
    const channel = supabase
      .channel('articles-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'articles',
        },
        () => {
          fetchArticles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { articles, loading };
};

// Transform database article to frontend format
const transformArticle = (dbArticle: any): Article => {
  const sourceName = dbArticle.sources?.name || 'Unknown Source';
  const summary = dbArticle.summaries;
  
  // Parse JSONB fields (they come as arrays or strings from Supabase)
  const keyPoints = Array.isArray(summary?.key_points) 
    ? summary.key_points 
    : [];
  const takeaways = Array.isArray(summary?.takeaways) 
    ? summary.takeaways 
    : [];
  
  return {
    id: dbArticle.id,
    originalTitle: dbArticle.title,
    aiSummary: summary?.executive_summary || dbArticle.summary || '',
    summaryTabs: {
      keyPoints,
      analysis: summary?.analysis || '',
      takeaways,
    },
    originalAuthor: dbArticle.author || 'Unknown',
    sourcePublication: sourceName,
    sourceUrl: dbArticle.original_url,
    mediaUrl: dbArticle.media_url || dbArticle.image_url || '',
    mediaType: (dbArticle.media_type as 'image' | 'video') || 'image',
    tags: dbArticle.tags || [],
    originalReadTime: dbArticle.original_read_time || 10,
    siftedReadTime: dbArticle.sifted_read_time || 2,
    publishedAt: dbArticle.published_at,
    isFeatured: dbArticle.is_featured,
    topic: dbArticle.topic || 'General',
  };
};
