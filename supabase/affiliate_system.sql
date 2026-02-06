-- =====================================================
-- NOOZ Affiliate System Schema
-- =====================================================

-- Affiliate programs table
CREATE TABLE IF NOT EXISTS affiliate_programs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    commission_rate DECIMAL(5,2), -- e.g., 20.00 = 20%
    cookie_days INTEGER DEFAULT 30,
    signup_url TEXT NOT NULL,
    category VARCHAR(50), -- 'ai', 'software', 'gadgets', 'courses'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual affiliate links/products
CREATE TABLE IF NOT EXISTS affiliate_products (
    id BIGSERIAL PRIMARY KEY,
    program_id BIGINT REFERENCES affiliate_programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    affiliate_url TEXT NOT NULL,
    regular_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    rating DECIMAL(3,2), -- 4.50 stars
    review_count INTEGER DEFAULT 0,
    category VARCHAR(50), -- 'ai_tool', 'software', 'hardware', 'course'
    tags TEXT[], -- Array of tags for filtering
    is_featured BOOLEAN DEFAULT false,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track affiliate link clicks
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES affiliate_products(id) ON DELETE CASCADE,
    article_id BIGINT, -- If clicked from an article
    source VARCHAR(50), -- 'newsletter', 'article', 'sidebar', 'homepage'
    referrer TEXT,
    user_agent TEXT,
    ip_hash TEXT, -- Hashed for privacy
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track conversions (sales)
CREATE TABLE IF NOT EXISTS affiliate_conversions (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES affiliate_products(id) ON DELETE CASCADE,
    click_id BIGINT REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
    sale_amount DECIMAL(12,2),
    commission_earned DECIMAL(12,2),
    conversion_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter affiliate recommendations
CREATE TABLE IF NOT EXISTS affiliate_recommendations (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES affiliate_products(id) ON DELETE CASCADE,
    newsletter_issue INTEGER, -- Issue number
    position INTEGER, -- 1st, 2nd, 3rd recommendation
    custom_blurb TEXT,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics summary
CREATE TABLE IF NOT EXISTS affiliate_analytics (
    id BIGSERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    top_product_id BIGINT REFERENCES affiliate_products(id),
    top_category VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON affiliate_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_products_category ON affiliate_products(category);
CREATE INDEX IF NOT EXISTS idx_affiliate_products_active ON affiliate_products(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_date ON affiliate_conversions(conversion_date);

-- Functions
CREATE OR REPLACE FUNCTION update_affiliate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_affiliate_programs_updated
    BEFORE UPDATE ON affiliate_programs
    FOR EACH ROW EXECUTE FUNCTION update_affiliate_updated_at();

CREATE TRIGGER update_affiliate_products_updated
    BEFORE UPDATE ON affiliate_products
    FOR EACH ROW EXECUTE FUNCTION update_affiliate_updated_at();

-- Revenue tracking function
CREATE OR REPLACE FUNCTION track_affiliate_conversion()
RETURNS TRIGGER AS $$
DECLARE
    comm_rate DECIMAL(5,2);
    comm_amount DECIMAL(12,2);
BEGIN
    -- Get commission rate
    SELECT commission_rate INTO comm_rate
    FROM affiliate_programs WHERE id = (
        SELECT program_id FROM affiliate_products WHERE id = NEW.product_id
    );
    
    IF comm_rate IS NOT NULL THEN
        comm_amount := NEW.sale_amount * (comm_rate / 100);
    ELSE
        comm_amount := 0;
    END IF;
    
    NEW.commission_earned := comm_amount;
    
    -- Update product stats
    UPDATE affiliate_products 
    SET conversions = conversions + 1,
        revenue = revenue + comm_amount
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_conversion_commission
    BEFORE INSERT ON affiliate_conversions
    FOR EACH ROW EXECUTE FUNCTION track_affiliate_conversion();

-- Daily analytics aggregation
CREATE OR REPLACE FUNCTION aggregate_daily_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO affiliate_analytics (date, total_clicks, total_conversions, total_revenue)
    VALUES (
        CURRENT_DATE,
        (SELECT COUNT(*) FROM affiliate_clicks WHERE DATE(clicked_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM affiliate_conversions WHERE conversion_date = CURRENT_DATE),
        (SELECT COALESCE(SUM(commission_earned), 0) FROM affiliate_conversions WHERE conversion_date = CURRENT_DATE)
    )
    ON CONFLICT (date) DO UPDATE SET
        total_clicks = EXCLUDED.total_clicks,
        total_conversions = EXCLUDED.total_conversions,
        total_revenue = EXCLUDED.total_revenue,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Popular products view
CREATE OR REPLACE VIEW popular_affiliate_products AS
SELECT 
    p.*,
    ap.name as program_name,
    p.clicks + p.conversions * 10 as popularity_score
FROM affiliate_products p
JOIN affiliate_programs ap ON p.program_id = ap.id
WHERE p.is_active AND ap.is_active
ORDER BY popularity_score DESC
LIMIT 20;

-- Revenue by category
CREATE OR REPLACE VIEW revenue_by_category AS
SELECT 
    prog.category,
    SUM(ac.commission_earned) as total_revenue,
    COUNT(ac.id) as total_conversions,
    AVG(ac.commission_earned) as avg_commission
FROM affiliate_conversions ac
JOIN affiliate_products p ON ac.product_id = p.id
JOIN affiliate_programs prog ON p.program_id = prog.id
GROUP BY prog.category
ORDER BY total_revenue DESC;
