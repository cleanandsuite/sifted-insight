-- ============================================================================
-- SIFTED INSIGHT RANKING ALGORITHM
-- Dynamic ranking based on recency, authority, engagement, and content quality
-- ============================================================================

-- ============================================================================
-- CONFIGURATION TABLE
-- Ranking weights and parameters (adjustable without code changes)
-- ============================================================================

CREATE TABLE ranking_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    
    -- Weight configuration (must sum to approximately 1.0)
    recency_weight DECIMAL(5, 3) DEFAULT 0.40,
    authority_weight DECIMAL(5, 3) DEFAULT 0.30,
    engagement_weight DECIMAL(5, 3) DEFAULT 0.15,
    content_weight DECIMAL(5, 3) DEFAULT 0.15,
    
    -- Time decay settings
    half_life_hours INTEGER DEFAULT 24, -- Score halves after this many hours
    max_age_days INTEGER DEFAULT 7, -- Articles older than this are excluded
    
    -- Score normalization
    min_score DECIMAL(10, 6) DEFAULT 0,
    max_score DECIMAL(10, 6) DEFAULT 100,
    
    -- Thresholds
    hot_threshold DECIMAL(10, 6) DEFAULT 75,
    rising_threshold DECIMAL(10, 6) DEFAULT 50,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default ranking configuration
INSERT INTO ranking_config (name, description, recency_weight, authority_weight, engagement_weight, content_weight, half_life_hours, max_age_days)
VALUES ('default', 'Default ranking configuration for Sifted Insight',
        0.40, 0.30, 0.15, 0.15, 24, 7);

-- ============================================================================
-- SOURCE AUTHORITY TABLE
-- Pre-computed authority scores for each source
-- ============================================================================

CREATE TABLE source_authority (
    source_id UUID PRIMARY KEY REFERENCES sources(id) ON DELETE CASCADE,
    authority_score DECIMAL(10, 6) NOT NULL DEFAULT 50,
    domain_age_years DECIMAL(5, 2),
    monthly_traffic_estimate VARCHAR(50),
    editorial_quality_score DECIMAL(3, 2),
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT authority_score_range CHECK (authority_score BETWEEN 0 AND 100)
);

COMMENT ON TABLE source_authority IS 'Pre-computed authority metrics for news sources';
COMMENT ON COLUMN source_authority.authority_score IS 'Overall authority score (0-100) based on multiple factors';

-- Initialize source authority from sources table
INSERT INTO source_authority (source_id, authority_score, editorial_quality_score)
SELECT s.id, 
       CASE s.priority
           WHEN 'critical' THEN 100
           WHEN 'high' THEN 80
           WHEN 'medium' THEN 60
           WHEN 'low' THEN 40
       END,
       CASE s.priority
           WHEN 'critical' THEN 1.0
           WHEN 'high' THEN 0.95
           WHEN 'medium' THEN 0.85
           WHEN 'low' THEN 0.70
       END
FROM sources s
ON CONFLICT (source_id) DO UPDATE SET 
    authority_score = EXCLUDED.authority_score,
    editorial_quality_score = EXCLUDED.editorial_quality_score,
    last_calculated_at = NOW();

-- ============================================================================
-- RECENCY SCORE FUNCTION
-- Calculates score based on publication time using exponential decay
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_recency_score(
    published_at TIMESTAMP WITH TIME ZONE,
    half_life_hours INTEGER DEFAULT 24
) RETURNS DECIMAL(10, 6) AS $$
DECLARE
    age_hours DECIMAL(10, 2);
    score DECIMAL(10, 6);
BEGIN
    -- Calculate age in hours
    age_hours := EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600;
    
    -- Exponential decay: score = 100 * (0.5)^(age / half_life)
    score := 100 * POWER(0.5, age_hours / half_life_hours::DECIMAL);
    
    -- Clamp to valid range
    RETURN GREATEST(LEAST(score, 100), 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTHORITY SCORE FUNCTION
-- Looks up source authority or calculates from priority
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_authority_score(
    source_id UUID
) RETURNS DECIMAL(10, 6) AS $$
DECLARE
    authority DECIMAL(10, 6);
BEGIN
    SELECT COALESCE(sa.authority_score, 50) INTO authority
    FROM source_authority sa
    WHERE sa.source_id = calculate_authority_score.source_id;
    
    RETURN COALESCE(authority, 50);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ENGAGEMENT SCORE FUNCTION
-- Calculates engagement from interaction data
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_engagement_score(
    article_id UUID
) RETURNS DECIMAL(10, 6) AS $$
DECLARE
    view_count INTEGER := 0;
    click_count INTEGER := 0;
    save_count INTEGER := 0;
    share_count INTEGER := 0;
    dismiss_count INTEGER := 0;
    score DECIMAL(10, 6);
BEGIN
    -- Aggregate interactions from the last 7 days
    SELECT 
        COUNT(*) FILTER (WHERE interaction_type = 'view'),
        COUNT(*) FILTER (WHERE interaction_type = 'click'),
        COUNT(*) FILTER (WHERE interaction_type = 'save'),
        COUNT(*) FILTER (WHERE interaction_type = 'share'),
        COUNT(*) FILTER (WHERE interaction_type = 'dismiss')
    INTO view_count, click_count, save_count, share_count, dismiss_count
    FROM article_interactions
    WHERE article_id = calculate_engagement_score.article_id
    AND created_at > NOW() - INTERVAL '7 days';
    
    -- Weighted engagement calculation
    -- Shares are most valuable, then saves, clicks, views
    -- Dismisses reduce score slightly
    score := (
        (view_count * 1) +
        (click_count * 3) +
        (save_count * 5) +
        (share_count * 10) -
        (dismiss_count * 2)
    )::DECIMAL;
    
    -- Normalize to 0-100 scale (assuming 50 interactions is "average")
    score := LEAST(100, GREATEST(0, score * 2));
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CONTENT SCORE FUNCTION
-- Evaluates content quality and depth
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_content_score(
    article_id UUID
) RETURNS DECIMAL(10, 6) AS $$
DECLARE
    word_count INTEGER;
    has_summary BOOLEAN;
    summary_length INTEGER;
    score DECIMAL(10, 6) := 50; -- Base score
BEGIN
    -- Get article content metrics
    SELECT 
        a.word_count,
        (s.id IS NOT NULL),
        COALESCE(LENGTH(s.executive_summary), 0)
    INTO word_count, has_summary, summary_length
    FROM articles a
    LEFT JOIN summaries s ON s.article_id = a.id
    WHERE a.id = calculate_content_score.article_id;
    
    -- Word count contribution (optimal range: 500-2000 words)
    IF word_count IS NOT NULL THEN
        IF word_count BETWEEN 500 AND 2000 THEN
            score := score + 20; -- Good length
        ELSIF word_count BETWEEN 200 AND 500 THEN
            score := score + 10; -- Acceptable length
        ELSIF word_count > 2000 THEN
            score := score + 15; -- Comprehensive but may be too long
        END IF;
    END IF;
    
    -- Summary presence bonus
    IF has_summary THEN
        score := score + 20;
        
        -- Bonus for substantial summaries
        IF summary_length > 200 THEN
            score := score + 10;
        END IF;
    END IF;
    
    RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MAIN RANKING CALCULATION FUNCTION
-- Combines all factors into final rank score
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_article_rank_score(
    article_id UUID,
    config_id UUID DEFAULT NULL
) RETURNS DECIMAL(10, 6) AS $$
DECLARE
    cfg RECORD;
    recency_score DECIMAL(10, 6);
    authority_score DECIMAL(10, 6);
    engagement_score DECIMAL(10, 6);
    content_score DECIMAL(10, 6);
    total_score DECIMAL(10, 6);
BEGIN
    -- Get configuration (use default if not specified)
    SELECT * INTO cfg
    FROM ranking_config
    WHERE is_active = true
    AND (config_id IS NULL OR id = config_id)
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Get individual component scores
    SELECT calculate_recency_score(a.published_at, cfg.half_life_hours),
           calculate_authority_score(a.source_id)
    INTO recency_score, authority_score
    FROM articles a
    WHERE a.id = calculate_article_rank_score.article_id;
    
    engagement_score := calculate_engagement_score(article_id);
    content_score := calculate_content_score(article_id);
    
    -- Weighted combination
    total_score := (
        (recency_score * cfg.recency_weight) +
        (authority_score * cfg.authority_weight) +
        (engagement_score * cfg.engagement_weight) +
        (content_score * cfg.content_weight)
    );
    
    RETURN ROUND(total_score, 6);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATE ARTICLE RANKING PROCEDURE
-- Updates the rankings table for a single article
-- ============================================================================

CREATE OR REPLACE PROCEDURE update_article_ranking(
    article_id UUID,
    config_id UUID DEFAULT NULL
) AS $$
DECLARE
    cfg RECORD;
    recency_score DECIMAL(10, 6);
    authority_score DECIMAL(10, 6);
    engagement_score DECIMAL(10, 6);
    content_score DECIMAL(10, 6);
    total_score DECIMAL(10, 6);
    rank_tier VARCHAR(20);
BEGIN
    -- Get configuration
    SELECT * INTO cfg
    FROM ranking_config
    WHERE is_active = true
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Calculate component scores
    SELECT calculate_recency_score(a.published_at, cfg.half_life_hours),
           calculate_authority_score(a.source_id)
    INTO recency_score, authority_score
    FROM articles a
    WHERE a.id = update_article_ranking.article_id;
    
    engagement_score := calculate_engagement_score(article_id);
    content_score := calculate_content_score(article_id);
    
    -- Calculate total score
    total_score := (
        (recency_score * cfg.recency_weight) +
        (authority_score * cfg.authority_weight) +
        (engagement_score * cfg.engagement_weight) +
        (content_score * cfg.content_weight)
    );
    
    -- Determine tier
    IF total_score >= cfg.hot_threshold THEN
        rank_tier := 'hot';
    ELSIF total_score >= cfg.rising_threshold THEN
        rank_tier := 'rising';
    ELSE
        rank_tier := 'steady';
    END IF;
    
    -- Upsert ranking
    INSERT INTO rankings (
        article_id, rank_score, recency_score, authority_score,
        engagement_score, content_score, rank_tier,
        ranking_factors, expires_at
    ) VALUES (
        article_id, ROUND(total_score, 6), 
        ROUND(recency_score, 6), ROUND(authority_score, 6),
        ROUND(engagement_score, 6), ROUND(content_score, 6), rank_tier,
        jsonb_build_object(
            'config_id', cfg.id,
            'config_name', cfg.name,
            'half_life_hours', cfg.half_life_hours,
            'calculated_at', NOW()::TEXT
        ),
        NOW() + (cfg.max_age_days || ' days')::INTERVAL
    )
    ON CONFLICT (article_id) DO UPDATE SET
        rank_score = EXCLUDED.rank_score,
        recency_score = EXCLUDED.recency_score,
        authority_score = EXCLUDED.authority_score,
        engagement_score = EXCLUDED.engagement_score,
        content_score = EXCLUDED.content_score,
        rank_tier = EXCLUDED.rank_tier,
        ranking_factors = EXCLUDED.ranking_factors,
        expires_at = EXCLUDED.expires_at,
        computed_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- BULK RANKING UPDATE PROCEDURE
-- Re-ranks all eligible articles (call via cron or scheduled task)
-- ============================================================================

CREATE OR REPLACE PROCEDURE re_rank_all_articles(
    batch_size INTEGER DEFAULT 100,
    max_age_days INTEGER DEFAULT 7
) AS $$
DECLARE
    article_cursor CURSOR FOR
        SELECT id FROM articles
        WHERE status = 'published'
        AND published_at > NOW() - (max_age_days || ' days')::INTERVAL
        ORDER BY published_at DESC
        LIMIT batch_size;
    article_id UUID;
    count INTEGER := 0;
BEGIN
    OPEN article_cursor;
    
    LOOP
        FETCH article_cursor INTO article_id;
        EXIT WHEN NOT FOUND;
        
        CALL update_article_ranking(article_id);
        count := count + 1;
    END LOOP;
    
    CLOSE article_cursor;
    
    RAISE NOTICE 'Re-ranked % articles', count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATE RANK POSITIONS PROCEDURE
-- Assigns rank positions based on current scores
-- ============================================================================

CREATE OR REPLACE PROCEDURE update_rank_positions(
    days_lookback INTEGER DEFAULT 7
) AS $$
BEGIN
    -- Update rank positions within each day
    WITH ranked AS (
        SELECT 
            r.id,
            ROW_NUMBER() OVER (
                PARTITION BY DATE_TRUNC('day', a.published_at)
                ORDER BY r.rank_score DESC
            ) as position
        FROM rankings r
        JOIN articles a ON a.id = r.article_id
        WHERE a.published_at > NOW() - (days_lookback || ' days')::INTERVAL
    )
    UPDATE rankings r
    SET rank_position = ranked.position
    FROM ranked
    WHERE r.id = ranked.id;
    
    RAISE NOTICE 'Updated rank positions for articles from past % days', days_lookback;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER VIEW: Current Rankings
-- ============================================================================

CREATE OR REPLACE VIEW v_current_rankings AS
SELECT 
    r.rank_score,
    r.rank_tier,
    r.rank_position,
    r.recency_score,
    r.authority_score,
    r.engagement_score,
    r.content_score,
    a.title,
    a.original_url,
    a.published_at,
    s.name as source_name,
    s.priority as source_priority,
    r.computed_at,
    r.expires_at
FROM rankings r
JOIN articles a ON a.id = r.article_id
JOIN sources s ON s.id = a.source_id
WHERE r.expires_at IS NULL OR r.expires_at > NOW()
AND a.status = 'published'
ORDER BY r.rank_score DESC;

COMMENT ON VIEW v_current_rankings IS 'Current article rankings with all component scores';

-- ============================================================================
-- HELPER VIEW: Top Rising Articles
-- ============================================================================

CREATE OR REPLACE VIEW v_rising_articles AS
SELECT 
    r.rank_score,
    r.rank_tier,
    a.title,
    a.original_url,
    a.published_at,
    s.name as source_name,
    r.engagement_score,
    r.recency_score,
    (r.engagement_score - r.recency_score) as momentum_score
FROM rankings r
JOIN articles a ON a.id = r.article_id
JOIN sources s ON s.id = a.source_id
WHERE r.rank_tier IN ('rising', 'hot')
AND r.expires_at IS NULL OR r.expires_at > NOW()
AND a.published_at > NOW() - INTERVAL '3 days'
ORDER BY momentum_score DESC, r.rank_score DESC
LIMIT 20;

COMMENT ON VIEW v_rising_articles IS 'Articles gaining momentum (high engagement relative to recency)';
