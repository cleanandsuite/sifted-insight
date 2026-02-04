import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate a session ID for tracking
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const sessionId = useRef(getSessionId());

  const trackEvent = useCallback(async (
    eventType: string,
    articleId?: string,
    metadata?: Record<string, string | number | boolean>
  ) => {
    try {
      await supabase.from('analytics_events').insert([{
        event_type: eventType,
        article_id: articleId || null,
        user_session_id: sessionId.current,
        metadata: (metadata || {}) as Record<string, string | number | boolean>,
      }]);
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics tracking failed:', error);
    }
  }, []);

  const trackPageView = useCallback((path: string, articleId?: string) => {
    trackEvent('page_view', articleId, { path });
  }, [trackEvent]);

  const trackArticleRead = useCallback((articleId: string, readTimeSeconds: number) => {
    trackEvent('article_read', articleId, { read_time_seconds: readTimeSeconds });
  }, [trackEvent]);

  const trackArticleClick = useCallback((articleId: string) => {
    trackEvent('article_click', articleId);
  }, [trackEvent]);

  const trackShare = useCallback((articleId: string, platform: string) => {
    trackEvent('share', articleId, { platform });
  }, [trackEvent]);

  const trackBookmark = useCallback((articleId: string, action: 'add' | 'remove') => {
    trackEvent('bookmark', articleId, { action });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent('search', undefined, { query, results_count: resultsCount });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackArticleRead,
    trackArticleClick,
    trackShare,
    trackBookmark,
    trackSearch,
  };
};

// Hook to track page views automatically
export const usePageViewTracking = (path: string, articleId?: string) => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(path, articleId);
  }, [path, articleId, trackPageView]);
};
