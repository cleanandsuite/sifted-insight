-- Add content category enum
CREATE TYPE content_category AS ENUM ('tech', 'finance', 'politics', 'climate');

-- Add category columns to sources
ALTER TABLE sources ADD COLUMN content_category content_category;
ALTER TABLE sources ADD COLUMN sub_category VARCHAR(50);

-- Add category columns to articles
ALTER TABLE articles ADD COLUMN content_category content_category;
ALTER TABLE articles ADD COLUMN category_confidence DECIMAL(3,2);

-- Create ratio configuration table
CREATE TABLE content_ratio_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category content_category NOT NULL,
    target_ratio DECIMAL(5,4) NOT NULL,
    sub_categories JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on content_ratio_config
ALTER TABLE content_ratio_config ENABLE ROW LEVEL SECURITY;

-- Public read access for ratio config
CREATE POLICY "Ratio config is publicly readable"
ON content_ratio_config FOR SELECT
USING (true);

-- Only admins can modify ratio config
CREATE POLICY "Admins can manage ratio config"
ON content_ratio_config FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default ratios
INSERT INTO content_ratio_config (category, target_ratio, sub_categories) VALUES
    ('tech', 0.68, '["ai", "apple", "tesla", "crypto", "general"]'),
    ('finance', 0.16, '["markets", "banking", "investing", "economy"]'),
    ('politics', 0.08, '["government", "elections", "policy", "international"]'),
    ('climate', 0.08, '["environment", "energy", "sustainability"]');

-- Create scrape statistics table for monitoring
CREATE TABLE scrape_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scrape_date DATE NOT NULL,
    category content_category NOT NULL,
    articles_count INTEGER DEFAULT 0,
    ratio_achieved DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scrape_date, category)
);

-- Enable RLS on scrape_statistics
ALTER TABLE scrape_statistics ENABLE ROW LEVEL SECURITY;

-- Admins can view scrape statistics
CREATE POLICY "Admins can view scrape statistics"
ON scrape_statistics FOR SELECT
USING (is_admin(auth.uid()));

-- System can insert/update scrape statistics
CREATE POLICY "System can manage scrape statistics"
ON scrape_statistics FOR ALL
USING (true);

-- Add topic_relevance function
CREATE OR REPLACE FUNCTION calculate_topic_relevance_score(article_id UUID)
RETURNS DECIMAL(10,6) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    confidence DECIMAL(3,2);
    base_score DECIMAL(10,6) := 50;
BEGIN
    SELECT COALESCE(category_confidence, 0.5) INTO confidence
    FROM articles WHERE id = article_id;
    
    -- Higher confidence = higher relevance
    base_score := base_score + (confidence * 50);
    
    RETURN LEAST(100, base_score);
END;
$$;

-- Add category_alignment function
CREATE OR REPLACE FUNCTION calculate_category_alignment_score(article_id UUID)
RETURNS DECIMAL(10,6) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    art_category content_category;
    target_ratio DECIMAL(5,4);
    current_ratio DECIMAL(5,4);
    alignment DECIMAL(10,6);
BEGIN
    SELECT content_category INTO art_category FROM articles WHERE id = article_id;
    
    IF art_category IS NULL THEN
        RETURN 50; -- Default score for unclassified articles
    END IF;
    
    SELECT crc.target_ratio INTO target_ratio FROM content_ratio_config crc 
    WHERE crc.category = art_category AND is_active = true;
    
    -- Get current 24h ratio
    SELECT COUNT(*)::DECIMAL / NULLIF(
        (SELECT COUNT(*) FROM articles WHERE created_at > NOW() - INTERVAL '24 hours'), 0
    ) INTO current_ratio
    FROM articles 
    WHERE articles.content_category = art_category 
    AND created_at > NOW() - INTERVAL '24 hours';
    
    -- Reward articles that help achieve target ratio
    IF current_ratio IS NULL OR current_ratio < target_ratio THEN
        alignment := 100; -- Needed to reach target
    ELSE
        alignment := 100 - (ABS(current_ratio - target_ratio) * 200);
    END IF;
    
    RETURN GREATEST(0, LEAST(100, alignment));
END;
$$;

-- Update existing sources with tech category
UPDATE sources SET content_category = 'tech' 
WHERE name ILIKE '%TechCrunch%' 
   OR name ILIKE '%Verge%' 
   OR name ILIKE '%Wired%' 
   OR name ILIKE '%Ars Technica%' 
   OR name ILIKE '%MIT Technology%'
   OR name ILIKE '%Engadget%'
   OR name ILIKE '%CNET%'
   OR name ILIKE '%VentureBeat%'
   OR name ILIKE '%Mashable%'
   OR name ILIKE '%ZDNet%';