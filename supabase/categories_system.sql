-- ============================================================================
-- CATEGORIES TAGGING SYSTEM FOR SIFT
-- SQL Commands for Categories, Auto-Tagging, and Views
-- ============================================================================

-- ============================================================================
-- INSERT CATEGORIES
-- ============================================================================

INSERT INTO categories (name, slug, description) VALUES
('Artificial Intelligence', 'artificial-intelligence', 'AI, machine learning, deep learning, and neural networks'),
('Business & Finance', 'business-finance', 'Corporate news, markets, economy, and financial markets'),
('Climate & Environment', 'climate-environment', 'Climate change, environmental policy, and sustainability'),
('Culture & Entertainment', 'culture-entertainment', 'Arts, movies, music, TV, celebrities, and pop culture'),
('Health & Medicine', 'health-medicine', 'Healthcare, medical research, and public health'),
('Politics & Government', 'politics-government', 'Elections, policy, legislation, and government affairs'),
('Science & Research', 'science-research', 'Scientific discoveries, research breakthroughs, and academia'),
('Security & Privacy', 'security-privacy', 'Cybersecurity, data breaches, surveillance, and privacy rights'),
('Social Media', 'social-media', 'Social platforms, influencers, and digital communities'),
('Space & Astronomy', 'space-astronomy', 'Space exploration, NASA, astronomy, and cosmic discoveries'),
('Startups & Venture Capital', 'startups-venture-capital', '创业公司和风险投资'),
('Technology', 'technology', 'Enterprise tech, software, hardware, and industry trends'),
('Transportation', 'transportation', 'Automotive, aviation, public transit, and mobility'),
('Web3 & Crypto', 'web3-crypto', 'Blockchain, cryptocurrencies, DeFi, and NFTs'),
('Consumer Tech', 'consumer-tech', 'Gadgets, consumer electronics, and product reviews')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- CATEGORY KEYWORDS MAPPING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS category_keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    keyword VARCHAR(100) NOT NULL,
    weight INTEGER DEFAULT 1, -- Higher weight = stronger match
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on keyword
CREATE INDEX IF NOT EXISTS idx_category_keywords_keyword ON category_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_category_keywords_category ON category_keywords(category_id);

-- ============================================================================
-- INSERT CATEGORY KEYWORDS
-- ============================================================================

-- Artificial Intelligence
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('artificial intelligence', 3), ('ai ', 3), ('machine learning', 3), ('deep learning', 3),
    ('neural network', 3), ('llm', 2), ('large language model', 3), ('generative ai', 3),
    ('chatgpt', 2), ('claude', 2), ('gpt-', 2), ('transformer model', 3), ('nlp', 2),
    ('natural language processing', 3), ('computer vision', 3), ('autonomous', 2),
    ('automation', 1), ('robotics', 2), ('robot', 1), ('algorithmic', 1)
) AS t(keyword, weight)
WHERE c.slug = 'artificial-intelligence'
ON CONFLICT DO NOTHING;

-- Business & Finance
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('stock market', 3), ('wall street', 3), ('nasdaq', 2), ('dow jones', 2), ('s&p 500', 2),
    ('earnings', 2), ('revenue', 2), ('ipo', 3), ('initial public offering', 3),
    ('merger', 2), ('acquisition', 2), ('m&a', 2), ('quarterly results', 2),
    ('gdp', 2), ('inflation', 2), ('interest rate', 2), ('federal reserve', 2),
    ('central bank', 2), ('economy', 2), ('economic', 2), ('recession', 2),
    ('bankruptcy', 2), ('layoffs', 2), ('hiring', 1), ('jobs report', 2),
    ('treasury', 1), ('bond', 1), ('forex', 2), ('currency', 2), ('dollar', 1),
    ('revenue growth', 2), ('profit', 2), ('loss', 1), ('guidance', 2)
) AS t(keyword, weight)
WHERE c.slug = 'business-finance'
ON CONFLICT DO NOTHING;

-- Climate & Environment
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('climate change', 3), ('global warming', 3), ('greenhouse gas', 3), ('carbon emission', 3),
    ('net zero', 3), ('carbon neutral', 3), ('sustainability', 3), ('renewable energy', 2),
    ('solar power', 2), ('wind energy', 2), ('clean energy', 2), ('ev ', 2),
    ('electric vehicle', 2), ('battery', 1), ('climate crisis', 3), ('environmental', 2),
    ('deforestation', 2), ('pollution', 2), ('plastic', 1), ('recycling', 2),
    ('biodiversity', 2), ('conservation', 2), ('wildfire', 2), ('drought', 2),
    ('flood', 1), ('extreme weather', 2), ('sea level', 2), ('arctic', 1)
) AS t(keyword, weight)
WHERE c.slug = 'climate-environment'
ON CONFLICT DO NOTHING;

-- Culture & Entertainment
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('movie', 2), ('film', 2), ('cinema', 2), ('oscar', 3), ('academy awards', 3),
    ('grammy', 2), ('music', 1), ('album', 2), ('concert', 2), ('tour', 1),
    ('tv show', 2), ('television', 2), ('streaming', 2), ('netflix', 2), ('hbo', 2),
    ('disney+', 2), ('premiere', 2), ('trailer', 1), ('box office', 3), ('grossing', 2),
    ('celebrity', 2), ('actor', 2), ('actress', 2), ('director', 1), ('producer', 1),
    ('hollywood', 2), ('entertainment', 2), ('pop culture', 3), ('viral', 2),
    ('meme', 2), ('trending', 1), ('award', 2), ('festival', 2)
) AS t(keyword, weight)
WHERE c.slug = 'culture-entertainment'
ON CONFLICT DO NOTHING;

-- Health & Medicine
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('health', 2), ('healthcare', 2), ('hospital', 2), ('doctor', 2), ('nurse', 2),
    ('disease', 2), ('illness', 2), ('virus', 2), ('bacteria', 2), ('infection', 2),
    ('vaccine', 3), ('vaccination', 3), ('pandemic', 3), ('covid', 2), ('coronavirus', 2),
    ('cancer', 3), ('diabetes', 2), ('heart disease', 2), ('mental health', 3),
    ('depression', 2), ('anxiety', 2), ('treatment', 2), ('therapy', 2), ('drug', 1),
    ('fda', 2), ('approval', 2), ('clinical trial', 3), ('research', 1),
    ('breakthrough', 2), ('cure', 2), ('symptom', 2), ('diagnosis', 2), ('surgery', 2)
) AS t(keyword, weight)
WHERE c.slug = 'health-medicine'
ON CONFLICT DO NOTHING;

-- Politics & Government
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('congress', 2), ('senate', 2), ('house of representatives', 2), ('legislation', 2),
    ('bill', 2), ('law', 2), ('act ', 2), ('president', 2), ('presidential', 2),
    ('election', 3), ('vote', 2), ('voting', 2), ('voter', 2), ('campaign', 2),
    ('politician', 2), ('democrat', 2), ('republican', 2), ('party', 1), ('partisan', 2),
    ('government', 2), ('federal', 2), ('state ', 2), ('local government', 2),
    ('policy', 2), ('regulation', 2), ('administrative', 2), ('executive order', 3),
    ('supreme court', 3), ('court', 1), ('judge', 2), ('justice', 2), ('impeachment', 3),
    ('scandal', 2), ('investigation', 2), ('inquiry', 2), ('congressional', 2)
) AS t(keyword, weight)
WHERE c.slug = 'politics-government'
ON CONFLICT DO NOTHING;

-- Science & Research
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('scientist', 3), ('researcher', 3), ('study', 2), ('research', 3),
    ('discovery', 2), ('breakthrough', 2), ('experiment', 3), ('laboratory', 3),
    ('university', 2), ('academic', 3), ('journal', 2), ('paper', 1), ('peer-reviewed', 3),
    ('physics', 2), ('biology', 2), ('chemistry', 2), ('astronomy', 2), ('geology', 2),
    ('quantum', 2), ('particle', 2), ('genome', 3), ('gene', 3), ('dna', 3),
    ('evolution', 2), ('species', 2), ('extinction', 2), ('fossil', 2),
    ('theory', 1), ('hypothesis', 3), ('evidence', 2), ('data', 1)
) AS t(keyword, weight)
WHERE c.slug = 'science-research'
ON CONFLICT DO NOTHING;

-- Security & Privacy
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('cybersecurity', 3), ('hack', 3), ('hacker', 3), ('data breach', 3), ('breach', 2),
    ('malware', 3), ('ransomware', 3), ('phishing', 3), ('spyware', 3), ('virus', 1),
    ('cyber attack', 3), ('cyber threat', 3), ('security vulnerability', 3), ('exploit', 3),
    ('zero-day', 3), ('patch', 2), ('firewall', 2), ('encryption', 2), ('encrypt', 2),
    ('privacy', 3), ('data privacy', 3), ('surveillance', 2), ('tracking', 2),
    ('data collection', 2), ('personal data', 3), ('gdpr', 2), ('compliance', 1),
    ('authentication', 2), ('2fa', 2), ('mfa', 2), ('biometric', 2)
) AS t(keyword, weight)
WHERE c.slug = 'security-privacy'
ON CONFLICT DO NOTHING;

-- Social Media
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('facebook', 3), ('instagram', 3), ('twitter', 3), ('x ', 3), ('tiktok', 3),
    ('linkedin', 2), ('snapchat', 2), ('reddit', 2), ('threads', 3), ('mastodon', 2),
    ('social media', 3), ('platform', 1), ('influencer', 3), ('content creator', 3),
    ('follower', 1), ('engagement', 2), ('viral', 2), ('algorithm', 2),
    ('post', 1), ('tweet', 2), ('reel', 2), ('story', 1), ('live', 1),
    ('verified', 2), ('account', 1), ('ban', 2), ('censor', 2), ('content moderation', 3)
) AS t(keyword, weight)
WHERE c.slug = 'social-media'
ON CONFLICT DO NOTHING;

-- Space & Astronomy
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('space', 3), ('astronaut', 3), ('nasa', 3), ('esa', 2), ('spacex', 2),
    ('rocket', 3), ('launch', 2), ('satellite', 2), ('orbit', 2), ('orbital', 2),
    ('mars', 3), ('moon', 2), ('lunar', 2), ('planetary', 2), ('planet', 2),
    ('galaxy', 2), ('star', 1), ('supernova', 3), ('black hole', 3), ('nebula', 3),
    ('telescope', 2), ('hubble', 2), ('james webb', 3), ('jwst', 3),
    ('exploration', 2), ('mission', 1), ('station', 1), ('iss', 3), ('space station', 3),
    ('asteroid', 2), ('comet', 2), ('cosmology', 3), ('universe', 2)
) AS t(keyword, weight)
WHERE c.slug = 'space-astronomy'
ON CONFLICT DO NOTHING;

-- Technology
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('technology', 2), ('tech', 2), ('software', 2), ('hardware', 2),
    ('cloud', 2), ('aws', 2), ('azure', 2), ('google cloud', 2), ('gcp', 2),
    ('enterprise', 2), ('saas', 3), ('paas', 2), ('iaas', 2), ('api', 2),
    ('developer', 2), ('programming', 2), ('coding', 2), ('code', 1),
    ('database', 2), ('server', 1), ('network', 1), ('infrastructure', 2),
    ('chip', 2), ('processor', 2), ('semiconductor', 2), ('intel', 2), ('nvidia', 2),
    ('amd', 2), ('apple', 1), ('microsoft', 1), ('google', 1), ('amazon', 1),
    ('startup', 1), ('innovation', 1), ('digital transformation', 2)
) AS t(keyword, weight)
WHERE c.slug = 'technology'
ON CONFLICT DO NOTHING;

-- Transportation
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('automotive', 2), ('car', 2), ('vehicle', 2), ('truck', 2), ('suv', 2),
    ('electric vehicle', 2), ('ev ', 2), ('tesla', 2), ('ford', 2), ('gm', 2),
    ('autonomous driving', 3), ('self-driving', 3), ('autopilot', 2), ('driverless', 3),
    ('aviation', 2), ('airline', 2), ('flight', 2), ('airplane', 2), ('airport', 2),
    ('Boeing', 2), ('airbus', 2), ('pilot', 1), ('drone', 2),
    ('public transit', 2), ('subway', 2), ('metro', 2), ('bus', 1), ('train', 2),
    ('uber', 2), ('lyft', 2), ('ride-sharing', 2), ('mobility', 2),
    ('shipping', 1), ('logistics', 1), ('freight', 1), ('cargo', 1)
) AS t(keyword, weight)
WHERE c.slug = 'transportation'
ON CONFLICT DO NOTHING;

-- Web3 & Crypto
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('bitcoin', 3), ('ethereum', 3), ('cryptocurrency', 3), ('crypto', 3),
    ('blockchain', 3), ('web3', 3), ('defi', 3), ('decentralized', 3),
    ('nft', 3), ('token', 2), ('altcoin', 3), ('stablecoin', 3),
    ('exchange', 2), ('binance', 2), ('coinbase', 2), ('wallet', 2),
    ('smart contract', 3), ('dao', 3), ('metaverse', 2), ('digital asset', 2),
    ('mining', 2), ('proof of stake', 3), ('proof of work', 3), ('validator', 2),
    ('gas fee', 2), ('smart contract', 3), ('layer 2', 2)
) AS t(keyword, weight)
WHERE c.slug = 'web3-crypto'
ON CONFLICT DO NOTHING;

-- Consumer Tech
INSERT INTO category_keywords (category_id, keyword, weight) 
SELECT c.id, keyword, weight FROM categories c,
(VALUES
    ('smartphone', 3), ('iphone', 3), ('android', 2), ('samsung', 2), ('pixel', 2),
    ('laptop', 2), ('computer', 1), ('pc ', 2), ('macbook', 2), ('chromebook', 2),
    ('tablet', 2), ('ipad', 2), ('wearable', 2), ('smartwatch', 3), ('apple watch', 2),
    ('headphones', 2), ('earbuds', 2), ('airpods', 2), ('speaker', 1),
    ('smart home', 2), ('alexa', 2), ('google home', 2), ('nest', 2),
    ('gaming', 2), ('playstation', 2), ('xbox', 2), ('nintendo', 2), ('console', 2),
    ('tv', 1), ('smart tv', 2), ('oled', 2), ('4k', 1), ('8k', 2),
    ('camera', 1), ('dslr', 2), ('mirrorless', 2), ('drone', 1),
    ('review', 1), ('product', 1), ('launch', 1), ('announcement', 1)
) AS t(keyword, weight)
WHERE c.slug = 'consumer-tech'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AUTO-TAGGING FUNCTION
-- ============================================================================

-- Function to calculate category match score for text
CREATE OR REPLACE FUNCTION calculate_category_score(
    p_text TEXT,
    p_category_id UUID
) RETURNS INTEGER AS $$
DECLARE
    total_score INTEGER := 0;
    keyword_record RECORD;
BEGIN
    FOR keyword_record IN 
        SELECT keyword, weight FROM category_keywords WHERE category_id = p_category_id
    LOOP
        -- Case-insensitive search with word boundaries
        IF p_text ILIKE '%' || keyword_record.keyword || '%' THEN
            total_score := total_score + keyword_record.weight;
        END IF;
    END LOOP;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-classify an article into categories
CREATE OR REPLACE FUNCTION auto_classify_article(
    p_article_id UUID,
    p_title TEXT,
    p_content TEXT,
    p_min_score INTEGER DEFAULT 3,
    p_max_categories INTEGER DEFAULT 3
) RETURNS VOID AS $$
DECLARE
    article_text TEXT;
    cat_record RECORD;
    category_id UUID;
    cat_score INTEGER;
    is_primary BOOLEAN := true;
BEGIN
    -- Combine title and content for analysis
    article_text := COALESCE(p_title, '') || ' ' || COALESCE(p_content, '');
    
    -- Calculate scores for all active categories
    FOR cat_record IN 
        SELECT c.id, COALESCE(SUM(ck.weight), 0) as total_score
        FROM categories c
        LEFT JOIN category_keywords ck ON ck.category_id = c.id
        WHERE c.is_active = true
        GROUP BY c.id
        ORDER BY total_score DESC
    LOOP
        -- Re-calculate with full text matching
        cat_score := calculate_category_score(article_text, cat_record.id);
        
        IF cat_score >= p_min_score THEN
            INSERT INTO article_categories (article_id, category_id, is_primary)
            VALUES (p_article_id, cat_record.id, is_primary)
            ON CONFLICT (article_id, category_id) DO NOTHING;
            
            is_primary := false; -- Only first category is primary
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to classify article on insert (trigger-compatible)
CREATE OR REPLACE FUNCTION classify_new_article()
RETURNS TRIGGER AS $$
BEGIN
    -- Only auto-classify if categories are not already set
    IF NOT EXISTS (
        SELECT 1 FROM article_categories WHERE article_id = NEW.id
    ) THEN
        PERFORM auto_classify_article(
            NEW.id,
            NEW.title,
            COALESCE(NEW.content_raw, NEW.content_text, ''),
            3, -- min_score
            3  -- max_categories
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-classify articles on insert
DROP TRIGGER IF EXISTS trg_auto_classify_article ON articles;
CREATE TRIGGER trg_auto_classify_article
    AFTER INSERT ON articles
    FOR EACH ROW
    EXECUTE FUNCTION classify_new_article();

-- ============================================================================
-- CLASSIFY EXISTING ARTICLES (Batch Operation)
-- ============================================================================

CREATE OR REPLACE PROCEDURE classify_existing_articles(
    p_batch_size INTEGER DEFAULT 100,
    p_min_score INTEGER DEFAULT 3
) AS $$
DECLARE
    batch_articles CURSOR FOR 
        SELECT a.id, a.title, COALESCE(a.content_raw, a.content_text, '') as content
        FROM articles a
        WHERE NOT EXISTS (
            SELECT 1 FROM article_categories ac WHERE ac.article_id = a.id
        )
        ORDER BY a.created_at DESC
        LIMIT p_batch_size;
    
    article RECORD;
    classified_count INTEGER := 0;
BEGIN
    FOR article IN batch_articles LOOP
        PERFORM auto_classify_article(article.id, article.title, article.content, p_min_score, 3);
        classified_count := classified_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Classified % existing articles', classified_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR CATEGORY FILTERING
-- ============================================================================

-- View: Articles with their primary category
CREATE OR REPLACE VIEW articles_with_categories AS
SELECT 
    a.id as article_id,
    a.title,
    a.slug,
    a.summary,
    a.original_url,
    a.published_at,
    a.source_id,
    s.name as source_name,
    c.id as primary_category_id,
    c.name as primary_category,
    c.slug as category_slug,
    r.rank_score
FROM articles a
JOIN sources s ON s.id = a.source_id
LEFT JOIN article_categories ac ON ac.article_id = a.id AND ac.is_primary = true
LEFT JOIN categories c ON c.id = ac.category_id
LEFT JOIN rankings r ON r.article_id = a.id
WHERE a.status = 'published';

-- View: All categories with article counts
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    COUNT(DISTINCT ac.article_id) as article_count,
    MAX(a.published_at) as latest_article_at,
    c.is_active,
    c.created_at
FROM categories c
LEFT JOIN article_categories ac ON ac.category_id = c.id
LEFT JOIN articles a ON a.id = ac.article_id AND a.status = 'published'
GROUP BY c.id
ORDER BY article_count DESC NULLS LAST;

-- View: Articles filtered by category slug (for /category/:slug pages)
CREATE OR REPLACE VIEW articles_by_category AS
SELECT 
    a.id,
    a.title,
    a.slug,
    a.summary,
    a.original_url,
    a.published_at,
    s.id as source_id,
    s.name as source_name,
    s.website_url as source_url,
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    r.rank_score,
    r.recency_score,
    r.authority_score,
    r.engagement_score,
    r.rank_tier
FROM articles a
JOIN sources s ON s.id = a.source_id
JOIN article_categories ac ON ac.article_id = a.id
JOIN categories c ON c.id = ac.category_id
LEFT JOIN rankings r ON r.article_id = a.id
WHERE a.status = 'published' AND c.is_active = true;

-- View: Articles with all their categories (for multi-category display)
CREATE OR REPLACE VIEW articles_categories_detailed AS
SELECT 
    a.id as article_id,
    a.title,
    a.slug,
    a.summary,
    a.original_url,
    a.published_at,
    s.id as source_id,
    s.name as source_name,
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    ac.is_primary,
    r.rank_score
FROM articles a
JOIN sources s ON s.id = a.source_id
LEFT JOIN article_categories ac ON ac.article_id = a.id
LEFT JOIN categories c ON c.id = ac.category_id
LEFT JOIN rankings r ON r.article_id = a.id
WHERE a.status = 'published'
ORDER BY a.published_at DESC, ac.is_primary DESC;

-- ============================================================================
-- HELPER FUNCTIONS FOR CATEGORY UI
-- ============================================================================

-- Function to get all categories for filter bar
CREATE OR REPLACE FUNCTION get_categories_for_filter()
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    article_count BIGINT,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        COALESCE(cs.article_count, 0)::BIGINT as article_count,
        c.is_active
    FROM categories c
    LEFT JOIN category_stats cs ON cs.id = c.id
    WHERE c.is_active = true
    ORDER BY cs.article_count DESC NULLS LAST, c.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get articles by category slug (for API/frontend)
CREATE OR REPLACE FUNCTION get_articles_by_category_slug(
    p_category_slug TEXT,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    summary TEXT,
    original_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    source_id UUID,
    source_name TEXT,
    rank_score DECIMAL(10, 6),
    rank_tier VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.slug,
        a.summary,
        a.original_url,
        a.published_at,
        s.id as source_id,
        s.name as source_name,
        r.rank_score,
        r.rank_tier
    FROM articles a
    JOIN sources s ON s.id = a.source_id
    JOIN categories c ON c.slug = get_articles_by_category_slug.p_category_slug
    JOIN article_categories ac ON ac.article_id = a.id AND ac.category_id = c.id
    LEFT JOIN rankings r ON r.article_id = a.id
    WHERE a.status = 'published'
    ORDER BY 
        CASE WHEN r.rank_score IS NOT NULL THEN r.rank_score ELSE 0 END DESC,
        a.published_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Public categories read access" ON categories
    FOR SELECT USING (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE categories IS 'News categories for article classification';
COMMENT ON TABLE category_keywords IS 'Keywords used for automatic category matching';
COMMENT ON VIEW articles_with_categories IS 'Articles with their primary category';
COMMENT ON VIEW category_stats IS 'Category statistics with article counts';
COMMENT ON VIEW articles_by_category IS 'Articles filtered by category';
COMMENT ON FUNCTION auto_classify_article IS 'Automatically classifies an article into categories based on keyword matching';
COMMENT ON FUNCTION get_categories_for_filter IS 'Returns all active categories with article counts for filter UI';
COMMENT ON FUNCTION get_articles_by_category_slug IS 'Returns articles for a specific category slug (paginated)';
