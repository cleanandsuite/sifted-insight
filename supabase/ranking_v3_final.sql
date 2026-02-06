-- ============================================================================
-- SIFTED INSIGHT RANKING v4 - FRESHNESS + ENGAGEMENT + VALUE
-- Run this entire file to update ranking with recency boost
-- ============================================================================

-- v4 Changes:
-- - Added Freshness signal (time decay bonus for new articles)
-- - Adjusted engagement weights (saved=3, shared=5)
-- - Recalibrated formula: Hotness 35% + Freshness 35% + Value 30%
-- ============================================================================

-- STEP 1: REMOVE SECURITY DEFINER (Security Fix)
-- ============================================================================
DROP VIEW IF EXISTS articles_by_category;
DROP VIEW IF EXISTS articles_with_scores;

-- STEP 2: CREATE CLUSTERING TABLES WITH RLS
-- ============================================================================

-- Create table first (before functions reference it)
CREATE TABLE IF NOT EXISTS article_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    topic_hash VARCHAR(64) NOT NULL,
    topic_keywords TEXT[],
    topic_label VARCHAR(200),
    topic_category VARCHAR(100),
    confidence DECIMAL(5,4) DEFAULT 0.5,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(article_id, topic_hash)
);

CREATE TABLE IF NOT EXISTS topic_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_hash VARCHAR(64) UNIQUE NOT NULL,
    topic_label VARCHAR(200),
    topic_category VARCHAR(100),
    article_count INTEGER DEFAULT 0,
    last_article_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE article_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow read access)
CREATE POLICY "Anyone can read topics" ON article_topics FOR SELECT TO postgres, anon, authenticated USING (true);
CREATE POLICY "Anyone can read metadata" ON topic_metadata FOR SELECT TO postgres, anon, authenticated USING (true);

-- STEP 3: TOPIC DETECTION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION detect_topics(
    article_uuid UUID,
    title_text TEXT,
    content_text TEXT,
    tags_text TEXT[]
)
RETURNS VARCHAR(64)
LANGUAGE plpgsql
AS $$
DECLARE
    v_combined TEXT;
    v_keywords TEXT[];
    v_hash VARCHAR(64);
    v_category VARCHAR(100);
BEGIN
    v_combined := LOWER(title_text || ' ' || COALESCE(content_text, '') || ' ' || COALESCE(array_to_string(tags_text, ' '), ''));
    
    -- Reset keywords
    v_keywords := ARRAY[]::TEXT[];
    
    -- Keyword matching
    IF v_combined LIKE '%gpt%' OR v_combined LIKE '%chatgpt%' OR v_combined LIKE '%anthropic%' THEN v_keywords := v_keywords || 'AI'; END IF;
    IF v_combined LIKE '%machine learning%' OR v_combined LIKE '%llm%' THEN v_keywords := v_keywords || 'ML'; END IF;
    IF v_combined LIKE '%iphone%' OR v_combined LIKE '%ipad%' OR v_combined LIKE '%apple%' THEN v_keywords := v_keywords || 'Apple'; END IF;
    IF v_combined LIKE '%vision pro%' THEN v_keywords := v_keywords || 'Vision Pro'; END IF;
    IF v_combined LIKE '%tesla%' OR v_combined LIKE '%robotaxi%' THEN v_keywords := v_keywords || 'Tesla'; END IF;
    IF v_combined LIKE '%elon musk%' THEN v_keywords := v_keywords || 'Elon'; END IF;
    IF v_combined LIKE '%bitcoin%' OR v_combined LIKE '%crypto%' THEN v_keywords := v_keywords || 'Crypto'; END IF;
    IF v_combined LIKE '%blockchain%' OR v_combined LIKE '%ethereum%' THEN v_keywords := v_keywords || 'Blockchain'; END IF;
    IF v_combined LIKE '%climate%' OR v_combined LIKE '%global warming%' THEN v_keywords := v_keywords || 'Climate'; END IF;
    IF v_combined LIKE '%carbon%' OR v_combined LIKE '%renewable%' THEN v_keywords := v_keywords || 'Energy'; END IF;
    IF v_combined LIKE '%election%' OR v_combined LIKE '%trump%' OR v_combined LIKE '%biden%' THEN v_keywords := v_keywords || 'Politics'; END IF;
    IF v_combined LIKE '%stock market%' OR v_combined LIKE '%fed%' OR v_combined LIKE '%inflation%' THEN v_keywords := v_keywords || 'Finance'; END IF;
    IF v_combined LIKE '%microsoft%' OR v_combined LIKE '%copilot%' THEN v_keywords := v_keywords || 'Microsoft'; END IF;
    IF v_combined LIKE '%azure%' THEN v_keywords := v_keywords || 'Azure'; END IF;
    IF v_combined LIKE '%google%' OR v_combined LIKE '%gemini%' THEN v_keywords := v_keywords || 'Google'; END IF;
    IF v_combined LIKE '%android%' THEN v_keywords := v_keywords || 'Android'; END IF;
    IF v_combined LIKE '%twitter%' OR v_combined LIKE '%x.com%' THEN v_keywords := v_keywords || 'Twitter'; END IF;
    IF v_combined LIKE '%instagram%' OR v_combined LIKE '%facebook%' THEN v_keywords := v_keywords || 'Social'; END IF;
    IF v_combined LIKE '%meta%' OR v_combined LIKE '%tiktok%' THEN v_keywords := v_keywords || 'Meta'; END IF;
    
    -- Generate hash
    v_hash := encode(digest(COALESCE(array_to_string(v_keywords, ',')), ''), 'md5');
    
    -- Determine category
    v_category := CASE
        WHEN v_combined LIKE '%gpt%' OR v_combined LIKE '%llm%' THEN 'AI'
        WHEN v_combined LIKE '%iphone%' OR v_combined LIKE '%apple%' THEN 'Apple'
        WHEN v_combined LIKE '%tesla%' OR v_combined LIKE '%robotaxi%' THEN 'Tesla'
        WHEN v_combined LIKE '%bitcoin%' OR v_combined LIKE '%crypto%' THEN 'Crypto'
        WHEN v_combined LIKE '%climate%' OR v_combined LIKE '%renewable%' THEN 'Climate'
        WHEN v_combined LIKE '%election%' OR v_combined LIKE '%trump%' THEN 'Politics'
        WHEN v_combined LIKE '%stock market%' OR v_combined LIKE '%fed%' THEN 'Finance'
        WHEN v_combined LIKE '%google%' OR v_combined LIKE '%android%' THEN 'Google'
        WHEN v_combined LIKE '%microsoft%' OR v_combined LIKE '%copilot%' THEN 'Microsoft'
        ELSE 'General'
    END;
    
    -- Insert topic
    INSERT INTO article_topics (article_id, topic_hash, topic_keywords, topic_label, topic_category, confidence, is_primary)
    VALUES (article_uuid, v_hash, v_keywords, array_to_string(v_keywords, ', '), v_category, 
            LEAST(GREATEST(array_length(v_keywords, 1), 0)::DECIMAL / 3, 1.0), TRUE)
    ON CONFLICT (article_id, topic_hash) DO NOTHING;
    
    -- Update metadata
    INSERT INTO topic_metadata (topic_hash, topic_label, topic_category, article_count, last_article_at)
    VALUES (v_hash, array_to_string(v_keywords, ', '), v_category, 1, NOW())
    ON CONFLICT (topic_hash) DO UPDATE SET
        article_count = topic_metadata.article_count + 1,
        last_article_at = NOW();
    
    RETURN v_hash;
END;
$$;

-- STEP 4: V4 RANKING FORMULA WITH FRESHNESS
-- ============================================================================

-- V4 Formula: Hotness + Freshness + Value
-- Hotness = engagement-based signal
-- Freshness = time decay bonus (new articles get boost)
-- Value = authority + utility (content quality)

CREATE OR REPLACE FUNCTION calculate_sift_score_v4(article_uuid UUID)
RETURNS DECIMAL(10, 6)
LANGUAGE plpgsql
AS $$
DECLARE
    v_engagement INTEGER := 0;
    v_age_hours DECIMAL := 0;
    v_authority DECIMAL := 50;
    v_utility DECIMAL := 1;
    v_hotness DECIMAL := 0;
    v_freshness DECIMAL := 0;
    v_value DECIMAL := 0;
    v_final DECIMAL := 0;
BEGIN
    -- Get age
    SELECT EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600 INTO v_age_hours
    FROM articles WHERE id = article_uuid;
    
    -- Get engagement
    BEGIN
        SELECT COALESCE(SUM(CASE 
            WHEN interaction_type = 'read' THEN 1 
            WHEN interaction_type = 'saved' THEN 3 
            WHEN interaction_type = 'shared' THEN 5 
        END), 0) INTO v_engagement
        FROM article_interactions WHERE article_id = article_uuid;
    EXCEPTION WHEN undefined_table THEN v_engagement := 0;
    END;
    
    -- Get authority
    BEGIN
        SELECT COALESCE(sa.authority_score, 50) INTO v_authority
        FROM articles a LEFT JOIN source_authority sa ON a.source_id = sa.source_id
        WHERE a.id = article_uuid;
    EXCEPTION WHEN undefined_table THEN v_authority := 50;
    END;
    
    -- Get utility
    SELECT CASE WHEN char_length(summary) > 0 
        THEN LEAST(char_length(content)::DECIMAL / GREATEST(char_length(summary), 1), 5)::DECIMAL
        ELSE 1 END INTO v_utility
    FROM articles WHERE id = article_uuid;
    
    -- V4 FORMULA
    -- Hotness = (engagement + 1)^1.3 / (hours + 2)
    v_hotness := POWER(GREATEST(v_engagement + 1, 1)::DECIMAL, 1.3) / 
                 (GREATEST(v_age_hours, 0) + 2);
    
    -- Freshness = 100 * e^(-0.1 * age_hours)
    -- Decays: 1hr=90pts, 6hrs=55pts, 12hrs=30pts, 24hrs=9pts, 48hrs=1pt
    v_freshness := 100 * EXP(-0.1 * GREATEST(v_age_hours, 0));
    
    -- Value = (authority × 0.4) + (utility × 10 × 0.6)
    v_value := (v_authority * 0.4) + (v_utility * 10 * 0.6);
    
    -- Final = (Hotness × 0.35) + (Freshness × 0.35) + (Value × 0.30)
    v_final := (v_hotness * 0.35) + (v_freshness * 0.35) + (v_value * 0.30);
    
    RETURN v_final;
END;
$$;

-- STEP 5: CLUSTERED FEED FUNCTION (updated for v4)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_clustered_feed(limit_count INT DEFAULT 20)
RETURNS TABLE (
    article_id UUID, title TEXT, summary TEXT, source_name TEXT,
    published_at TIMESTAMPTZ, sift_score DECIMAL, topic_hash VARCHAR(64),
    topic_label TEXT, topic_rank INT, overall_rank INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_rec RECORD;
    v_current_hash VARCHAR(64) := '';
    v_rank INT := 0;
    v_count INT := 0;
BEGIN
    FOR v_rec IN 
        SELECT a.id, a.title, a.summary, s.name AS source_name, 
               a.published_at, calculate_sift_score_v4(a.id) AS sift_score,
               (SELECT topic_hash FROM article_topics WHERE article_id = a.id ORDER BY confidence DESC LIMIT 1) AS topic_hash
        FROM articles a LEFT JOIN sources s ON a.source_id = s.id
        WHERE a.status = 'published'
        ORDER BY sift_score DESC
    LOOP
        -- Skip if we already have this topic
        IF v_rec.topic_hash != v_current_hash THEN
            v_rank := v_rank + 1;
            v_current_hash := v_rec.topic_hash;
            
            RETURN QUERY SELECT 
                v_rec.id, v_rec.title, v_rec.summary, v_rec.source_name,
                v_rec.published_at, v_rec.sift_score, v_rec.topic_hash,
                (SELECT topic_label FROM article_topics WHERE topic_hash = v_rec.topic_hash LIMIT 1),
                v_rank, v_rank;
            
            v_count := v_count + 1;
            IF v_count >= limit_count THEN EXIT; END IF;
        END IF;
    END LOOP;
END;
$$;

-- STEP 6: RELATED ARTICLES FUNCTION (updated for v4)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_related_articles(article_uuid UUID, limit_count INT DEFAULT 5)
RETURNS TABLE (article_id UUID, title TEXT, source_name TEXT, sift_score DECIMAL)
LANGUAGE plpgsql
AS $$
DECLARE
    v_hash VARCHAR(64);
BEGIN
    SELECT topic_hash INTO v_hash 
    FROM article_topics WHERE article_id = article_uuid ORDER BY confidence DESC LIMIT 1;
    
    RETURN QUERY
    SELECT a.id, a.title, s.name, calculate_sift_score_v4(a.id) AS sift_score
    FROM article_topics t
    JOIN articles a ON t.article_id = a.id
    LEFT JOIN sources s ON a.source_id = s.id
    WHERE t.topic_hash = v_hash AND a.id != article_uuid AND a.status = 'published'
    ORDER BY t.confidence DESC, a.published_at DESC
    LIMIT limit_count;
END;
$$;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Ranking v4 installed with freshness boost!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Formula breakdown:';
    RAISE NOTICE '- Hotness (35%%): engagement-based signal';
    RAISE NOTICE '- Freshness (35%%): time decay bonus';
    RAISE NOTICE '  1hr=90pts, 6hrs=55pts, 12hrs=30pts';
    RAISE NOTICE '  24hrs=9pts, 48hrs=1pt';
    RAISE NOTICE '- Value (30%%): authority + utility';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. SELECT detect_topics(id, title, content, tags) FROM articles;';
    RAISE NOTICE '2. SELECT * FROM get_clustered_feed(20);';
END;
$$;
