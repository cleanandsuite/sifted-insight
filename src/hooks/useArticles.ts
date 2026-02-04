import { useState, useEffect } from 'react';
import { supabase, articles as articlesApi } from '@/lib/supabase';
import type { ArticleWithRelations } from '@/lib/database.types';

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
}

// Hook to fetch articles from Supabase
export const useArticles = () => {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [regularArticles, setRegularArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // Fetch featured article
      const featured = await articlesApi.getFeatured();
      if (featured) {
        setFeaturedArticle(transformArticle(featured));
      }

      // Fetch regular articles
      const regular = await articlesApi.getRegular(12);
      setRegularArticles(regular.map(transformArticle));
      
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
        const data = await articlesApi.getById(id);
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
    // Initial fetch
    const fetchArticles = async () => {
      const regular = await articlesApi.getRegular(20);
      setArticles(regular.map(transformArticle));
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
          filter: 'status=eq.published',
        },
        (payload) => {
          // Add new article to the list
          fetchArticles(); // Refetch to get complete data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { articles, loading };
};

// Transform Supabase article to frontend format
const transformArticle = (dbArticle: any): Article => {
  // Handle different possible structures
  const sourceName = dbArticle.sources?.name || dbArticle.source_name || 'Unknown Source';
  const summary = dbArticle.summaries;
  
  return {
    id: dbArticle.id,
    originalTitle: dbArticle.title,
    aiSummary: dbArticle.summary || '',
    summaryTabs: {
      keyPoints: summary?.key_points || [],
      analysis: summary?.analysis || '',
      takeaways: summary?.takeaways || [],
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
  };
};

// Mock data fallback (for development/demo)
export const useMockArticles = () => {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [regularArticles, setRegularArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      // Import mock data dynamically to avoid circular deps
      import('@/data/mockArticles').then(({ mockArticles, getFeaturedArticle, getRegularArticles }) => {
        const featured = getFeaturedArticle();
        const regular = getRegularArticles();
        
        if (featured) {
          setFeaturedArticle(transformMockArticle(featureatured));
        }
        setRegularArticles(regular.map(transformMockArticle));
        setLoading(false);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return { featuredArticle, regularArticles, loading, refetch: () => {} };
};

// Transform mock article to frontend format
const transformMockArticle = (mock: any): Article => ({
  id: mock.id,
  originalTitle: mock.originalTitle,
  aiSummary: mock.aiSummary,
  summaryTabs: mock.summaryTabs,
  originalAuthor: mock.originalAuthor,
  sourcePublication: mock.sourcePublication,
  sourceUrl: mock.sourceUrl,
  mediaUrl: mock.mediaUrl,
  mediaType: mock.mediaType,
  tags: mock.tags,
  originalReadTime: mock.originalReadTime,
  siftedReadTime: mock.siftedReadTime,
  publishedAt: mock.publishedAt,
  isFeatured: mock.isFeatured,
});
