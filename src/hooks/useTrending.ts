import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Article } from './useArticles';

export const useTrending = () => {
  const [trending, setTrending] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Get top 5 articles by rank_score from last 48 hours
        const { data, error } = await supabase
          .from('articles')
          .select('*, sources(*), summaries(*)')
          .eq('status', 'published')
          .gte('published_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
          .order('rank_score', { ascending: false })
          .limit(5);

        if (error) throw error;
        
        setTrending((data || []).map(transformArticle));
      } catch (err) {
        console.error('Failed to fetch trending:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return { trending, loading };
};

// Transform database article to frontend format
const transformArticle = (dbArticle: any): Article => {
  const sourceName = dbArticle.sources?.name || 'Unknown Source';
  const summary = dbArticle.summaries;
  
  const keyPoints = Array.isArray(summary?.key_points) ? summary.key_points : [];
  const takeaways = Array.isArray(summary?.takeaways) ? summary.takeaways : [];
  
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
