import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These should be set as environment variables in Vite:
// VITE_SUPABASE_URL
// VITE_SUPABASE_ANON_KEY

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jmhtzyctxntaojuovrtf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for type-safe queries
export type { Database } from './database.types';

// Article queries
export const articles = {
  // Get featured article (highest ranked)
  getFeatured: async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, sources(*)')
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('rank_score', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get regular articles (not featured)
  getRegular: async (limit = 10) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, sources(*)')
      .eq('status', 'published')
      .not('id', 'in', 'SELECT id FROM articles WHERE is_featured = true')
      .order('rank_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get article by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, sources(*), summaries(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get articles by source
  getBySource: async (sourceId: string, limit = 10) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, sources(*)')
      .eq('source_id', sourceId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get articles by tag
  getByTag: async (tag: string, limit = 10) => {
    const { data, error } = await supabase
      .from('articles')
      .select('*, sources(*)')
      .eq('status', 'published')
      .ilike('tags', `%${tag}%`)
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get trending articles (high engagement)
  getTrending: async (hours = 24, limit = 10) => {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('articles')
      .select('*, sources(*)')
      .eq('status', 'published')
      .gte('published_at', since)
      .order('engagement_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
};

// Sources queries
export const sources = {
  // Get all active sources
  getAll: async () => {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get source by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('sources')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Rankings queries
export const rankings = {
  // Get ranking factors for an article
  getFactors: async (articleId: string) => {
    const { data, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('article_id', articleId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get top ranked articles
  getTop: async (limit = 10) => {
    const { data, error } = await supabase
      .from('rankings')
      .select('*, articles(*)')
      .order('rank_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
};

// Re-rank all articles (admin function)
export const reRankAll = async () => {
  const { data, error } = await supabase
    .rpc('recalculate_all_rankings');
  
  if (error) throw error;
  return data;
};

// Subscribe to new articles (real-time)
export const subscribeToNewArticles = (callback: (payload: unknown) => void) => {
  return supabase
    .channel('articles')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'articles' },
      callback
    )
    .subscribe();
};

export default supabase;
