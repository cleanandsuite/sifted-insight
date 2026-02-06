-- =====================================================
-- SECURITY FIX: Remove SECURITY DEFINER from views
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- FIX: articles_categories_detailed
-- =====================================================

-- Drop existing view
DROP VIEW IF EXISTS public.articles_categories_detailed;

-- Recreate WITHOUT SECURITY DEFINER (removes the security issue)
CREATE OR REPLACE VIEW public.articles_categories_detailed AS
SELECT 
    a.id,
    a.title,
    a.summary,
    a.published_at,
    a.source_id,
    s.name AS source_name,
    COALESCE(
        ARRAY(
            SELECT t.name FROM article_tags at
            JOIN tags t ON at.tag_id = t.id
            WHERE at.article_id = a.id
        ),
        ARRAY[]::TEXT[]
    ) AS tags
FROM articles a
LEFT JOIN sources s ON a.source_id = s.id
WHERE a.status = 'published';

COMMENT ON VIEW public.articles_categories_detailed 
IS 'Articles with categories (tags) - respects RLS policies';

-- =====================================================
-- VERIFY FIX
-- =====================================================

-- Check no SECURITY DEFINER views remain in public schema
SELECT 
    n.nspname AS schema,
    p.proname AS view_name,
    p.prosecurity AS is_security_definer
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.prosecurity = true;

-- Result should be empty (no rows)
