-- ============================================================================
-- SIFTED INSIGHT RANKING ALGORITHM v2
-- "Gravity & Velocity" Model - Prioritizes Signal Over Noise
-- Inspired by Hacker News, Reddit algorithms
-- ============================================================================

-- ============================================================================
-- CONFIGURATION TABLE (Enhanced)
-- ============================================================================

CREATE TABLE ranking_config_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    
    -- Velocity settings (engagement rate)
    velocity_weight DECIMAL(5, 3) DEFAULT 0.40,  -- How fast engagement matters
    velocity_decay_hours INTEGER DEFAULT 4,        -- Engagement decays over 4 hours
    
    -- Value settings (inherent quality)
    authority_weight DECIMAL(5, 3) DEFAULT 0.20,  -- Source credibility
    utility_weight DECIMAL(5, 3) DEFAULT 0.40,      -- Summary quality (MOST IMPORTANT)
    
    -- Gravity (time decay)
    gravity_hours INTEGER DEFAULT 8,    -- Base gravity (half-life)
    max_age_days INTEGER DEFAULT 30,      -- Articles older than this are excluded
    
    -- Bonuses
    viral_bonus_threshold INTEGER DEFAULT 100,  -- Engagement hits = viral bonus
    viral_multiplier DECIMAL(5, 3) DEFAULT 1.5, -- 1.5x boost for viral content
    
    is_active BOOLEAN DEFAULT FALSE,      -- v2 starts inactive
    is_default BOOLEAN DEFAULT FALSE,     -- Only one default at a time
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert v2 configuration
INSERT INTO ranking_config_v2 (name, description, velocity_weight, authority_weight, utility_weight, gravity_hours, is_active)
VALUES (
    'gravity_velocity',
    'Gravity & Velocity model - Prioritizes signal over noise. Best for quality-focused feeds.',
    0.40,  -- Velocity: 40% - Engagement rate matters most
    0.20,  -- Authority: 20% - Reduced to avoid echo chamber
    0.40,  -- Utility: 40% - Summary quality is KING for summary sites
    8,     -- Gravity: 8 hours half-life
    TRUE
);

-- ============================================================================
-- ENHANCED RANKINGS TABLE
-- ============================================================================

DROP TABLE IF EXISTS rankings CASCADE;
DROP TABLE IF EXISTS rankings_v2 CASCADE;

CREATE TABLE rankings_v2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    
    -- Velocity metrics (rate of engagement)
    velocity_score DECIMAL(10, 6) DEFAULT 0,         -- engagement^(age+2)
    engagement_rate DECIMAL(10, 6) DEFAULT 0,        -- engagement per hour
    views_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    
    -- Value metrics (inherent quality)
    value_score DECIMAL(10, 6) DEFAULT 0,            -- Final combined score
    authority_score DECIMAL(10, 6) DEFAULT 0,        -- Source authority (0-100)
    utility_score DECIMAL(10, 6) DEFAULT 0,          -- Summary utility ratio
    
    -- Component scores
    hotness_score DECIMAL(10, 6) DEFAULT 0,         -- engagement^(age+2)
    gravity_score DECIMAL(10, 6) DEFAULT 0,          -- Time decay factor
    
    -- Rankings
    sift_score DECIMAL(10, 6) DEFAULT 0,          -- Final score (0-100)
    velocity_rank INTEGER DEFAULT 0,                  -- Rank by trending
    value_rank INTEGER DEFAULT 0,                    -- Rank by quality
    overall_rank INTEGER DEFAULT 0,                  -- Combined rank
    
    -- Metadata
    is_trending BOOLEAN DEFAULT FALSE,               -- High velocity
    is_quality_pick BOOLEAN DEFAULT FALSE,          -- High value
    is_viral BOOLEAN DEFAULT FALSE,                 -- Viral bonus applied
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT positive_scores CHECK (
        velocity_score >= 0 AND 
        value_score >= 0 AND 
        sift_score >= 0
    )
);

-- Indexes for performance
CREATE INDEX idx_rankings_v2_article ON rankings_v2(article_id);
CREATE INDEX idx_rankings_v2_sift_score ON rankings_v2(sift_score DESC);
CREATE INDEX idx_rankings_v2_velocity ON rankings_v2(velocity_score DESC);
CREATE INDEX INDEX idx_rankings_v2_value ON rankings_v2(value_score DESC);
CREATE INDEX idx_rankings_v2_calculated ON rankings_v2(calculated_at DESC);

COMMENT ON TABLE rankings_v2 IS 'Gravity & Velocity ranking system v2';
COMMENT ON COLUMN rankings_v2.velocity_score IS 'Engagement raised to (age+2) - rewards viral hits';
COMMENT ON COLUMN rankings_v2.utility_score IS '(Original Words / Summary Words) - higher = better summary';
COMMENT ON COLUMN rankings_v2.sift_score IS 'Final score: (Hotness×0.7) + (Value×0.3)';

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Calculate time decay factor (gravity)
-- Articles lose score over time, but quality articles sustain better
CREATE OR REPLACE FUNCTION calculate_gravity(
    age_hours DECIMAL,
    quality_bonus DECIMAL DEFAULT 1.0
)
RETURNS DECIMAL(10, 6)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Gravity formula: quality articles decay slower
    -- Base decay is exponential: e^(-t/8hours)
    -- Quality bonus (0.8-1.2) slows decay for better content
    RETURN EXP(-age_hours / (8 * quality_bonus))::DECIMAL(10, 6);
END;
$$;

-- Calculate velocity (engagement rate with exponential bonus)
CREATE OR REPLACE FUNCTION calculate_velocity(
    total_engagement INTEGER,
    age_hours DECIMAL
)
RETURNS DECIMAL(10, 6)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Velocity formula: engagement^(age+2)
    -- Adding 2 prevents division by zero and gives grace period
    -- This means new articles with zero engagement get a small base score
    RETURN POWER(GREATEST(total_engagement + 1, 1)::DECIMAL, 
                  GREATEST(age_hours + 2, 2)::DECIMAL)::DECIMAL(10, 6);
END;
$$;

-- Calculate utility (summary effectiveness)
CREATE OR REPLACE FUNCTION calculate_utility(
    original_word_count INTEGER,
    summary_word_count INTEGER,
    has_image BOOLEAN DEFAULT FALSE,
    has_tags BOOLEAN DEFAULT FALSE
)
RETURNS DECIMAL(10, 6)
LANGUAGE plpgsql
AS $$
DECLARE
    word_ratio DECIMAL(10, 6);
BEGIN
    -- Utility: How much time did we save the user?
    -- If we compress 5000 words to 200, utility = 25x
    IF summary_word_count > 0 THEN
        word_ratio := original_word_count::DECIMAL / summary_word_count;
    ELSE
        word_ratio := 1;
    END IF;
    
    -- Bonus for media and tags (indicates richer summary)
    RETURN LEAST(word_ratio * 
                 (1.0 + CASE WHEN has_image THEN 0.1 ELSE 0 END) *
                 (1.0 + CASE WHEN has_tags THEN 0.1 ELSE 0 END),
                 100)::DECIMAL(10, 6); -- Cap at 100x
END;
$$;

-- ============================================================================
-- MAIN RANKING FUNCTION (The "Sift Score")
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_sift_score_v2(
    article_uuid UUID,
    force_recalculate BOOLEAN DEFAULT FALSE
)
RETURNS DECIMAL(10, 6)
LANGUAGE plpgsql
AS $$
DECLARE
    -- Article data
    v_age_hours DECIMAL;
    v_original_words INTEGER;
    v_summary_words INTEGER;
    v_has_image BOOLEAN;
    v_has_tags BOOLEAN;
    
    -- Engagement data
    v_views INTEGER := 0;
    v_saves INTEGER := 0;
    v_shares INTEGER := 0;
    v_clicks INTEGER := 0;
    v_total_engagement INTEGER := 0;
    
    -- Scores
    v_authority DECIMAL(10, 6) := 50;
    v_utility DECIMAL(10, 6) := 1;
    v_gravity DECIMAL(10, 6) := 1;
    v_velocity DECIMAL(10, 6) := 1;
    v_hotness DECIMAL(10, 6) := 0;
    v_value_score DECIMAL(10, 6) := 0;
    v_sift_score DECIMAL(10, 6) := 0;
    
    -- Existing ranking
    v_existing_id UUID;
BEGIN
    -- Get article data
    SELECT 
        EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600,
        COALESCE(char_length(content), 0) / 5,  -- Rough word estimate
        COALESCE(char_length(summary), 0) / 5,
        media_url IS NOT NULL AND media_url != '',
        tags IS NOT NULL AND array_length(tags, 1) > 0
    INTO v_age_hours, v_original_words, v_summary_words, v_has_image, v_has_tags
    FROM articles WHERE id = article_uuid;
    
    -- Get engagement counts (from article_interactions if table exists)
    BEGIN
        SELECT 
            COALESCE(SUM(CASE WHEN interaction_type = 'read' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN interaction_type = 'saved' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN interaction_type = 'shared' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN interaction_type = 'clicked' THEN 1 ELSE 0 END), 0)
        INTO v_views, v_saves, v_shares, v_clicks
        FROM article_interactions WHERE article_id = article_uuid;
    EXCEPTION
        WHEN undefined_table THEN
            v_views := 0; v_saves := 0; v_shares := 0; v_clicks := 0;
    END;
    
    -- Weighted engagement (shares worth most)
    v_total_engagement := v_views + (v_saves * 2) + (v_shares * 3) + (v_clicks * 1);
    
    -- Get authority score
    SELECT COALESCE(sa.authority_score, 50)
    INTO v_authority
    FROM articles a
    LEFT JOIN source_authority sa ON a.source_id = sa.source_id
    WHERE a.id = article_uuid;
    
    -- Calculate utility
    v_utility := calculate_utility(v_original_words, v_summary_words, v_has_image, v_has_tags);
    
    -- Calculate gravity (time decay)
    v_gravity := calculate_gravity(v_age_hours, LEAST(v_utility / 10, 1.2));
    
    -- Calculate velocity
    v_velocity := calculate_velocity(v_total_engagement, v_age_hours);
    
    -- Hotness = velocity × gravity
    -- This is the "Trending" component
    v_hotness := v_velocity * v_gravity;
    
    -- Value = authority × 0.4 + utility × 0.6
    -- This is the "Quality" component
    -- Note: Utility is normalized 1-10 for this calc
    v_value_score := (v_authority / 100 * 0.4) + 
                     (LEAST(v_utility, 50) / 50 * 0.6);
    
    -- Final Sift Score = Hotness × 0.7 + Value × 0.3
    -- 70% trending, 30% quality
    v_sift_score := (v_hotness * 0.70) + (v_value_score * 0.30);
    
    -- Upsert into rankings_v2
    INSERT INTO rankings_v2 (
        article_id, velocity_score, engagement_rate, 
        views_count, saves_count, shares_count, clicks_count,
        authority_score, utility_score, gravity_score, hotness_score, value_score, sift_score,
        is_trending, is_quality_pick, is_viral, calculated_at
    ) VALUES (
        article_uuid, v_velocity, 
        CASE WHEN v_age_hours > 0 THEN v_total_engagement / v_age_hours ELSE 0 END,
        v_views, v_saves, v_shares, v_clicks,
        v_authority, v_utility, v_gravity, v_hotness, v_value_score, v_sift_score,
        v_hotness > 50,           -- Trending if hotness > 50
        v_value_score > 0.7,      -- Quality pick if value > 0.7
        v_velocity > 100,          -- Viral if velocity > 100
        NOW()
    )
    ON CONFLICT (article_id) DO UPDATE SET
        velocity_score = EXCLUDED.velocity_score,
        engagement_rate = EXCLUDED.engagement_rate,
        views_count = EXCLUDED.views_count,
        saves_count = EXCLUDED.saves_count,
        shares_count = EXCLUDED.shares_count,
        clicks_count = EXCLUDED.clicks_count,
        authority_score = EXCLUDED.authority_score,
        utility_score = EXCLUDED.utility_score,
        gravity_score = EXCLUDED.gravity_score,
        hotness_score = EXCLUDED.hotness_score,
        value_score = EXCLUDED.value_score,
        sift_score = EXCLUDED.sift_score,
        is_trending = EXCLUDED.is_trending,
        is_quality_pick = EXCLUDED.is_quality_pick,
        is_viral = EXCLUDED.is_viral,
        calculated_at = NOW();
    
    RETURN v_sift_score;
END;
$$;

COMMENT ON FUNCTION calculate_sift_score_v2 IS 
'Calculates the Sift Score v2 using Gravity & Velocity model.
 Formula: Sift Score = (Hotness×0.7) + (Value×0.3)
 Hotness = velocity × gravity (engagement rate × time decay)
 Value = authority×0.4 + utility×0.6 (source × summary quality)';

-- ============================================================================
-- RECALCULATE ALL RANKINGS (Batch)
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_all_rankings_v2()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER := 0;
    v_article_id UUID;
BEGIN
    FOR v_article_id IN SELECT id FROM articles WHERE status = 'published' LOOP
        PERFORM calculate_sift_score_v2(v_article_id);
        v_count := v_count + 1;
    END LOOP;
    
    -- Update ranks
    UPDATE rankings_v2 r SET
        velocity_rank = (
            SELECT COUNT(*) + 1 FROM rankings_v2 r2 
            WHERE r2.velocity_score > r.velocity_score
        ),
        value_rank = (
            SELECT COUNT(*) + 1 FROM rankings_v2 r2 
            WHERE r2.value_score > r.value_score
        ),
        overall_rank = (
            SELECT COUNT(*) + 1 FROM rankings_v2 r2 
            WHERE r2.sift_score > r.sift_score
        );
    
    RETURN v_count;
END;
$$;

COMMENT ON FUNCTION recalculate_all_rankings_v2 IS 
'Recalculates Sift Scores for all published articles and updates ranks';

-- ============================================================================
-- QUERY EXAMPLES
-- ============================================================================

-- Get homepage feed (default v2 view)
-- SELECT * FROM rankings_v2 ORDER BY sift_score DESC LIMIT 20;

-- Get trending now (velocity-based)
-- SELECT * FROM rankings_v2 WHERE is_trending = TRUE ORDER BY velocity_score DESC LIMIT 10;

-- Get quality picks (value-based)
-- SELECT * FROM rankings_v2 WHERE is_quality_pick = TRUE ORDER BY value_score DESC LIMIT 10;

-- Get viral articles
-- SELECT * FROM rankings_v2 WHERE is_viral = TRUE ORDER BY velocity_score DESC;

-- ============================================================================
-- MIGRATION FROM V1 TO V2
-- ============================================================================

-- Migrate existing rankings to v2
CREATE OR REPLACE FUNCTION migrate_rankings_v1_to_v2()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- Calculate new scores for all articles
    SELECT calculate_all_sift_scores_v2() INTO v_count;
    RETURN v_count;
END;
$$;

-- Enable v2 as default
UPDATE ranking_config_v2 SET is_default = TRUE WHERE name = 'gravity_velocity';

COMMENT ON TABLE ranking_config_v2 IS 'Ranking configuration v2 - Gravity & Velocity model';
COMMENT ON FUNCTION calculate_sift_score_v2 IS 'Main ranking function - see schema header for full documentation';
