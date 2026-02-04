-- ============================================================================
-- SIFTED INSIGHT HELPER FUNCTIONS
-- Scraping utilities, data management, and integration helpers
-- ============================================================================

-- ============================================================================
-- SCRAPING HELPER FUNCTIONS
-- ============================================================================

-- ============================================================================
-- CHECK AND UPDATE SCRAPE STATUS
-- ============================================================================

CREATE OR REPLACE PROCEDURE start_scrape(source_id UUID)
AS $$
BEGIN
    INSERT INTO scrape_history (source_id, status, started_at)
    VALUES (start_scrape.source_id, 'in_progress', NOW());
    
    UPDATE sources SET 
        last_scrape_at = NOW(),
        updated_at = NOW()
    WHERE id = start_scrape.source_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE complete_scrape(
    source_id UUID,
    articles_found INTEGER,
    articles_new INTEGER,
    articles_updated INTEGER
) AS $$
DECLARE
    history_id UUID;
BEGIN
    -- Get the most recent pending scrape history
    SELECT id INTO history_id
    FROM scrape_history
    WHERE source_id = complete_scrape.source_id
    AND status = 'in_progress'
    ORDER BY started_at DESC
    LIMIT 1;
    
    IF history_id IS NOT NULL THEN
        UPDATE scrape_history SET
            status = 'completed',
            completed_at = NOW(),
            articles_found = complete_scrape.articles_found,
            articles_new = complete_scrape.articles_new,
            articles_updated = complete_scrape.articles_updated
        WHERE id = history_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE fail_scrape(source_id UUID, error_message TEXT)
AS $$
DECLARE
    history_id UUID;
BEGIN
    -- Get the most recent pending scrape history
    SELECT id INTO history_id
    FROM scrape_history
    WHERE source_id = fail_scrape.source_id
    AND status = 'in_progress'
    ORDER BY started_at DESC
    LIMIT 1;
    
    IF history_id IS NOT NULL THEN
        UPDATE scrape_history SET
            status = 'failed',
            completed_at = NOW(),
            error_message = fail_scrape.error_message
        WHERE id = history_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GET NEXT SCRAPE CANDIDATES
-- Returns sources that need scraping based on interval
-- ============================================================================

CREATE OR REPLACE FUNCTION get_scrape_candidates(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    source_id UUID,
    name VARCHAR(255),
    rss_url TEXT,
    priority VARCHAR(20),
    scrape_interval_minutes INTEGER,
    last_scrape_at TIMESTAMP WITH TIME ZONE,
    minutes_since_last_scrape DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.rss_url,
        s.priority,
        s.scrape_interval_minutes,
        s.last_scrape_at,
        EXTRACT(EPOCH FROM (NOW() - s.last_scrape_at)) / 60 AS minutes_since_last_scrape
    FROM sources s
    WHERE s.is_active = true
    AND (
        s.last_scrape_at IS NULL
        OR NOW() > s.last_scrape_at + (s.scrape_interval_minutes || ' minutes')::INTERVAL
    )
    ORDER BY 
        s.priority DESC,
        (s.last_scrape_at IS NULL) DESC, -- Scrape never-scraped sources first
        s.last_scrape_at ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ARTICLE DEDUPLICATION
-- ============================================================================

-- Calculate content hash for deduplication
CREATE OR REPLACE FUNCTION calculate_content_hash(content TEXT)
RETURNS VARCHAR(64) AS $$
BEGIN
    RETURN ENCODE(SHA256(content::BYTEA), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Check if article exists by URL or hash
CREATE OR REPLACE FUNCTION article_exists(
    original_url TEXT,
    content_hash_input VARCHAR(64) DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    exists_by_url BOOLEAN;
    exists_by_hash BOOLEAN;
BEGIN
    -- Check by URL
    SELECT EXISTS (
        SELECT 1 FROM articles WHERE original_url = article_exists.original_url
    ) INTO exists_by_url;
    
    -- Check by hash if provided
    IF content_hash_input IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM articles WHERE content_hash = content_hash_input
        ) INTO exists_by_hash;
    END IF;
    
    RETURN exists_by_url OR COALESCE(exists_by_hash, false);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPSERT ARTICLE FROM SCRAPE
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_article_from_scrape(
    p_title VARCHAR(500),
    p_original_url TEXT,
    p_source_id UUID,
    p_content_raw TEXT,
    p_published_at TIMESTAMP WITH TIME ZONE,
    p_author VARCHAR(255) DEFAULT NULL,
    p_summary TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_article_id UUID;
    article_slug TEXT;
    content_hash_val VARCHAR(64);
    existing_id UUID;
BEGIN
    -- Calculate content hash
    content_hash_val := calculate_content_hash(p_content_raw);
    
    -- Generate slug
    article_slug := generate_article_slug(p_title, p_source_id);
    
    -- Check if exists
    SELECT id INTO existing_id
    FROM articles
    WHERE content_hash = content_hash_val
    OR original_url = p_original_url;
    
    IF existing_id IS NOT NULL THEN
        -- Update existing article
        UPDATE articles SET
            title = p_title,
            slug = article_slug,
            summary = COALESCE(p_summary, summary),
            content_raw = p_content_raw,
            content_hash = content_hash_val,
            content_text = STRIP_HTML(p_content_raw),
            word_count = WORD_COUNT(STRIP_HTML(p_content_raw)),
            scraped_at = NOW(),
            updated_at = NOW()
        WHERE id = existing_id;
        
        RETURN existing_id;
    ELSE
        -- Insert new article
        INSERT INTO articles (
            title,
            slug,
            summary,
            original_url,
            source_id,
            content_raw,
            content_hash,
            published_at,
            author,
            status,
            scraped_at
        ) VALUES (
            p_title,
            article_slug,
            p_summary,
            p_original_url,
            p_source_id,
            p_content_raw,
            content_hash_val,
            p_published_at,
            p_author,
            'pending',
            NOW()
        ) RETURNING id INTO new_article_id;
        
        RETURN new_article_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATA CLEANING FUNCTIONS
-- ============================================================================

-- Strip HTML tags from content
CREATE OR REPLACE FUNCTION strip_html(html_content TEXT)
RETURNS TEXT AS $$
BEGIN
    IF html_content IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN REGEXP_REPLACE(html_content, '<[^>]+>', '', 'g');
END;
$$ LANGUAGE plpgsql;

-- Count words in text
CREATE OR REPLACE FUNCTION word_count(text_content TEXT)
RETURNS INTEGER AS $$
BEGIN
    IF text_content IS NULL THEN
        RETURN 0;
    END IF;
    
    RETURN ARRAY_LENGTH(
        STRING_TO_ARRAY(
            REGEXP_REPLACE(text_content, '\s+', ' ', 'g'),
            ' '
        ),
        1
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SUMMARIES HELPER FUNCTIONS
-- ============================================================================

-- Upsert summary for an article
CREATE OR REPLACE PROCEDURE upsert_summary(
    p_article_id UUID,
    p_summary_type VARCHAR(50) DEFAULT 'standard',
    p_executive_summary TEXT,
    p_key_points JSONB,
    p_analysis TEXT,
    p_takeaways TEXT,
    p_model_used VARCHAR(100),
    p_confidence_score DECIMAL(3, 2),
    p_processing_time_ms INTEGER
) AS $$
DECLARE
    article_word_count INTEGER;
    summary_word_count INTEGER;
    reduction_pct DECIMAL(5, 2);
BEGIN
    -- Calculate word count reduction
    SELECT word_count INTO article_word_count
    FROM articles WHERE id = p_article_id;
    
    summary_word_count := WORD_COUNT(p_executive_summary);
    
    IF article_word_count > 0 THEN
        reduction_pct := ((article_word_count - summary_word_count)::DECIMAL / article_word_count) * 100;
    ELSE
        reduction_pct := 0;
    END IF;
    
    INSERT INTO summaries (
        article_id,
        summary_type,
        executive_summary,
        key_points,
        analysis,
        takeaways,
        model_used,
        confidence_score,
        processing_time_ms,
        word_count_reduction
    ) VALUES (
        p_article_id,
        p_summary_type,
        p_executive_summary,
        p_key_points,
        p_analysis,
        p_takeaways,
        p_model_used,
        p_confidence_score,
        p_processing_time_ms,
        reduction_pct
    ) ON CONFLICT (article_id) DO UPDATE SET
        summary_type = EXCLUDED.summary_type,
        executive_summary = EXCLUDED.executive_summary,
        key_points = EXCLUDED.key_points,
        analysis = EXCLUDED.analysis,
        takeaways = EXCLUDED.takeaways,
        model_used = EXCLUDED.model_used,
        confidence_score = EXCLUDED.confidence_score,
        processing_time_ms = EXCLUDED.processing_time_ms,
        word_count_reduction = EXCLUDED.word_count_reduction,
        updated_at = NOW();
    
    -- Update article status
    UPDATE articles SET status = 'published', updated_at = NOW()
    WHERE id = p_article_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TAGGING HELPER FUNCTIONS
-- ============================================================================

-- Add tags to article (creates tags if they don't exist)
CREATE OR REPLACE PROCEDURE add_tags_to_article(
    p_article_id UUID,
    p_tag_names TEXT[]
) AS $$
DECLARE
    tag_id UUID;
    tag_name TEXT;
BEGIN
    FOREACH tag_name IN ARRAY p_tag_names LOOP
        -- Get or create tag
        SELECT id INTO tag_id
        FROM tags
        WHERE LOWER(name) = LOWER(tag_name)
        LIMIT 1;
        
        IF tag_id IS NULL THEN
            INSERT INTO tags (name, slug)
            VALUES (
                tag_name,
                LOWER(REGEXP_REPLACE(tag_name, '[^a-z0-9]+', '-', 'g'))
            ) RETURNING id INTO tag_id;
        ELSE
            -- Update usage count
            UPDATE tags SET usage_count = usage_count + 1 WHERE id = tag_id;
        END IF;
        
        -- Link to article
        INSERT INTO article_tags (article_id, tag_id)
        VALUES (p_article_id, tag_id)
        ON CONFLICT (article_id, tag_id) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USER INTERACTION FUNCTIONS
-- ============================================================================

-- Record article interaction
CREATE OR REPLACE PROCEDURE record_interaction(
    p_article_id UUID,
    p_user_identifier VARCHAR(255),
    p_interaction_type VARCHAR(50),
    p_interaction_data JSONB DEFAULT '{}'::JSONB
) AS $$
BEGIN
    INSERT INTO article_interactions (
        article_id,
        user_identifier,
        interaction_type,
        interaction_data
    ) VALUES (
        p_article_id,
        p_user_identifier,
        p_interaction_type,
        p_interaction_data
    );
    
    -- Re-calculate engagement score if relevant interaction
    IF p_interaction_type IN ('click', 'save', 'share') THEN
        CALL update_article_ranking(p_article_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERSONALIZATION FUNCTIONS
-- ============================================================================

-- Get personalized article recommendations for a user
CREATE OR REPLACE FUNCTION get_personalized_articles(
    p_user_identifier VARCHAR(255),
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    article_id UUID,
    title TEXT,
    summary TEXT,
    original_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    source_name VARCHAR(255),
    rank_score DECIMAL(10, 6),
    relevance_score DECIMAL(10, 6)
) AS $$
DECLARE
    preferred_sources UUID[];
    excluded_sources UUID[];
    preferred_categories UUID[];
BEGIN
    -- Get user preferences
    SELECT 
        preferred_sources,
        excluded_sources,
        preferred_categories
    INTO preferred_sources, excluded_sources, preferred_categories
    FROM user_preferences
    WHERE user_identifier = p_user_identifier;
    
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.summary,
        a.original_url,
        a.published_at,
        s.name,
        r.rank_score,
        -- Calculate basic relevance (could be enhanced with ML)
        r.rank_score * (
            CASE 
                WHEN preferred_sources IS NULL OR source_id = ANY(preferred_sources) THEN 1.2
                WHEN excluded_sources IS NOT NULL AND source_id = ANY(excluded_sources) THEN 0.1
                ELSE 1.0
            END
        ) as relevance_score
    FROM articles a
    JOIN sources s ON s.id = a.source_id
    LEFT JOIN rankings r ON r.article_id = a.id
    WHERE a.status = 'published'
    AND a.published_at > NOW() - INTERVAL '7 days'
    AND r.rank_score IS NOT NULL
    ORDER BY relevance_score DESC, r.rank_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ANALYTICS HELPER FUNCTIONS
-- ============================================================================

-- Get articles per source (for dashboard)
CREATE OR REPLACE FUNCTION get_articles_per_source(
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    source_name VARCHAR(255),
    source_priority source_priority,
    article_count BIGINT,
    avg_rank_score DECIMAL(10, 6),
    last_article_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.name,
        s.priority,
        COUNT(a.id)::BIGINT as article_count,
        AVG(r.rank_score)::DECIMAL(10, 6) as avg_rank_score,
        MAX(a.published_at) as last_article_at
    FROM sources s
    LEFT JOIN articles a ON a.source_id = s.id
    LEFT JOIN rankings r ON r.article_id = a.id
    WHERE a.published_at > NOW() - (p_days || ' days')::INTERVAL
    AND a.status = 'published'
    GROUP BY s.id, s.name, s.priority
    ORDER BY article_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Get scraping statistics
CREATE OR REPLACE FUNCTION get_scrape_stats(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    source_name VARCHAR(255),
    total_scrapes BIGINT,
    successful_scrapes BIGINT,
    failed_scrapes BIGINT,
    success_rate DECIMAL(5, 2),
    avg_articles_per_scrape DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.name,
        COUNT(sh.id)::BIGINT as total_scrapes,
        COUNT(sh.id) FILTER (WHERE sh.status = 'completed')::BIGINT as successful_scrapes,
        COUNT(sh.id) FILTER (WHERE sh.status = 'failed')::BIGINT as failed_scrapes,
        CASE 
            WHEN COUNT(sh.id) > 0 
            THEN (COUNT(sh.id) FILTER (WHERE sh.status = 'completed')::DECIMAL / COUNT(sh.id)) * 100
            ELSE 0 
        END as success_rate,
        CASE 
            WHEN COUNT(sh.id) FILTER (WHERE sh.status = 'completed') > 0 
            THEN AVG(sh.articles_found) FILTER (WHERE sh.status = 'completed')
            ELSE 0 
        END as avg_articles_per_scrape
    FROM sources s
    LEFT JOIN scrape_history sh ON sh.source_id = s.id
    WHERE sh.started_at > NOW() - (p_days || ' days')::INTERVAL
    GROUP BY s.id, s.name
    ORDER BY total_scrapes DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MAINTENANCE FUNCTIONS
-- ============================================================================

-- Clean up old expired rankings
CREATE OR REPLACE PROCEDure cleanup_expired_rankings()
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rankings 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % expired ranking records', deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Archive old articles
CREATE OR REPLACE PROCEDURE archive_old_articles(
    p_days_old INTEGER DEFAULT 30,
    p_batch_size INTEGER DEFAULT 100
)
AS $$
DECLARE
    archived_count INTEGER := 0;
BEGIN
    UPDATE articles
    SET status = 'archived', updated_at = NOW()
    WHERE status = 'published'
    AND published_at < NOW() - (p_days_old || ' days')::INTERVAL
    LIMIT p_batch_size;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RAISE NOTICE 'Archived % old articles', archived_count;
END;
$$ LANGUAGE plpgsql;

-- Update tag usage counts
CREATE OR REPLACE PROCEDURE update_tag_usage_counts()
AS $$
BEGIN
    UPDATE tags t
    SET usage_count = (
        SELECT COUNT(*) 
        FROM article_tags at 
        WHERE at.tag_id = t.id
    );
    RAISE NOTICE 'Updated tag usage counts';
END;
$$ LANGUAGE plpgsql;
