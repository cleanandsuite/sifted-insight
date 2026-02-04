-- ============================================================================
-- SIFTED INSIGHT DATABASE SCHEMA
-- AI Article Summarizer and Ranking Platform
-- Supabase (PostgreSQL)
-- ============================================================================

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE article_status AS ENUM ('pending', 'processing', 'published', 'failed', 'archived');

CREATE TYPE source_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE scrape_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');

-- ============================================================================
-- SOURCES TABLE
-- Stores news source information for RSS feeds and scraping
-- ============================================================================

CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    rss_url TEXT,
    website_url TEXT,
    description TEXT,
    priority source_priority DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    scrape_interval_minutes INTEGER DEFAULT 30,
    last_scrape_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sources_active ON sources(is_active);
CREATE INDEX idx_sources_priority ON sources(priority DESC);

-- ============================================================================
-- CATEGORIES TABLE
-- Categories for article classification
-- ============================================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================================================
-- TAGS TABLE
-- Tags for flexible article tagging
-- ============================================================================

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_usage ON tags(usage_count DESC);

-- ============================================================================
-- ARTICLES TABLE
-- Main table storing scraped and processed articles
-- ============================================================================

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255), -- ID from the source system
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(600) NOT NULL,
    summary TEXT, -- Brief summary from RSS or initial scrape
    original_url TEXT NOT NULL,
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    content_hash VARCHAR(64), -- SHA-256 hash to detect duplicates
    content_raw TEXT, -- Raw HTML content
    content_text TEXT, -- Plain text content
    word_count INTEGER,
    status article_status DEFAULT 'pending',
    scraped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT articles_slug_source_unique UNIQUE (slug, source_id)
);

CREATE INDEX idx_articles_source ON articles(source_id);
CREATE INDEX idx_articles_published ON articles(published_at DESC);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_url_hash ON articles(content_hash);
CREATE INDEX idx_articles_created ON articles(created_at DESC);

-- ============================================================================
-- ARTICLE-CATEGORY RELATION
-- ============================================================================

CREATE TABLE article_categories (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    PRIMARY KEY (article_id, category_id)
);

CREATE INDEX idx_article_categories_article ON article_categories(article_id);
CREATE INDEX idx_article_categories_category ON article_categories(category_id);

-- ============================================================================
-- ARTICLE-TAG RELATION
-- ============================================================================

CREATE TABLE article_tags (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);

-- ============================================================================
-- SUMMARIES TABLE
-- AI-generated summaries for articles
-- ============================================================================

CREATE TABLE summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
    summary_type VARCHAR(50) DEFAULT 'standard', -- 'brief', 'standard', 'detailed'
    
    -- Core summary content
    executive_summary TEXT,
    key_points JSONB, -- Array of key points as JSON
    analysis TEXT, -- AI analysis of the article
    takeaways TEXT, -- Actionable takeaways
    
    -- Metadata
    model_used VARCHAR(100),
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    processing_time_ms INTEGER,
    word_count_reduction DECIMAL(5, 2), -- Percentage reduction from original
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_summaries_article ON summaries(article_id);
CREATE INDEX idx_summaries_type ON summaries(summary_type);

-- ============================================================================
-- RANKINGS TABLE
-- Stores ranking scores and factors for articles
-- ============================================================================

CREATE TABLE rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
    rank_score DECIMAL(10, 6) NOT NULL DEFAULT 0,
    
    -- Component scores (for transparency and debugging)
    recency_score DECIMAL(10, 6) DEFAULT 0,
    authority_score DECIMAL(10, 6) DEFAULT 0,
    engagement_score DECIMAL(10, 6) DEFAULT 0,
    content_score DECIMAL(10, 6) DEFAULT 0,
    
    -- Raw factors stored as JSON for flexibility
    ranking_factors JSONB DEFAULT '{}',
    
    -- Computed values
    rank_position INTEGER,
    rank_tier VARCHAR(20), -- 'hot', 'rising', 'steady', 'declining'
    
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- For time-decayed rankings
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rankings_article ON rankings(article_id);
CREATE INDEX idx_rankings_score ON rankings(rank_score DESC);
CREATE INDEX idx_rankings_computed ON rankings(computed_at DESC);
CREATE INDEX idx_rankings_expires ON rankings(expires_at DESC NULLS LAST);

-- ============================================================================
-- SCRAPE_HISTORY TABLE
-- Tracks scraping operations for monitoring
-- ============================================================================

CREATE TABLE scrape_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
    status scrape_status DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    articles_found INTEGER DEFAULT 0,
    articles_new INTEGER DEFAULT 0,
    articles_updated INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scrape_history_source ON scrape_history(source_id);
CREATE INDEX idx_scrape_history_status ON scrape_history(status);
CREATE INDEX idx_scrape_history_started ON scrape_history(started_at DESC);

-- ============================================================================
-- USER_PREFERENCES TABLE
-- User settings for personalization (minimal auth integration)
-- ============================================================================

CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_identifier VARCHAR(255) NOT NULL, -- Email or external user ID
    
    -- Preferences
    preferred_sources UUID[], -- Array of source IDs
    excluded_sources UUID[], -- Array of source IDs
    preferred_categories UUID[], -- Array of category IDs
    preferred_tags UUID[], -- Array of tag IDs
    
    -- Display settings
    items_per_page INTEGER DEFAULT 20,
    default_summary_length VARCHAR(50) DEFAULT 'standard',
    dark_mode BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT user_preferences_unique UNIQUE (user_identifier)
);

CREATE INDEX idx_user_preferences_identifier ON user_preferences(user_identifier);

-- ============================================================================
-- ARTICLE_INTERACTIONS TABLE
-- Tracks user engagement for personalization
-- ============================================================================

CREATE TABLE article_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_identifier VARCHAR(255),
    
    interaction_type VARCHAR(50), -- 'view', 'click', 'save', 'share', 'dismiss'
    interaction_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interactions_article ON article_interactions(article_id);
CREATE INDEX idx_interactions_user ON article_interactions(user_identifier);
CREATE INDEX idx_interactions_type ON article_interactions(interaction_type);
CREATE INDEX idx_interactions_created ON article_interactions(created_at DESC);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rankings_updated_at BEFORE UPDATE ON rankings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SLUG GENERATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_article_slug(title TEXT, source_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from title
    base_slug := LOWER(REGEXP_REPLACE(title, '[^a-z0-9]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);
    base_slug := LEFT(base_slug, 100); -- Limit length
    
    new_slug := base_slug;
    
    -- Ensure uniqueness by appending counter if needed
    WHILE EXISTS (
        SELECT 1 FROM articles 
        WHERE slug = new_slug 
        AND source_id = generate_article_slug.source_id
    ) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter::TEXT;
        EXIT WHEN counter > 1000; -- Safety limit
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENT ON SCHEMA
-- ============================================================================

COMMENT ON TABLE sources IS 'News sources for article aggregation';
COMMENT ON TABLE categories IS 'Hierarchical categories for article classification';
COMMENT ON TABLE tags IS 'Flexible tagging system for articles';
COMMENT ON TABLE articles IS 'Main article storage with metadata';
COMMENT ON TABLE summaries IS 'AI-generated summaries and analysis';
COMMENT ON TABLE rankings IS 'Computed ranking scores and factors';
COMMENT ON TABLE scrape_history IS 'Scraping operation history for monitoring';
COMMENT ON TABLE user_preferences IS 'User personalization settings';
COMMENT ON TABLE article_interactions IS 'User engagement tracking';
