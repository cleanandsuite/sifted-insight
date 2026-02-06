-- Add video game tech sources
INSERT INTO public.sources (name, rss_url, website_url, description, content_category, priority, is_active, scrape_interval_minutes)
VALUES 
  ('Ars Technica Gaming', 'https://feeds.arstechnica.com/arstechnica/gaming', 'https://arstechnica.com/gaming/', 'In-depth gaming technology analysis and industry news', 'video_games', 'high', true, 30),
  ('The Verge Gaming', 'https://www.theverge.com/rss/games/index.xml', 'https://www.theverge.com/games', 'Gaming tech news from The Verge', 'video_games', 'high', true, 30),
  ('Wired Gaming', 'https://www.wired.com/feed/category/games/latest/rss', 'https://www.wired.com/category/games/', 'Gaming culture and technology coverage', 'video_games', 'medium', true, 60),
  ('Polygon', 'https://www.polygon.com/rss/index.xml', 'https://www.polygon.com/', 'Gaming news, reviews, and tech analysis', 'video_games', 'high', true, 30),
  ('IGN Tech', 'https://feeds.feedburner.com/ign/games-all', 'https://www.ign.com/tech', 'Gaming and entertainment technology news', 'video_games', 'medium', true, 45),
  ('Eurogamer', 'https://www.eurogamer.net/?format=rss', 'https://www.eurogamer.net/', 'European gaming technology and industry analysis', 'video_games', 'medium', true, 60);

-- Update content ratio config to include video_games
INSERT INTO public.content_ratio_config (category, target_ratio, is_active)
VALUES ('video_games', 0.10, true);

-- Adjust other ratios to accommodate video_games (total = 1.0)
UPDATE public.content_ratio_config SET target_ratio = 0.58 WHERE category = 'tech';
UPDATE public.content_ratio_config SET target_ratio = 0.14 WHERE category = 'finance';
UPDATE public.content_ratio_config SET target_ratio = 0.09 WHERE category = 'politics';
UPDATE public.content_ratio_config SET target_ratio = 0.09 WHERE category = 'climate';