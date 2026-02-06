-- Migration: Seed articles
-- Generated: 2026-02-04

-- Add source_name column if it doesn't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_name VARCHAR(100);

-- Insert articles with slugs
INSERT INTO articles (title, original_url, summary, content_text, source_name, published_at, status, slug) VALUES
('Bloomberg House at Davos 2026 Highlights', 'https://www.bloomberg.com/news/videos/2026-02-04/bloomberg-house-at-davos-2026-highlights-video', 'Davos 2026: AI leaders like Dario Amodei, Demis Hassabis, Yuval Noah Harari convened.', 'From artificial intelligence and global security to markets, trade and resilience.', 'Bloomberg', '2026-02-04T18:31:58Z', 'published', 'bloomberg-house-davos-2026'),

('Software Short Sellers Mint $24 Billion', 'https://www.bloomberg.com/news/articles/2026-02-04/software-short-sellers-mint-24-billion-profit-as-stocks-tumble', 'Software stocks rout benefits short sellers to the tune of $24B.', 'A brutal rout in software stocks has rattled investors across Wall Street.', 'Bloomberg', '2026-02-04T18:22:20Z', 'published', 'software-short-sellers-24-billion'),

('Google Earnings Ahead as AI Fears Grow', 'https://www.bloomberg.com/news/videos/2026-02-04/google-earnings-ahead-as-ai-fears-grow-video', 'Investors await Google earnings as AI disruption fears ripple markets.', 'Fears of AI disruption ripple through markets, hitting software makers.', 'Bloomberg', '2026-02-04T18:15:20Z', 'published', 'google-earnings-ai-fears'),

('Alphabet Earnings Need to Justify Its Stock''s $2 Trillion Rally', 'https://www.bloomberg.com/news/articles/2026-02-04/alphabet-earnings-need-to-justify-its-stock-s-2-trillion-rally', 'Alphabet is rapidly becoming the leader in almost every major part of AI.', 'Alphabet Inc. is rapidly becoming seen as the leader in almost every major part of the artificial intelligence industry.', 'Bloomberg', '2026-02-04T11:40:20Z', 'published', 'alphabet-earnings-2-trillion-rally'),

('OpenAI Revenue Hits $1 Billion as AI Adoption Accelerates', 'https://www.wired.com/story/openai-revenue-hits-1-billion-ai-adoption-accelerates', 'OpenAI has reached $1 billion in annual recurring revenue.', 'OpenAI has reached $1 billion in annual recurring revenue, driven by the rapid adoption of ChatGPT.', 'Wired', '2026-02-04T10:00:00Z', 'published', 'openai-revenue-1-billion'),

('MIT Tech Review: The Future of AI Agents', 'https://www.technologyreview.com/2026/02/04/future-of-ai-agents', 'AI agents are evolving from chatbots to autonomous workers.', 'The next generation of AI systems will act autonomously on behalf of users.', 'MIT Tech Review', '2026-02-04T09:30:00Z', 'published', 'mit-tech-review-future-ai-agents'),

('The Atlantic: How AI is Changing Knowledge Work', 'https://www.theatlantic.com/technology/archive/2026/02/ai-knowledge-work', 'AI is fundamentally reshaping how we think about work and creativity.', 'The boundaries between human and machine intelligence are blurring.', 'The Atlantic', '2026-02-04T08:45:00Z', 'published', 'atlantic-ai-knowledge-work'),

('TechCrunch: Startup Funding Shifts to AI Infrastructure', 'https://techcrunch.com/2026/02/04/ai-infrastructure-funding', 'VCs are pouring billions into AI infrastructure companies.', 'The gold rush in AI is less about apps and more about the underlying infrastructure.', 'TechCrunch', '2026-02-04T08:00:00Z', 'published', 'techcrunch-ai-infrastructure-funding');
