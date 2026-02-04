import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Article } from './useArticles';

export const useRelatedArticles = (articleId: string | undefined, topic?: string) => {
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!articleId) {
        setLoading(false);
        return;
      }

      try {
        // Get related articles with same topic
        let query = supabase
          .from('articles')
          .select('*, sources(*), summaries(*)')
          .eq('status', 'published')
          .neq('id', articleId)
          .order('rank_score', { ascending: false })
          .limit(5);

        // Filter by topic if available
        if (topic && topic !== 'General') {
          query = query.eq('topic', topic);
        }

        const { data, error } = await query;

        if (error) throw error;
        
        setRelated((data || []).map(transformArticle));
      } catch (err) {
        console.error('Failed to fetch related articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [articleId, topic]);

  return { related, loading };
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
