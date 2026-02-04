-- ============================================================================
-- SIFTED INSIGHT DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE article_status AS ENUM ('pending', 'processing', 'published', 'failed', 'archived');
CREATE TYPE source_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- ============================================================================
-- SOURCES TABLE
-- ============================================================================

CREATE TABLE public.sources (
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

CREATE INDEX idx_sources_active ON public.sources(is_active);
CREATE INDEX idx_sources_priority ON public.sources(priority DESC);

-- Enable RLS
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- Public read access for sources
CREATE POLICY "Sources are publicly readable"
ON public.sources FOR SELECT
USING (true);

-- ============================================================================
-- ARTICLES TABLE
-- ============================================================================

CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(600) NOT NULL,
    summary TEXT,
    original_url TEXT NOT NULL,
    source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    media_url TEXT,
    media_type VARCHAR(50) DEFAULT 'image',
    tags TEXT[] DEFAULT '{}',
    original_read_time INTEGER DEFAULT 10,
    sifted_read_time INTEGER DEFAULT 2,
    is_featured BOOLEAN DEFAULT false,
    status article_status DEFAULT 'pending',
    rank_score DECIMAL(10, 6) DEFAULT 0,
    engagement_score DECIMAL(10, 6) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT articles_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_articles_source ON public.articles(source_id);
CREATE INDEX idx_articles_published ON public.articles(published_at DESC);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_featured ON public.articles(is_featured);
CREATE INDEX idx_articles_rank ON public.articles(rank_score DESC);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public read access for published articles
CREATE POLICY "Published articles are publicly readable"
ON public.articles FOR SELECT
USING (status = 'published');

-- ============================================================================
-- SUMMARIES TABLE
-- ============================================================================

CREATE TABLE public.summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE UNIQUE,
    executive_summary TEXT,
    key_points JSONB DEFAULT '[]',
    analysis TEXT,
    takeaways JSONB DEFAULT '[]',
    model_used VARCHAR(100),
    confidence_score DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_summaries_article ON public.summaries(article_id);

-- Enable RLS
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- Public read access for summaries
CREATE POLICY "Summaries are publicly readable"
ON public.summaries FOR SELECT
USING (true);

-- ============================================================================
-- RANKINGS TABLE
-- ============================================================================

CREATE TABLE public.rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE UNIQUE,
    rank_score DECIMAL(10, 6) NOT NULL DEFAULT 0,
    recency_score DECIMAL(10, 6) DEFAULT 0,
    authority_score DECIMAL(10, 6) DEFAULT 0,
    engagement_score DECIMAL(10, 6) DEFAULT 0,
    content_score DECIMAL(10, 6) DEFAULT 0,
    ranking_factors JSONB DEFAULT '{}',
    rank_position INTEGER,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rankings_article ON public.rankings(article_id);
CREATE INDEX idx_rankings_score ON public.rankings(rank_score DESC);

-- Enable RLS
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Public read access for rankings
CREATE POLICY "Rankings are publicly readable"
ON public.rankings FOR SELECT
USING (true);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_summaries_updated_at BEFORE UPDATE ON public.summaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rankings_updated_at BEFORE UPDATE ON public.rankings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();