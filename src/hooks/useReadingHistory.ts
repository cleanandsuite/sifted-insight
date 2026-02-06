import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReadingHistoryArticle {
  id: string;
  title: string;
  original_url: string;
  image_url: string | null;
  published_at: string;
  source_id: string | null;
  read_at?: string;
}

interface ReadingHistoryState {
  articles: ReadingHistoryArticle[];
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
      // Query bookmarks table for read articles
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          created_at,
          article_id,
          articles (
            id,
            title,
            original_url,
            image_url,
            published_at,
            source_id
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw new Error(error.message);

      // Transform the data
      const articles: ReadingHistoryArticle[] = (data || [])
        .filter((item: { articles: unknown }) => item.articles)
        .map((item: { articles: ReadingHistoryArticle; created_at: string }) => ({
          ...(item.articles as ReadingHistoryArticle),
          read_at: item.created_at,
        }));
      
      const hasMore = articles.length >= limit;

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
      // Insert into bookmarks table
      const { error } = await supabase
        .from('bookmarks')
        .upsert({
          user_id: user.id,
          article_id: articleId,
        }, {
          onConflict: 'user_id,article_id',
          ignoreDuplicates: true,
        });

      if (error) throw new Error(error.message);

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
      // Delete all bookmarks for this user
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id);

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
