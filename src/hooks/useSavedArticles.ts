import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Article, ArticleInteraction } from '@/lib/database.types';
import { useAuth } from './useAuth';

interface SavedArticlesState {
  articles: Article[];
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
      // Use the RPC function to get saved articles
      const { data, error } = await supabase
        .rpc('get_saved_articles', { user_uuid: user.id });

      if (error) throw new Error(error.message);

      setState({
        articles: data || [],
        loading: false,
        error: null,
        totalCount: data?.length || 0,
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
      // Try to call the toggle function
      const { data, error } = await supabase
        .rpc('toggle_article_saved', {
          user_uuid: user.id,
          article_uuid: articleId,
        });

      if (error) {
        // Fallback: manual toggle
        // Check if already saved
        const { data: existing } = await supabase
          .from('article_interactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('article_id', articleId)
          .eq('interaction_type', 'saved')
          .single();

        if (existing) {
          // Remove saved interaction
          await supabase
            .from('article_interactions')
            .delete()
            .eq('user_id', user.id)
            .eq('article_id', articleId)
            .eq('interaction_type', 'saved');
        } else {
          // Add saved interaction
          await supabase
            .from('article_interactions')
            .insert({
              user_id: user.id,
              article_id: articleId,
              interaction_type: 'saved',
            });
        }
      }

      // Refresh the saved articles list
      await fetchSavedArticles();
      
      return { error: null, isSaved: data };
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
