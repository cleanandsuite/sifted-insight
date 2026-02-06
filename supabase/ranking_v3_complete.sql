-- ============================================================================
-- SIFTED INSIGHT RANKING ALGORITHM v3
-- Gravity & Velocity + Clustering - The Complete System
-- ============================================================================

-- ============================================================================
-- PART 1: CLUSTERING SYSTEM
-- Prevent topic spam on homepage
-- ============================================================================

-- Create topics table for clustering articles
CREATE TABLE IF NOT EXISTS article_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    topic_hash VARCHAR(64) NOT NULL,           -- Hash of topic keywords
    topic_keywords TEXT[] NOT NULL,              -- Extracted keywords
    topic_label VARCHAR(200),                    -- Human-readable label
    topic_category VARCHAR(100),                -- AI, Climate, Finance, etc.
    confidence DECIMAL(5, 4) DEFAULT 0.5,       -- Clustering confidence
    is_primary BOOLEAN DEFAULT TRUE,              -- Primary topic for article
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(article_id, topic_hash)
);

-- Indexes for clustering
CREATE INDEX IF NOT EXISTS idx_topics_hash ON article_topics(topic_hash);
CREATE INDEX IF NOT EXISTS idx_topics_category ON article_topics(topic_category);
CREATE INDEX IF NOT EXISTS idx_topics_article ON article_topics(article_id);

-- Create topics table for metadata
CREATE TABLE IF NOT EXISTS topic_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_hash VARCHAR(64) UNIQUE NOT NULL,
    topic_label VARCHAR(200) NOT NULL,
    topic_category VARCHAR(100),
    article_count INTEGER DEFAULT 0,
    last_article_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 2: TOPIC DETECTION FUNCTION
-- Extract topics from article content
-- ============================================================================

CREATE OR REPLACE FUNCTION detect_topics(
    article_uuid UUID,
    title_text TEXT,
    content_text TEXT,
    tags_text TEXT[]
)
RETURNS UUID[]
LANGUAGE plpgsql
AS $$
DECLARE
    v_topics UUID[];
    v_combined_text TEXT;
    v_hash VARCHAR(64);
    v_keywords TEXT[];
    v_category VARCHAR(100);
    v_confidence DECIMAL(5, 4);
    v_topic_id UUID;
BEGIN
    -- Combine all text for analysis
    v_combined_text := LOWER(title_text || ' ' || 
                       COALESCE(content_text, '') || ' ' ||
                       COALESCE(array_to_string(tags_text, ' '), ''));
    
    -- Extract key terms (simple keyword matching - could use AI in production)
    v_keywords := ARRAY[
        -- Tech/AI
        'gpt', 'ai', 'chatgpt', 'anthropic', 'claude', 'gemini', 'llm',
        'machine learning', 'neural', 'deep learning', 'transformer',
        -- Apple
        'iphone', 'ipad', 'macbook', 'apple vision', 'apple watch', 'ios', 'macos',
        -- Google
        'pixel', 'android', 'google', 'gemini', 'deepmind',
        -- Tesla
        'tesla', 'robotaxi', 'fsd', 'autopilot', 'elon musk',
        -- Microsoft
        'microsoft', 'copilot', 'azure', 'openai', 'windows',
        -- Social
        'twitter', 'x', 'instagram', 'facebook', 'meta', 'tiktok', 'threads',
        -- Crypto
        'bitcoin', 'ethereum', 'crypto', 'blockchain', 'nft', 'defi',
        -- Climate
        'climate', 'global warming', 'carbon', 'renewable', 'clean energy',
        -- Politics
        'election', 'trump', 'biden', 'congress', 'senate', 'white house',
        -- Business
        'stock market', 'fed', 'interest rate', 'inflation', 'gdp', 'recession'
    ];
    
    -- Match keywords from combined text
    SELECT ARRAY(
        SELECT DISTINCT unnest(v_keywords)
        WHERE v_combined_text LIKE ('%' || unnest(v_keywords) || '%')
        LIMIT 5
    ) INTO v_keywords;
    
    -- Generate topic hash from sorted keywords (simple hash)
    v_hash := encode(digest(lower(array_to_string(v_keywords, ', ')), 'hex');
    
    -- Determine category
    v_category := CASE
        WHEN v_combined_text LIKE '%ai%gpt%chatgpt%claude%gemini%llm%' THEN 'Artificial Intelligence'
        WHEN v_combined_text LIKE '%iphone%ipad%apple vision%macbook%' THEN 'Consumer Tech'
        WHEN v_combined_text LIKE '%tesla%robotaxi%fsd%autopilot%elon%' THEN 'Transportation'
        WHEN v_combined_text LIKE '%climate%global warming%carbon%renewable%' THEN 'Climate'
        WHEN v_combined_text LIKE '%bitcoin%ethereum%crypto%blockchain%nft%' THEN 'Web3 & Crypto'
        WHEN v_combined_text LIKE '%stock market%fed%interest rate%inflation%' THEN 'Business & Finance'
        WHEN v_combined_text LIKE '%election%trump%biden%congress%white house%' THEN 'Politics'
        ELSE 'General News'
    END;
    
    -- Calculate confidence (more keywords = higher confidence)
    v_confidence := LEAST(array_length(v_keywords, 1)::DECIMAL / 5, 1.0);
    
    -- Upsert topic
    INSERT INTO article_topics (article_id, topic_hash, topic_keywords, topic_label, topic_category, confidence, is_primary)
    VALUES (article_uuid, v_hash, v_keywords, array_to_string(v_keywords, ', '), v_category, v_confidence, TRUE)
    ON CONFLICT (article_id, topic_hash) DO UPDATE SET
        topic_keywords = EXCLUDED.topic_keywords,
        topic_category = EXCLUDED.topic_category,
        confidence = EXCLUDED.confidence;
    
    -- Update topic metadata
    INSERT INTO topic_metadata (topic_hash, topic_label, topic_category, article_count, last_article_at)
    VALUES (v_hash, array_to_string(v_keywords, ', '), v_category, 1, NOW())
    ON CONFLICT (topic_hash) DO UPDATE SET
        article_count = topic_metadata.article_count + 1,
        last_article_at = NOW();
    
    RETURN ARRAY[v_hash]::UUID[];
END;
$$;

-- ============================================================================
-- PART 3: THE V3 RANKING FORMULA (User's Exact Specification)
-- ============================================================================

-- Function for clean v3 scoring
CREATE OR REPLACE FUNCTION calculate_sift_score_v3(
    article_uuid UUID,
    force_recalculate BOOLEAN DEFAULT FALSE
)
RETURNS DECIMAL(10, 6)
LANGUAGE plpgsql
AS $$
DECLARE
    -- Engagement
    v_views INTEGER := 0;
    v_saves INTEGER := 0;
    v_shares INTEGER := 0;
    v_engagement INTEGER := 0;
    
    -- Scores
    v_hotness DECIMAL(10, 6) := 0;
    v_value DECIMAL(10, 6) := 0;
    v_final_score DECIMAL(10, 6) := 0;
    
    -- Time
    v_age_hours DECIMAL(10, 4) := 0;
    
    -- Authority & Utility
    v_authority DECIMAL(10, 4) := 50;
    v_utility DECIMAL(10, 4) := 1;
BEGIN
    -- Get time since publication
    SELECT EXTRACT(EPOCH FROM (NOW() - published_at)) / 3600
    INTO v_age_hours
    FROM articles WHERE id = article_uuid;
    
    -- Get engagement (with graceful fallback)
    BEGIN
        SELECT 
            COALESCE(SUM(CASE WHEN interaction_type = 'read' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN interaction_type = 'saved' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN interaction_type = 'shared' THEN 1 ELSE 0 END), 0)
        INTO v_views, v_saves, v_shares
        FROM article_interactions WHERE article_id = article_uuid;
    EXCEPTION WHEN undefined_table THEN
        v_views := 0; v_saves := 0; v_shares := 0;
    END;
    
    -- Weighted engagement
    v_engagement := v_views + (v_saves * 2) + (v_shares * 3);
    
    -- Get authority (with fallback)
    BEGIN
        SELECT COALESCE(sa.authority_score, 50)
        INTO v_authority
        FROM articles a
        LEFT JOIN source_authority sa ON a.source_id = sa.source_id
        WHERE a.id = article_uuid;
    EXCEPTION WHEN undefined_table THEN
        v_authority := 50;
    END;
    
    -- Get utility (summary effectiveness)
    -- Utility = original_words / summary_words (higher = better)
    v_utility := COALESCE((
        SELECT CASE 
            WHEN char_length(summary) > 0 
            THEN char_length(content)::DECIMAL / char_length(summary)
            ELSE 1 
        END
        FROM articles WHERE id = article_uuid
    ), 1);
    
    -- ========================================
    -- THE V3 FORMULA (User's Exact Spec)
    -- ========================================
    
    -- Hotness = POWER(engagement, 1.3) / (age_hours + 1.5)
    v_hotness := POWER(GREATEST(v_engagement + 1, 1)::DECIMAL, 1.3) / 
                 (GREATEST(v_age_hours, 0) + 1.5);
    
    -- Value = (authority × 0.4) + (utility × 10 × 0.6)
    v_value := (v_authority * 0.4) + (v_utility * 10 * 0.6);
    
    -- Final = (Hotness × 0.7) + (Value × 0.3)
    v_final_score := (v_hotness * 0.70) + (v_value * 0.30);
    
    RETURN v_final_score;
END;
$$;

COMMENT ON FUNCTION calculate_sift_score_v3 IS 
'V3 Formula: Sift Score = (Hotness×0.7) + (Value×0.3)
 Hotness = POWER(engagement, 1.3) / (hours + 1.5)
 Value = (authority×0.4) + (utility×10×0.6)';

-- ============================================================================
-- PART 4: CLUSTERED FEED QUERY (No topic spam!)
-- ============================================================================

-- Get clustered homepage feed (1 article per topic max in top 10)
CREATE OR REPLACE FUNCTION get_clustered_feed(
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    article_id UUID,
    title TEXT,
    summary TEXT,
    source_name TEXT,
    published_at TIMESTAMPTZ,
    sift_score DECIMAL(10, 6),
    topic_hash VARCHAR(64),
    topic_label TEXT,
    is_top_in_topic BOOLEAN,
    overall_rank INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_article RECORD;
    v_topic_hash VARCHAR(64);
    v_rank INTEGER := 0;
    v_count INTEGER := 0;
BEGIN
    FOR v_article IN 
        SELECT a.id, a.title, a.summary, s.name AS source_name, 
               a.published_at, calculate_sift_score_v3(a.id) AS sift_score,
               (SELECT topic_hash FROM article_topics WHERE article_id = a.id AND is_primary = TRUE) AS topic_hash
        FROM articles a
        LEFT JOIN sources s ON a.source_id = s.id
        WHERE a.status = 'published'
        ORDER BY sift_score DESC
    LOOP
        -- Skip if we've already shown an article from this topic
        IF v_topic_hash IS DISTINCT FROM v_article.topic_hash THEN
            v_rank := v_rank + 1;
            
            -- Track topic usage
            v_topic_hash := v_article.topic_hash;
            
            RETURN QUERY SELECT 
                v_article.id, v_article.title, v_article.summary, 
                v_article.source_name, v_article.published_at,
                v_article.sift_score, v_article.topic_hash,
                (SELECT topic_label FROM article_topics WHERE article_hash = v_article.topic_hash AND is_primary = TRUE LIMIT 1),
                TRUE,
                v_rank;
            
            v_count := v_count + 1;
            
            -- Stop after limit
            IF v_count >= limit_count THEN
                EXIT;
            END IF;
        END IF;
    END LOOP;
END;
$$;

-- ============================================================================
-- PART 5: CLUSTERED FEED VIEW (Simplified)
-- ============================================================================

CREATE OR REPLACE VIEW clustered_feed AS
SELECT 
    a.id AS article_id,
    a.title,
    a.summary,
    s.name AS source_name,
    a.published_at,
    calculate_sift_score_v3(a.id) AS sift_score,
    (
        SELECT topic_hash FROM article_topics 
        WHERE article_id = a.id AND is_primary = TRUE 
        LIMIT 1
    ) AS topic_hash,
    (
        SELECT topic_label FROM article_topics 
        WHERE article_hash = (
            SELECT topic_hash FROM article_topics 
            WHERE article_id = a.id AND is_primary = TRUE
        ) AND is_primary = TRUE
        LIMIT 1
    ) AS topic_label,
    ROW_NUMBER() OVER (
        PARTITION BY (
            SELECT topic_hash FROM article_topics 
            WHERE article_id = a.id AND is_primary = TRUE 
            LIMIT 1
        )
        ORDER BY calculate_sift_score_v3(a.id) DESC
    ) AS topic_rank
FROM articles a
LEFT JOIN sources s ON a.source_id = s.id
WHERE a.status = 'published'
ORDER BY calculate_sift_score_v3(a.id) DESC;

-- ============================================================================
-- PART 6: RELATED ARTICLES (Same Topic)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_related_articles(
    article_uuid UUID,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    article_id UUID,
    title TEXT,
    source_name TEXT,
    published_at TIMESTAMPTZ,
    sift_score DECIMAL(10, 6),
    topic_label TEXT,
    relevance_score DECIMAL(10, 4)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_topic_hash VARCHAR(64);
BEGIN
    -- Get primary topic of current article
    SELECT topic_hash INTO v_topic_hash
    FROM article_topics 
    WHERE article_id = article_uuid AND is_primary = TRUE
    LIMIT 1;
    
    -- Return other articles from same topic
    RETURN QUERY
    SELECT 
        a.id, a.title, s.name AS source_name, a.published_at,
        calculate_sift_score_v3(a.id) AS sift_score,
        t.topic_label,
        t.confidence AS relevance_score
    FROM article_topics t
    JOIN articles a ON t.article_id = a.id
    LEFT JOIN sources s ON a.source_id = s.id
    WHERE t.topic_hash = v_topic_hash
        AND a.id != article_uuid
        AND a.status = 'published'
    ORDER BY t.confidence DESC, a.published_at DESC
    LIMIT limit_count;
END;
$$;

-- ============================================================================
-- PART 7: MIGRATION AND SETUP
-- ============================================================================

-- Add topic_hash column to articles for easier querying
ALTER TABLE articles ADD COLUMN IF NOT EXISTS primary_topic_hash VARCHAR(64);

-- Update primary_topic_hash for existing articles
CREATE OR REPLACE FUNCTION backfill_topics()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_article RECORD;
    v_count INTEGER := 0;
BEGIN
    FOR v_article IN SELECT id, title, content FROM articles LOOP
        PERFORM detect_topics(v_article.id, v_article.title, v_article.content, NULL);
        v_count := v_count + 1;
    END LOOP;
    RETURN v_count;
END;
$$;

-- Recalculate all v3 scores
CREATE OR REPLACE FUNCTION recalculate_all_v3_scores()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    PERFORM calculate_sift_score_v3(id) FROM articles WHERE status = 'published';
    RETURN v_count;
END;
$$;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Homepage (clustered - no topic spam)
-- SELECT * FROM get_clustered_feed(20);

-- Related articles (same topic)
-- SELECT * FROM get_related_articles('article-uuid-here', 5);

-- Topic breakdown
-- SELECT topic_category, COUNT(*) as article_count 
-- FROM article_topics GROUP BY topic_category ORDER BY COUNT DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION detect_topics IS 
'Extracts topic keywords from article and clusters by topic_hash';

COMMENT ON FUNCTION calculate_sift_score_v3 IS 
'The V3 Formula: Sift Score = (Hotness×0.7) + (Value×0.3)
 Hotness = POWER(engagement, 1.3) / (hours + 1.5)
 Value = (authority×0.4) + (utility×10×0.6)';

COMMENT ON FUNCTION get_clustered_feed IS 
'Returns homepage feed with MAX 1 article per topic in top results. Prevents spam.';

COMMENT ON TABLE article_topics IS 
'Clusters articles by topic to prevent redundancy on homepage';

COMMENT ON FUNCTION get_related_articles IS 
'Returns other articles from the same topic cluster';
