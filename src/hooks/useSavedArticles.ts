import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SavedArticle {
  id: string;
  title: string;
  original_url: string;
  image_url: string | null;
  published_at: string;
  source_id: string | null;
  author: string | null;
  saved_at?: string;
}

interface SavedArticlesState {
  articles: SavedArticle[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

export function useSavedArticles() {
  const { user } = useAuth();
  const [state, setState] = useState<SavedArticlesState>({
    articles: [],
    loading: false,
    error: null,
    totalCount: 0,
  });

  const fetchSavedArticles = useCallback(async () => {
    if (!user) {
      setState({ articles: [], loading: false, error: 'Not authenticated', totalCount: 0 });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Query bookmarks table with article details
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
            source_id,
            author
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      // Transform the data
      const articles: SavedArticle[] = (data || [])
        .filter((item: { articles: unknown }) => item.articles)
        .map((item: { articles: SavedArticle; created_at: string }) => ({
          ...(item.articles as SavedArticle),
          saved_at: item.created_at,
        }));

      setState({
        articles,
        loading: false,
        error: null,
        totalCount: articles.length,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch saved articles',
      }));
    }
  }, [user]);

  const toggleSaved = useCallback(async (articleId: string) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    try {
      // Check if already saved
      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_id', articleId)
        .single();

      if (existing) {
        // Remove saved bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);

        if (error) throw new Error(error.message);
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            article_id: articleId,
          });

        if (error) throw new Error(error.message);
      }

      // Refresh the saved articles list
      await fetchSavedArticles();
      
      return { error: null, isSaved: !existing };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : 'Failed to toggle saved status' 
      };
    }
  }, [user, fetchSavedArticles]);

  const isArticleSaved = useCallback((articleId: string) => {
    return state.articles.some(article => article.id === articleId);
  }, [state.articles]);

  return {
    ...state,
    fetchSavedArticles,
    toggleSaved,
    isArticleSaved,
    isAuthenticated: !!user,
  };
}
