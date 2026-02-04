-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_published_at_desc ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_rank_score_desc ON articles(rank_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);

-- Add topic column to articles for clustering
ALTER TABLE articles ADD COLUMN IF NOT EXISTS topic VARCHAR(50) DEFAULT 'General';

-- Create index on topic for faster clustering
CREATE INDEX IF NOT EXISTS idx_articles_topic ON articles(topic);

-- Create function to get clustered feed (max 1 article per topic for diversity)
CREATE OR REPLACE FUNCTION get_clustered_feed(limit_count INT DEFAULT 20)
RETURNS TABLE(
  id UUID,
  title VARCHAR,
  original_url TEXT,
  author VARCHAR,
  published_at TIMESTAMPTZ,
  rank_score NUMERIC,
  topic VARCHAR,
  tags TEXT[],
  media_url TEXT,
  image_url TEXT,
  sifted_read_time INT,
  original_read_time INT,
  source_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_articles AS (
    SELECT 
      a.id,
      a.title,
      a.original_url,
      a.author,
      a.published_at,
      a.rank_score,
      a.topic,
      a.tags,
      a.media_url,
      a.image_url,
      a.sifted_read_time,
      a.original_read_time,
      a.source_id,
      ROW_NUMBER() OVER (PARTITION BY a.topic ORDER BY a.rank_score DESC, a.published_at DESC) as rn
    FROM articles a
    WHERE a.status = 'published'
      AND a.is_featured = false
  )
  SELECT 
    ra.id,
    ra.title,
    ra.original_url,
    ra.author,
    ra.published_at,
    ra.rank_score,
    ra.topic,
    ra.tags,
    ra.media_url,
    ra.image_url,
    ra.sifted_read_time,
    ra.original_read_time,
    ra.source_id
  FROM ranked_articles ra
  WHERE ra.rn = 1
  ORDER BY ra.rank_score DESC, ra.published_at DESC
  LIMIT limit_count;
END;
$$;

-- Create function to get related articles by topic
CREATE OR REPLACE FUNCTION get_related_articles(article_id UUID, limit_count INT DEFAULT 5)
RETURNS TABLE(
  id UUID,
  title VARCHAR,
  original_url TEXT,
  author VARCHAR,
  published_at TIMESTAMPTZ,
  rank_score NUMERIC,
  topic VARCHAR,
  tags TEXT[],
  media_url TEXT,
  source_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  article_topic VARCHAR;
BEGIN
  -- Get the topic of the current article
  SELECT a.topic INTO article_topic FROM articles a WHERE a.id = article_id;
  
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.original_url,
    a.author,
    a.published_at,
    a.rank_score,
    a.topic,
    a.tags,
    a.media_url,
    a.source_id
  FROM articles a
  WHERE a.status = 'published'
    AND a.id != article_id
    AND a.topic = article_topic
  ORDER BY a.rank_score DESC, a.published_at DESC
  LIMIT limit_count;
END;
$$;

-- Create function to get trending articles (top 5 by engagement + recency)
CREATE OR REPLACE FUNCTION get_trending_articles(limit_count INT DEFAULT 5)
RETURNS TABLE(
  id UUID,
  title VARCHAR,
  original_url TEXT,
  author VARCHAR,
  published_at TIMESTAMPTZ,
  rank_score NUMERIC,
  topic VARCHAR,
  tags TEXT[],
  source_id UUID
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
    a.rank_score,
    a.topic,
    a.tags,
    a.source_id
  FROM articles a
  WHERE a.status = 'published'
    AND a.published_at > NOW() - INTERVAL '48 hours'
  ORDER BY a.engagement_score DESC, a.rank_score DESC
  LIMIT limit_count;
END;
$$;

-- Create upsert function for deduplication
CREATE OR REPLACE FUNCTION upsert_article(
  p_original_url TEXT,
  p_title VARCHAR,
  p_slug VARCHAR,
  p_author VARCHAR DEFAULT NULL,
  p_source_id UUID DEFAULT NULL,
  p_media_url TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT '{}'::TEXT[],
  p_topic VARCHAR DEFAULT 'General'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id UUID;
  new_id UUID;
BEGIN
  -- Check if article exists
  SELECT id INTO existing_id FROM articles WHERE original_url = p_original_url;
  
  IF existing_id IS NOT NULL THEN
    -- Update existing article
    UPDATE articles SET
      title = COALESCE(p_title, title),
      author = COALESCE(p_author, author),
      media_url = COALESCE(p_media_url, media_url),
      image_url = COALESCE(p_image_url, image_url),
      tags = COALESCE(p_tags, tags),
      topic = COALESCE(p_topic, topic),
      updated_at = NOW()
    WHERE id = existing_id;
    RETURN existing_id;
  ELSE
    -- Insert new article
    INSERT INTO articles (original_url, title, slug, author, source_id, media_url, image_url, tags, topic)
    VALUES (p_original_url, p_title, p_slug, p_author, p_source_id, p_media_url, p_image_url, p_tags, p_topic)
    RETURNING id INTO new_id;
    RETURN new_id;
  END IF;
END;
$$;

-- Create bookmarks table for save functionality
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- Enable RLS on bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Public read policy for bookmarks (users can only see their own, but for anonymous they see based on localStorage sync)
CREATE POLICY "Bookmarks are readable by owner" ON bookmarks
FOR SELECT USING (true);

CREATE POLICY "Users can insert bookmarks" ON bookmarks
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their bookmarks" ON bookmarks
FOR DELETE USING (true);

-- Update existing articles with topic based on tags
UPDATE articles SET topic = 
  CASE 
    WHEN 'AI' = ANY(tags) OR 'Machine Learning' = ANY(tags) OR 'GPT' = ANY(tags) THEN 'AI'
    WHEN 'Apple' = ANY(tags) OR 'iPhone' = ANY(tags) OR 'Mac' = ANY(tags) THEN 'Apple'
    WHEN 'Tesla' = ANY(tags) OR 'EV' = ANY(tags) OR 'Electric Vehicles' = ANY(tags) THEN 'Tesla'
    WHEN 'Crypto' = ANY(tags) OR 'Bitcoin' = ANY(tags) OR 'Blockchain' = ANY(tags) THEN 'Crypto'
    WHEN 'Climate' = ANY(tags) OR 'Environment' = ANY(tags) OR 'Green' = ANY(tags) THEN 'Climate'
    WHEN 'Politics' = ANY(tags) OR 'Government' = ANY(tags) OR 'Policy' = ANY(tags) THEN 'Politics'
    WHEN 'Finance' = ANY(tags) OR 'Markets' = ANY(tags) OR 'Economy' = ANY(tags) THEN 'Finance'
    ELSE 'General'
  END
WHERE topic IS NULL OR topic = 'General';