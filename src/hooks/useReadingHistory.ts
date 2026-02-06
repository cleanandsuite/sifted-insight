import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Article } from '@/lib/database.types';
import { useAuth } from './useAuth';

interface ReadingHistoryState {
  articles: Article[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
}

export function useReadingHistory(limit: number = 50) {
  const { user } = useAuth();
  const [state, setState] = useState<ReadingHistoryState>({
    articles: [],
    loading: false,
    error: null,
    totalCount: 0,
    hasMore: false,
  });

  const fetchReadingHistory = useCallback(async (page: number = 1) => {
    if (!user) {
      setState({ articles: [], loading: false, error: 'Not authenticated', totalCount: 0, hasMore: false });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Use the RPC function to get reading history
      const { data, error } = await supabase
        .rpc('get_reading_history', {
          user_uuid: user.id,
          limit_count: limit * page,
        });

      if (error) throw new Error(error.message);

      const articles = data || [];
      const hasMore = articles.length >= limit * page;

      setState({
        articles,
        loading: false,
        error: null,
        totalCount: articles.length,
        hasMore,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch reading history',
      }));
    }
  }, [user, limit]);

  const markAsRead = useCallback(async (articleId: string) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    try {
      // Try to call the RPC function
      const { error } = await supabase
        .rpc('mark_article_read', {
          user_uuid: user.id,
          article_uuid: articleId,
        });

      if (error) {
        // Fallback: manual insert
        await supabase
          .from('article_interactions')
          .upsert({
            user_id: user.id,
            article_id: articleId,
            interaction_type: 'read',
          }, {
            onConflict: 'user_id, article_id, interaction_type',
            ignoreDuplicates: true,
          });
      }

      // Refresh the reading history
      await fetchReadingHistory();
      
      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : 'Failed to mark article as read' 
      };
    }
  }, [user, fetchReadingHistory]);

  const hasReadArticle = useCallback((articleId: string) => {
    return state.articles.some(article => article.id === articleId);
  }, [state.articles]);

  const clearHistory = useCallback(async () => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    try {
      // Delete all read interactions for this user
      const { error } = await supabase
        .from('article_interactions')
        .delete()
        .eq('user_id', user.id)
        .eq('interaction_type', 'read');

      if (error) throw new Error(error.message);

      setState({
        articles: [],
        loading: false,
        error: null,
        totalCount: 0,
        hasMore: false,
      });

      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : 'Failed to clear history' 
      };
    }
  }, [user]);

  return {
    ...state,
    fetchReadingHistory,
    markAsRead,
    hasReadArticle,
    clearHistory,
    isAuthenticated: !!user,
  };
}
