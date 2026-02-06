-- =====================================================
-- SIFT User Authentication Schema (Clean Version)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_articles UUID[] DEFAULT '{}',
  read_articles UUID[] DEFAULT '{}',
  preferred_sources UUID[] DEFAULT '{}',
  preferred_categories TEXT[] DEFAULT '{}',
  email_digest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- ARTICLE INTERACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.article_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('saved', 'read', 'liked', 'shared')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id, interaction_type)
);

ALTER TABLE public.article_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions" ON public.article_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON public.article_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions" ON public.article_interactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON public.article_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_article_interactions_user_id ON public.article_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_article_interactions_article_id ON public.article_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_interactions_type ON public.article_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_article_interactions_created ON public.article_interactions(created_at DESC);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION get_saved_articles(user_uuid UUID)
RETURNS SETOF public.articles AS $$
  SELECT a.* FROM public.articles a
  INNER JOIN public.article_interactions ai ON a.id = ai.article_id
  WHERE ai.user_id = user_uuid AND ai.interaction_type = 'saved'
  ORDER BY ai.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_reading_history(user_uuid UUID, limit_count INT DEFAULT 50)
RETURNS SETOF public.articles AS $$
  SELECT a.* FROM public.articles a
  INNER JOIN public.article_interactions ai ON a.id = ai.article_id
  WHERE ai.user_id = user_uuid AND ai.interaction_type = 'read'
  ORDER BY ai.created_at DESC
  LIMIT limit_count;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_article_saved(user_uuid UUID, article_uuid UUID)
RETURNS VOID AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.article_interactions 
    WHERE user_id = user_uuid AND article_id = article_uuid AND interaction_type = 'saved'
  ) THEN
    DELETE FROM public.article_interactions 
    WHERE user_id = user_uuid AND article_id = article_uuid AND interaction_type = 'saved';
  ELSE
    INSERT INTO public.article_interactions (user_id, article_id, interaction_type)
    VALUES (user_uuid, article_uuid, 'saved');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_article_read(user_uuid UUID, article_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.article_interactions (user_id, article_id, interaction_type)
  VALUES (user_uuid, article_uuid, 'read')
  ON CONFLICT (user_id, article_id, interaction_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
