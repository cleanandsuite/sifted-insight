-- =====================================================
-- SIFT Full-Text Search Setup (Fixed for your schema)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ADD FULL-TEXT SEARCH COLUMN TO ARTICLES
-- =====================================================
ALTER TABLE articles ADD COLUMN IF NOT EXISTS fts tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'C')
) STORED;

-- =====================================================
-- CREATE INDEX
-- =====================================================
CREATE INDEX IF NOT EXISTS articles_fts_idx ON articles USING GIN(fts);

-- =====================================================
-- UPDATE EXISTING DATA
-- =====================================================
UPDATE articles SET fts = 
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'C')
WHERE fts IS NULL;

-- =====================================================
-- SEARCH FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION search_articles(
    query_text TEXT,
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0,
    date_from TIMESTAMPTZ DEFAULT NULL,
    date_to TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    summary TEXT,
    original_url TEXT,
    source_id UUID,
    source_name TEXT,
    author TEXT,
    published_at TIMESTAMPTZ,
    rank_score NUMERIC,
    relevance_score NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.summary,
        a.original_url,
        a.source_id,
        s.name AS source_name,
        a.author,
        a.published_at,
        COALESCE(r.rank_score, 0) AS rank_score,
        ts_rank(a.fts, websearch_to_tsquery('english', query_text))::NUMERIC AS relevance_score
    FROM articles a
    LEFT JOIN sources s ON a.source_id = s.id
    LEFT JOIN rankings r ON a.id = r.article_id
    WHERE a.status = 'published'
        AND a.fts @@ websearch_to_tsquery('english', query_text)
        AND (date_from IS NULL OR a.published_at >= date_from)
        AND (date_to IS NULL OR a.published_at <= date_to)
    ORDER BY relevance_score DESC, a.published_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- =====================================================
-- SIMPLE SEARCH FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION search_articles_simple(
    query_text TEXT,
    limit_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    summary TEXT,
    published_at TIMESTAMPTZ,
    relevance_score NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.summary,
        a.published_at,
        ts_rank(a.fts, websearch_to_tsquery('english', query_text))::NUMERIC AS relevance_score
    FROM articles a
    WHERE a.status = 'published'
        AND a.fts @@ websearch_to_tsquery('english', query_text)
    ORDER BY relevance_score DESC
    LIMIT limit_count;
END;
$$;

-- =====================================================
-- SEARCH SUGGESTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION search_suggestions(
    partial_text TEXT,
    limit_count INT DEFAULT 5
)
RETURNS TABLE (
    suggestion TEXT,
    article_id UUID,
    title TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        LEFT(LOWER(a.title), 50) AS suggestion,
        a.id,
        a.title
    FROM articles a
    WHERE a.status = 'published'
        AND LOWER(a.title) LIKE '%' || LOWER(partial_text) || '%'
    ORDER BY a.published_at DESC
    LIMIT limit_count;
END;
$$;

-- =====================================================
-- GET SEARCH STATS
-- =====================================================
CREATE OR REPLACE FUNCTION get_search_stats()
RETURNS TABLE (
    total_articles INT,
    indexed_articles INT,
    last_indexed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INT AS total_articles,
        COUNT(CASE WHEN fts IS NOT NULL THEN 1 END)::INT AS indexed_articles,
        NOW() AS last_indexed_at
    FROM articles;
END;
$$;

COMMENT ON FUNCTION search_articles IS 'Full-text search with pagination and date filters';
COMMENT ON FUNCTION search_articles_simple IS 'Simple search without filters';
COMMENT ON FUNCTION search_suggestions IS 'Autocomplete suggestions based on article titles';
COMMENT ON FUNCTION get_search_stats IS 'Returns search index statistics';
