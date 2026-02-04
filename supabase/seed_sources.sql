-- ============================================================================
-- SIFTED INSIGHT SEED DATA
-- Initial News Sources
-- ============================================================================

-- Insert initial tech and science news sources
-- All sources are high-quality, frequently updated, and relevant for tech/SaaS

-- ============================================================================
-- TECHCrunch
-- ============================================================================
INSERT INTO sources (name, rss_url, website_url, description, priority, scrape_interval_minutes) VALUES
('TechCrunch',
 'https://techcrunch.com/feed/',
 'https://techcrunch.com',
 'Leading technology media company focused on startups, apps, gadgets, and tech industry news. Coverage includes venture capital, acquisitions, and product launches.',
 'high',
 15);

-- ============================================================================
-- The Verge
-- ============================================================================
INSERT INTO sources (name, rss_url, website_url, description, priority, scrape_interval_minutes) VALUES
('The Verge',
 'https://www.theverge.com/rss/index.xml',
 'https://www.theverge.com',
 'Technology, science, art, and culture news from Vox Media. In-depth coverage of consumer electronics, entertainment, and the intersection of tech with everyday life.',
 'high',
 15);

-- ============================================================================
-- Wired
-- ============================================================================
INSERT INTO sources (name, rss_url, website_url, description, priority, scrape_interval_minutes) VALUES
('Wired',
 'https://www.wired.com/feed/rss',
 'https://www.wired.com',
 'Authoritative coverage of emerging technologies, science, culture, and business. Known for deep-dive analysis and long-form journalism on tech trends.',
 'high',
 20);

-- ============================================================================
-- Ars Technica
-- ============================================================================
INSERT INTO sources (name, rss_url, website_url, description, priority, scrape_interval_minutes) VALUES
('Ars Technica',
 'https://feeds.arstechnica.com/arstechnica/index',
 'https://arstechnica.com',
 'Premier technology news source known for technical depth and accurate reporting. Covers software, hardware, science, policy, and digital culture.',
 'high',
 20);

-- ============================================================================
-- MIT Technology Review
-- ============================================================================
INSERT INTO sources (name, rss_url, website_url, description, priority, scrape_interval_minutes) VALUES
('MIT Technology Review',
 'https://www.technologyreview.com/feed/',
 'https://www.technologyreview.com',
 'Founded at MIT, provides authoritative analysis of emerging technologies. Focus on AI, biotech, computing, and their societal impact.',
 'high',
 30);

-- ============================================================================
-- Product Hunt
-- ============================================================================
INSERT INTO sources (name, rss_url, website_url, description, priority, scrape_interval_minutes) VALUES
('Product Hunt',
 'https://www.producthunt.com/feed',
 'https://www.producthunt.com',
 'Curated platform for new products, startups, and indie makers. Excellent for discovering trending apps, SaaS tools, and launches.',
 'high',
 60);

-- ============================================================================
-- The Information (Tech Business Focus)
-- ============================================================================
INSERT INTO sources (name, rss_url, website_url, description, priority, scrape_interval_minutes) VALUES
('The Information',
 'https://www.theinformation.com/feed',
 'https://www.theinformation.com',
 'Premium tech business journalism. Deep coverage of Silicon Valley, startups, and major tech companies with a focus on business strategy.',
 'high',
 60);

-- ============================================================================
-- Hacker News (via YCombinator)
-- ============================================================================
INSERT INTO sources (name, rss_url, website_url, description, priority, scrape_interval_minutes) VALUES
('Hacker News',
 'https://news.ycombinator.com/rss',
 'https://news.ycombinator.com',
 'Community-curated tech news from Y Combinator. Excellent for understanding what the tech community finds most interesting.',
 'medium',
 30);

-- ============================================================================
-- ScienceDaily
-- ============================================================================
INSERT INTO sources (name, rss_url, website_url, description, priority, scrape_interval_minutes) VALUES
('ScienceDaily',
 'https://www.sciencedaily.com/rss/all.xml',
 'https://www.sciencedaily.com',
 'Latest science research news across multiple disciplines. Good for broader scientific context and discoveries.',
 'medium',
 60);

-- ============================================================================
-- VentureBeat (AI & Business)
-- ============================================================================
INSERT INTO sources (name, rss_url, website_url, description, priority, scrape_interval_minutes) VALUES
('VentureBeat',
 'https://venturebeat.com/feed/',
 'https://venturebeat.com',
 'Leading voice in transformative tech. Focus on AI, ML, gaming, and innovation. Known for data-driven analysis and industry reports.',
 'high',
 20);

-- ============================================================================
-- INITIAL CATEGORIES
-- ============================================================================

-- Core tech categories
INSERT INTO categories (name, slug, description) VALUES
('Artificial Intelligence', 'artificial-intelligence', 'AI, machine learning, and neural networks'),
('Software & SaaS', 'software-saas', 'Software products, SaaS platforms, and development tools'),
('Startups & Entrepreneurship', 'startups-entrepreneurship', 'Startup news, funding, and founder stories'),
('Hardware & Gadgets', 'hardware-gadgets', 'Consumer electronics and physical tech products'),
('Cybersecurity', 'cybersecurity', 'Security, privacy, and data protection'),
('Cloud Computing', 'cloud-computing', 'Cloud services, infrastructure, and platforms'),
('Data Science', 'data-science', 'Data analytics, visualization, and engineering'),
('Gaming', 'gaming', 'Video games, esports, and interactive entertainment'),
('Blockchain & Crypto', 'blockchain-crypto', 'Cryptocurrency, Web3, and decentralized tech'),
('Science & Research', 'science-research', 'Scientific discoveries and academic research');

-- ============================================================================
-- INITIAL TAGS
-- ============================================================================

-- Common tags for flexible categorization
INSERT INTO tags (name, slug) VALUES
('ChatGPT', 'chatgpt'),
('GPT-4', 'gpt-4'),
('LLMs', 'llms'),
('Generative AI', 'generative-ai'),
('SaaS', 'saas'),
('IPO', 'ipo'),
('Funding Round', 'funding-round'),
('Acquisition', 'acquisition'),
('Apple', 'apple'),
('Google', 'google'),
('Microsoft', 'microsoft'),
('Meta', 'meta'),
('Amazon', 'amazon'),
('NVIDIA', 'nvidia'),
('Tesla', 'tesla'),
('OpenAI', 'openai'),
('Anthropic', 'anthropic'),
('DeepMind', 'deepmind'),
('Midjourney', 'midjourney'),
('DevTools', 'devtools');

-- ============================================================================
-- VERIFICATION QUERIES (for reference)
-- ============================================================================

-- Check inserted sources:
-- SELECT id, name, priority, scrape_interval_minutes FROM sources;

-- Check inserted categories:
-- SELECT id, name, slug FROM categories;

-- Check inserted tags:
-- SELECT id, name, usage_count FROM tags;
