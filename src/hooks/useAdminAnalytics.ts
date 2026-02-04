import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  id: string;
  event_type: string;
  article_id: string | null;
  user_session_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface DailyAnalytics {
  id: string;
  date: string;
  page_views: number;
  unique_visitors: number;
  article_reads: number;
  avg_read_time_seconds: number;
  top_articles: Array<{ id: string; title: string; views: number }>;
  top_topics: Array<{ topic: string; views: number }>;
}

interface AggregatedStats {
  totalPageViews: number;
  totalUniqueVisitors: number;
  totalArticleReads: number;
  avgReadTime: number;
  eventsByType: Record<string, number>;
  topArticles: Array<{ id: string; title: string; count: number }>;
  topTopics: Array<{ topic: string; count: number }>;
  dailyTrend: Array<{ date: string; views: number; reads: number }>;
}

export const useAdminAnalytics = (startDate?: Date, endDate?: Date) => {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate || new Date();

  return useQuery({
    queryKey: ['admin-analytics', start.toISOString(), end.toISOString()],
    queryFn: async (): Promise<AggregatedStats> => {
      // Fetch recent analytics events
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false })
        .limit(10000);

      if (error) throw error;

      const typedEvents = (events || []) as AnalyticsEvent[];

      // Calculate aggregated stats
      const eventsByType: Record<string, number> = {};
      const articleViews: Record<string, number> = {};
      const uniqueSessions = new Set<string>();
      const dailyStats: Record<string, { views: number; reads: number }> = {};

      typedEvents.forEach(event => {
        // Count by event type
        eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;

        // Track unique sessions
        if (event.user_session_id) {
          uniqueSessions.add(event.user_session_id);
        }

        // Track article views
        if (event.article_id && (event.event_type === 'page_view' || event.event_type === 'article_click')) {
          articleViews[event.article_id] = (articleViews[event.article_id] || 0) + 1;
        }

        // Track daily trend
        const date = event.created_at.split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { views: 0, reads: 0 };
        }
        if (event.event_type === 'page_view') {
          dailyStats[date].views++;
        }
        if (event.event_type === 'article_read') {
          dailyStats[date].reads++;
        }
      });

      // Get top articles with titles
      const topArticleIds = Object.entries(articleViews)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => id);

      let topArticles: Array<{ id: string; title: string; count: number }> = [];
      if (topArticleIds.length > 0) {
        const { data: articles } = await supabase
          .from('articles')
          .select('id, title, topic')
          .in('id', topArticleIds);

        if (articles) {
          topArticles = topArticleIds.map(id => {
            const article = articles.find(a => a.id === id);
            return {
              id,
              title: article?.title || 'Unknown Article',
              count: articleViews[id],
            };
          });
        }
      }

      // Calculate topic distribution from articles
      const { data: allArticles } = await supabase
        .from('articles')
        .select('id, topic')
        .in('id', Object.keys(articleViews));

      const topicCounts: Record<string, number> = {};
      if (allArticles) {
        allArticles.forEach(article => {
          const topic = article.topic || 'General';
          topicCounts[topic] = (topicCounts[topic] || 0) + (articleViews[article.id] || 0);
        });
      }

      const topTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([topic, count]) => ({ topic, count }));

      // Calculate daily trend (last 30 days)
      const dailyTrend = Object.entries(dailyStats)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, stats]) => ({
          date,
          views: stats.views,
          reads: stats.reads,
        }));

      // Calculate average read time from article_read events
      const readEvents = typedEvents.filter(e => e.event_type === 'article_read');
      const totalReadTime = readEvents.reduce((sum, e) => {
        const readTime = (e.metadata as { read_time_seconds?: number }).read_time_seconds || 0;
        return sum + readTime;
      }, 0);
      const avgReadTime = readEvents.length > 0 ? Math.round(totalReadTime / readEvents.length) : 0;

      return {
        totalPageViews: eventsByType['page_view'] || 0,
        totalUniqueVisitors: uniqueSessions.size,
        totalArticleReads: eventsByType['article_read'] || 0,
        avgReadTime,
        eventsByType,
        topArticles,
        topTopics,
        dailyTrend,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRecentEvents = (limit = 50) => {
  return useQuery({
    queryKey: ['recent-events', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as AnalyticsEvent[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
