import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
