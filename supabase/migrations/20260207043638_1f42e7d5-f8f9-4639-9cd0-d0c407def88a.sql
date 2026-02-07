-- ============================================================================
-- SIFTED INSIGHT RANKING v4 - FRESHNESS + ENGAGEMENT + VALUE
-- ============================================================================

-- STEP 1: CREATE ARTICLE INTERACTIONS TABLE FOR ENGAGEMENT TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS article_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('read', 'saved', 'shared')),
    user_session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE article_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy - anyone can insert interactions
CREATE POLICY "Anyone can insert interactions" ON article_interactions 
FOR INSERT TO postgres, anon, authenticated WITH CHECK (true);

-- RLS Policy - anyone can read interactions (for aggregation)
CREATE POLICY "Anyone can read interactions" ON article_interactions 
FOR SELECT TO postgres, anon, authenticated USING (true);

-- Index for fast aggregation
CREATE INDEX IF NOT EXISTS idx_article_interactions_article_id ON article_interactions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_interactions_type ON article_interactions(interaction_type);

-- STEP 2: CREATE SOURCE AUTHORITY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS source_authority (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    authority_score DECIMAL(5,2) DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id)
);

-- Enable RLS
ALTER TABLE source_authority ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Anyone can read authority" ON source_authority 
FOR SELECT TO postgres, anon, authenticated USING (true);

CREATE POLICY "Admins can manage authority" ON source_authority 
FOR ALL TO postgres, authenticated USING (is_admin(auth.uid()));

-- Seed default authority scores for existing sources
INSERT INTO source_authority (source_id, authority_score)
SELECT id, 
    CASE 
        WHEN name ILIKE '%techcrunch%' THEN 90
        WHEN name ILIKE '%wired%' THEN 85
        WHEN name ILIKE '%verge%' THEN 85
        WHEN name ILIKE '%ars technica%' THEN 88
        WHEN name ILIKE '%engadget%' THEN 80
        WHEN name ILIKE '%reuters%' THEN 95
        WHEN name ILIKE '%bloomberg%' THEN 92
        WHEN name ILIKE '%wsj%' OR name ILIKE '%wall street%' THEN 93
        WHEN name ILIKE '%bbc%' THEN 90
        WHEN name ILIKE '%nyt%' OR name ILIKE '%new york times%' THEN 91
        ELSE 50
    END
FROM sources
ON CONFLICT (source_id) DO NOTHING;

-- STEP 3: V4 RANKING FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_sift_score_v4(article_uuid UUID)
RETURNS DECIMAL(10, 6)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_engagement INTEGER := 0;
    v_age_hours DECIMAL := 0;
    v_authority DECIMAL := 50;
    v_utility DECIMAL := 1;
    v_content_length INTEGER := 0;
    v_summary_length INTEGER := 0;
    v_hotness DECIMAL := 0;
    v_freshness DECIMAL := 0;
    v_value DECIMAL := 0;
    v_final DECIMAL := 0;
BEGIN
    -- Get age in hours
    SELECT EXTRACT(EPOCH FROM (NOW() - COALESCE(published_at, created_at))) / 3600 INTO v_age_hours
    FROM articles WHERE id = article_uuid;
    
    -- Get engagement (weighted: read=1, saved=3, shared=5)
    SELECT COALESCE(SUM(CASE 
        WHEN interaction_type = 'read' THEN 1 
        WHEN interaction_type = 'saved' THEN 3 
        WHEN interaction_type = 'shared' THEN 5 
    END), 0) INTO v_engagement
    FROM article_interactions WHERE article_id = article_uuid;
    
    -- Get authority score from source
    SELECT COALESCE(sa.authority_score, 50) INTO v_authority
    FROM articles a 
    LEFT JOIN source_authority sa ON a.source_id = sa.source_id
    WHERE a.id = article_uuid;
    
    -- Get content and summary lengths for utility calculation
    SELECT 
        COALESCE(char_length(a.summary), 0),
        COALESCE(char_length(s.executive_summary), char_length(a.summary), 100)
    INTO v_content_length, v_summary_length
    FROM articles a
    LEFT JOIN summaries s ON a.id = s.article_id
    WHERE a.id = article_uuid;
    
    -- Utility = content_length / summary_length (capped at 5)
    IF v_summary_length > 0 THEN
        v_utility := LEAST(v_content_length::DECIMAL / v_summary_length, 5);
    ELSE
        v_utility := 1;
    END IF;
    
    -- HOTNESS = (engagement + 1)^1.3 / (age_hours + 2)
    v_hotness := POWER(GREATEST(v_engagement + 1, 1)::DECIMAL, 1.3) / 
                 (GREATEST(v_age_hours, 0) + 2);
    
    -- FRESHNESS = 100 * e^(-0.1 * age_hours)
    -- Decay: 1hr=90, 6hrs=55, 12hrs=30, 24hrs=9, 48hrs=2
    v_freshness := 100 * EXP(-0.1 * GREATEST(v_age_hours, 0));
    
    -- VALUE = (authority * 0.4) + (utility * 10 * 0.6)
    v_value := (v_authority * 0.4) + (v_utility * 10 * 0.6);
    
    -- FINAL = (Hotness * 0.35) + (Freshness * 0.35) + (Value * 0.30)
    v_final := (v_hotness * 0.35) + (v_freshness * 0.35) + (v_value * 0.30);
    
    RETURN v_final;
END;
$$;

-- STEP 4: UPDATE GET_CLUSTERED_FEED TO USE V4 SCORING
-- ============================================================================
CREATE OR REPLACE FUNCTION get_ranked_feed_v4(
    limit_count INT DEFAULT 20,
    category_filter content_category DEFAULT NULL
)
RETURNS TABLE (
    id UUID, 
    title VARCHAR, 
    original_url TEXT,
    author VARCHAR, 
    published_at TIMESTAMPTZ, 
    sift_score DECIMAL,
    topic VARCHAR, 
    tags TEXT[], 
    media_url TEXT, 
    image_url TEXT,
    sifted_read_time INT,
    original_read_time INT,
    source_id UUID,
    content_category content_category
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.original_url,
        a.author,
        a.published_at,
        calculate_sift_score_v4(a.id) AS sift_score,
        a.topic,
        a.tags,
        a.media_url,
        a.image_url,
        a.sifted_read_time,
        a.original_read_time,
        a.source_id,
        a.content_category
    FROM articles a
    WHERE a.status = 'published'
        AND (category_filter IS NULL OR a.content_category = category_filter)
    ORDER BY calculate_sift_score_v4(a.id) DESC
    LIMIT limit_count;
END;
$$;

-- STEP 5: FUNCTION TO TRACK INTERACTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION track_article_interaction(
    p_article_id UUID,
    p_interaction_type VARCHAR(20),
    p_session_id VARCHAR(255) DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO article_interactions (article_id, interaction_type, user_session_id)
    VALUES (p_article_id, p_interaction_type, p_session_id);
END;
$$;