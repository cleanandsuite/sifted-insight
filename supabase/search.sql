-- ============================================================================
-- SIFTED INSIGHT FULL-TEXT SEARCH SETUP
-- PostgreSQL full-text search for articles with weighted ranking
-- ============================================================================

-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================

-- pg_trgm for fuzzy matching and similarity searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- FULL-TEXT SEARCH VECTOR COLUMN
-- ============================================================================

-- Add generated column for full-text search on articles table
ALTER TABLE articles ADD COLUMN fts tsvector
GENERATED ALWAYS AS (
    -- Title: Highest weight (A) - most important for search relevance
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    
    -- Executive summary: High weight (B) - key content
    setweight(to_tsvector('english', COALESCE(executive_summary, '')), 'B') ||
    
    -- AI Analysis: Medium weight (B) - provides context
    setweight(to_tsvector('english', COALESCE((SELECT analysis FROM summaries WHERE article_id = articles.id), '')), 'B') ||
    
    -- Key points: Medium weight (B) - important takeaways
    setweight(to_tsvector('english', COALESCE((SELECT string_agg(unnest, ' ') FROM (SELECT unnest(key_points) FROM summaries WHERE article_id = articles.id) AS points), '')), 'B') ||
    
    -- Takeaways: Medium weight (B) - actionable insights
    setweight(to_tsvector('english', COALESCE((SELECT string_agg(unnest, ' ') FROM (SELECT unnest(takeaways) FROM summaries WHERE article_id = articles.id) AS takeaways), '')), 'C') ||
    
    -- Tags: Lower weight (C) - helpful but less important
    setweight(to_tsvector('english', COALESCE((SELECT string_agg(unnest, ' ') FROM (SELECT unnest(tags) FROM articles WHERE id = articles.id) AS t), '')), 'C') ||
    
    -- Source name: Low weight (D) - contextual
    setweight(to_tsvector('english', COALESCE((SELECT name FROM sources WHERE id = articles.source_id), '')), 'D') ||
    
    -- Author: Low weight (D) - contextual
    setweight(to_tsvector('english', COALESCE(author, '')), 'D')
) STORED;

-- ============================================================================
-- GIN INDEX FOR FAST SEARCH
-- ============================================================================

-- Main full-text search index
CREATE INDEX articles_fts_idx ON articles USING GIN(fts);

-- Additional indexes for filtering
CREATE INDEX articles_fts_status_idx ON articles(status) WHERE status = 'published';
CREATE INDEX articles_fts_published_idx ON articles(published_at DESC);

-- ============================================================================
-- SIMILARITY INDEX FOR FUZZY SEARCH
-- ============================================================================

CREATE INDEX articles_title_trgm_idx ON articles USING GIN(title gin_trgm_ops);
CREATE INDEX articles_summary_trgm_idx ON articles USING GIN(executive_summary gin_trgm_ops);

-- ============================================================================
-- SEARCH FUNCTION WITH ADVANCED RANKING
-- ============================================================================

CREATE OR REPLACE FUNCTION search_articles(
    query_text TEXT,
    page_num INT DEFAULT 1,
    page_size INT DEFAULT 20,
    status_filter TEXT DEFAULT 'published',
    source_filter UUID DEFAULT NULL,
    date_from TIMESTAMPTZ DEFAULT NULL,
    date_to TIMESTAMPTZ DEFAULT NULL,
    sort_by TEXT DEFAULT 'relevance'  -- 'relevance', 'date', 'rank'
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    executive_summary TEXT,
    original_url TEXT,
    source_id UUID,
    source_name TEXT,
    author TEXT,
    published_at TIMESTAMPTZ,
    rank_score DECIMAL,
    relevance_score REAL,
    ts_headline TEXT,
    match_positions JSONB,
    total_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    offset_val INT;
    ts_query TSQUERY;
    status_condition TEXT;
    source_condition TEXT;
    date_condition TEXT;
BEGIN
    -- Calculate offset for pagination
    offset_val := (page_num - 1) * page_size;
    
    -- Build status filter condition
    IF status_filter IS NOT NULL AND status_filter != '' THEN
        status_condition := 'AND a.status = ' || quote_literal(status_filter);
    ELSE
        status_condition := '';
    END IF;
    
    -- Build source filter condition
    IF source_filter IS NOT NULL THEN
        source_condition := 'AND a.source_id = ' || quote_literal(source_filter::TEXT);
    ELSE
        source_condition := '';
    END IF;
    
    -- Build date range conditions
    IF date_from IS NOT NULL THEN
        date_condition := 'AND a.published_at >= ' || quote_literal(date_from::TEXT);
    ELSE
        date_condition := '';
    END IF;
    
    IF date_to IS NOT NULL THEN
        date_condition := date_condition || ' AND a.published_at <= ' || quote_literal(date_to::TEXT);
    END IF;
    
    -- Parse search query into PostgreSQL tsquery
    -- Handle special characters and quoted phrases
    ts_query := websearch_to_tsquery('english', query_text);
    
    -- Return results with ranking
    RETURN QUERY EXECUTE format(
        $$
        WITH search_results AS (
            SELECT
                a.id,
                a.title,
                a.executive_summary,
                a.original_url,
                a.source_id,
                s.name AS source_name,
                a.author,
                a.published_at,
                r.rank_score,
                -- Calculate relevance score using multiple factors
                (
                    -- Full-text match rank (primary relevance)
                    ts_rank(a.fts, $1) * 1.0 +
                    -- Boost for exact phrase matches
                    ts_rank(a.fts, websearch_to_tsquery('english', '"' || $2 || '"')) * 0.5 +
                    -- Boost for recent articles
                    GREATEST(0, (1.0 - EXTRACT(EPOCH FROM (NOW() - a.published_at)) / 604800)) * 0.3 +
                    -- Boost for higher ranked articles
                    COALESCE(r.rank_score, 0) * 0.2
                ) AS relevance_score,
                -- Generate highlighted snippets
                ts_headline(
                    'english',
                    COALESCE(a.executive_summary, a.title),
                    $1,
                    'MaxWords=50, MinWords=25, StartSel=, StopSel='
                ) AS ts_headline,
                -- Get match positions for highlighting
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'field', field_name,
                            'position', position,
                            'length', length
                        )
                    )
                    FROM (
                        SELECT
                            CASE
                                WHEN starts_with(lexeme, $2) THEN 'title'
                                WHEN position(lexeme IN COALESCE(a.executive_summary, '')) > 0 THEN 'summary'
                                ELSE 'other'
                            END AS field_name,
                            position(lexeme IN COALESCE(a.executive_summary, a.title)) AS position,
                            LENGTH(lexeme) AS length
                        FROM ts_stat(a.fts @@ $1)
                        WHERE lexeme LIKE '%%' || $2 || '%%'
                        LIMIT 10
                    ) matches
                ) AS match_positions,
                COUNT(*) OVER() AS total_count
            FROM articles a
            LEFT JOIN sources s ON a.source_id = s.id
            LEFT JOIN rankings r ON a.id = r.article_id
            WHERE
                a.fts @@ $1
                %s
                %s
                %s
            ORDER BY
                CASE WHEN $4 = 'date' THEN a.published_at END DESC,
                CASE WHEN $4 = 'rank' THEN r.rank_score END DESC,
                CASE WHEN $4 = 'relevance' THEN relevance_score END DESC
        )
        SELECT *
        FROM search_results
        LIMIT %s OFFSET %s
        $$,
        status_condition,
        source_condition,
        date_condition,
        page_size,
        offset_val
    ) USING ts_query, query_text, sort_by;
END;
$$;

-- ============================================================================
-- SIMPLE SEARCH FUNCTION (BASIC USAGE)
-- ============================================================================

CREATE OR REPLACE FUNCTION search_articles_simple(
    query_text TEXT,
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    executive_summary TEXT,
    original_url TEXT,
    source_name TEXT,
    author TEXT,
    published_at TIMESTAMPTZ,
    rank_score DECIMAL,
    relevance_score NUMERIC,
    tags TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.title,
        a.executive_summary,
        a.original_url,
        s.name AS source_name,
        a.author,
        a.published_at,
        r.rank_score,
        ts_rank(a.fts, websearch_to_tsquery('english', query_text)) AS relevance_score,
        a.tags
    FROM articles a
    LEFT JOIN sources s ON a.source_id = s.id
    LEFT JOIN rankings r ON a.id = r.article_id
    WHERE
        a.status = 'published'
        AND a.fts @@ websearch_to_tsquery('english', query_text)
    ORDER BY relevance_score DESC, r.rank_score DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- ============================================================================
-- SUGGESTIONS FUNCTION (AUTOCOMPLETE)
-- ============================================================================

CREATE OR REPLACE FUNCTION search_suggestions(
    query_text TEXT,
    limit_count INT DEFAULT 10
)
RETURNS TABLE(
    suggestion TEXT,
    match_type TEXT,
    article_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    -- Title suggestions (exact and partial matches)
    SELECT
        a.title AS suggestion,
        'title' AS match_type,
        COUNT(*) OVER() AS article_count
    FROM articles a
    WHERE
        a.status = 'published'
        AND a.title ILIKE '%' || query_text || '%'
    GROUP BY a.title
    ORDER BY
        -- Prioritize exact prefix matches
        CASE WHEN a.title ILIKE query_text || '%' THEN 0 ELSE 1 END,
        -- Then by ranking
        COALESCE((SELECT rank_score FROM rankings WHERE article_id = a.id), 0) DESC
    LIMIT limit_count
    
    UNION ALL
    
    -- Tag suggestions
    SELECT
        t.name AS suggestion,
        'tag' AS match_type,
        COUNT(*) OVER() AS article_count
    FROM tags t
    WHERE t.name ILIKE '%' || query_text || '%'
    ORDER BY t.usage_count DESC
    LIMIT 3;
END;
$$;

-- ============================================================================
-- RELATED ARTICLES FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_related_articles(
    article_uuid UUID,
    limit_count INT DEFAULT 5
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    executive_summary TEXT,
    original_url TEXT,
    published_at TIMESTAMPTZ,
    similarity_score REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.title,
        a.executive_summary,
        a.original_url,
        a.published_at,
        -- Calculate similarity using full-text overlap
        (ts_rank(a.fts, ref.fts) + ts_rank(ref.fts, a.fts)) / 2 AS similarity_score
    FROM articles a
    CROSS JOIN (
        SELECT fts FROM articles WHERE id = article_uuid
    ) ref
    WHERE
        a.id != article_uuid
        AND a.status = 'published'
        AND a.fts @@ ref.fts
    ORDER BY similarity_score DESC
    LIMIT limit_count;
END;
$$;

-- ============================================================================
-- SEARCH STATISTICS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_search_stats()
RETURNS TABLE(
    total_articles BIGINT,
    indexed_articles BIGINT,
    last_index_update TIMESTAMPTZ,
    popular_tags JSONB,
    top_sources JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM articles WHERE status = 'published') AS total_articles,
        (SELECT COUNT(*) FROM articles WHERE status = 'published' AND fts IS NOT NULL) AS indexed_articles,
        NOW() AS last_index_update,
        (
            SELECT jsonb_agg(jsonb_build_object('tag', name, 'count', usage_count))
            FROM (
                SELECT name, usage_count
                FROM tags
                ORDER BY usage_count DESC
                LIMIT 20
            ) t
        ) AS popular_tags,
        (
            SELECT jsonb_agg(jsonb_build_object('source', name, 'count', article_count))
            FROM (
                SELECT s.name, COUNT(*) AS article_count
                FROM articles a
                JOIN sources s ON a.source_id = s.id
                WHERE a.status = 'published'
                GROUP BY s.name
                ORDER BY article_count DESC
                LIMIT 10
            ) s
        ) AS top_sources;
END;
$$;

-- ============================================================================
-- INDEX MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to update fts column for existing rows
CREATE OR REPLACE FUNCTION update_fts_column()
RETURNS VOID AS $$
BEGIN
    UPDATE articles
    SET fts = setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
              setweight(to_tsvector('english', COALESCE(executive_summary, '')), 'B');
END;
$$ LANGUAGE plpgsql;

-- Function to reindex all search data
CREATE OR REPLACE FUNCTION reindex_search()
RETURNS VOID AS $$
BEGIN
    -- Reindex the GIN index (locks table, use with caution)
    REINDEX INDEX articles_fts_idx;
    
    -- Update fts column for any missing entries
    UPDATE articles
    SET fts = setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
              setweight(to_tsvector('english', COALESCE(executive_summary, '')), 'B')
    WHERE fts IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANT EXECUTE ON FUNCTIONS (for RLS policies)
-- ============================================================================

-- Note: These will be executed when needed with appropriate permissions
-- GRANT EXECUTE ON FUNCTION search_articles(...) TO authenticated;
-- GRANT EXECUTE ON FUNCTION search_articles_simple(...) TO authenticated, anon;
-- GRANT EXECUTE ON FUNCTION search_suggestions(...) TO anon;
-- GRANT EXECUTE ON FUNCTION get_related_articles(...) TO authenticated, anon;
