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

// Hook to fetch articles with V4 SIFT ranking system
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

  // Initial fetch - uses V4 SIFT ranking (Hotness 35% + Freshness 35% + Value 30%)
  // Featured article must be tech category
  const fetchInitial = async () => {
    try {
      setLoading(true);
      setArticles([]);
      setOffset(0);
      setHasMore(true);

      // Featured article: highest V4-ranked tech article
      const { data: featuredData, error: featuredError } = await supabase
        .rpc('get_ranked_feed_v4', { 
          limit_count: 1, 
          category_filter: 'tech' 
        });

      if (featuredError) throw featuredError;
      
      let featured: Article | null = null;
      if (featuredData && featuredData.length > 0) {
        // Need to fetch full article with sources and summaries
        const { data: fullFeatured } = await supabase
          .from('articles')
          .select('*, sources(*), summaries(*)')
          .eq('id', featuredData[0].id)
          .maybeSingle();
        
        if (fullFeatured) {
          featured = transformArticle(fullFeatured);
          setFeaturedArticle(featured);
        }
      } else {
        setFeaturedArticle(null);
      }

      // Fetch remaining articles with V4 ranking
      const { data: rankedData, error: rankedError } = await supabase
        .rpc('get_ranked_feed_v4', { 
          limit_count: INITIAL_LOAD + 1, // +1 to account for featured
          category_filter: isValidCategory ? normalizedCategory : null
        });

      if (rankedError) throw rankedError;

      // Get full article data for ranked results (excluding featured)
      const rankedIds = (rankedData || [])
        .filter((r: any) => !featured || r.id !== featured.id)
        .slice(0, INITIAL_LOAD)
        .map((r: any) => r.id);

      if (rankedIds.length > 0) {
        const { data: fullArticles, error: articlesError } = await supabase
          .from('articles')
          .select('*, sources(*), summaries(*)')
          .in('id', rankedIds);

        if (articlesError) throw articlesError;

        // Sort by the V4 ranking order
        const articleMap = new Map((fullArticles || []).map(a => [a.id, a]));
        const sortedArticles = rankedIds
          .map((id: string) => articleMap.get(id))
          .filter(Boolean)
          .map(transformArticle);

        setArticles(sortedArticles);
        setOffset(sortedArticles.length);
        setHasMore(sortedArticles.length === INITIAL_LOAD);
      } else {
        setArticles([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch articles'));
    } finally {
      setLoading(false);
    }
  };

  // Load more articles with V4 ranking
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);

      // Get more ranked articles
      const { data: rankedData, error: rankedError } = await supabase
        .rpc('get_ranked_feed_v4', { 
          limit_count: offset + BATCH_SIZE + 1,
          category_filter: isValidCategory ? normalizedCategory : null
        });

      if (rankedError) throw rankedError;

      // Exclude already loaded articles
      const existingIds = new Set(articles.map(a => a.id));
      if (featuredArticle) {
        existingIds.add(featuredArticle.id);
      }

      const newRankedIds = (rankedData || [])
        .filter((r: any) => !existingIds.has(r.id))
        .slice(0, BATCH_SIZE)
        .map((r: any) => r.id);

      if (newRankedIds.length === 0) {
        setHasMore(false);
      } else {
        const { data: fullArticles, error: articlesError } = await supabase
          .from('articles')
          .select('*, sources(*), summaries(*)')
          .in('id', newRankedIds);

        if (articlesError) throw articlesError;

        // Sort by the V4 ranking order
        const articleMap = new Map((fullArticles || []).map(a => [a.id, a]));
        const newArticles = newRankedIds
          .map((id: string) => articleMap.get(id))
          .filter(Boolean)
          .map(transformArticle);

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

// Hook to track article interactions (for V4 ranking engagement)
export const useArticleInteraction = () => {
  const trackInteraction = async (articleId: string, type: 'read' | 'saved' | 'shared') => {
    try {
      const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
      
      await supabase.rpc('track_article_interaction', {
        p_article_id: articleId,
        p_interaction_type: type,
        p_session_id: sessionId
      });
    } catch (err) {
      console.error('Failed to track interaction:', err);
    }
  };

  return { trackInteraction };
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
