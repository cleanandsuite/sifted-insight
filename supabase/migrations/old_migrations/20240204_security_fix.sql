-- =====================================================
-- SECURITY FIX: Remove SECURITY DEFINER from views
-- Run this in Supabase SQL Editor
-- =====================================================

-- Check for SECURITY DEFINER views
SELECT 
    oid::regprocedure AS procedure_name,
    prosecuritylabel AS security_label
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
    AND prosecuritylabel IS NOT NULL;

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
-- FIX: Any other SECURITY DEFINER views
-- =====================================================

-- For any view created with SECURITY DEFINER, recreate without it
-- Run this to find and fix them:

DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT schemaname, tablename 
        FROM pg_views 
        WHERE schemaname = 'public'
            AND definition LIKE '%SECURITY DEFINER%'
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(view_record.schemaname) || '.' || quote_ident(view_record.tablename);
        RAISE NOTICE 'Dropped view: %.', view_record.s%chemaname, view_record.tablename;
    END LOOP;
END;
$$;

-- =====================================================
-- PREVENTION: How to create views correctly
-- =====================================================

-- WRONG (creates security issue):
-- CREATE SECURITY DEFINER VIEW my_view AS SELECT * FROM articles;

-- CORRECT (respects RLS):
-- CREATE VIEW my_view AS SELECT * FROM articles;

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
