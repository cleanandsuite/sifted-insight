-- =====================================================
-- NOOZ Affiliate Products Seed Data
-- Tech Audience = High Conversion
-- =====================================================

-- AI Tools Programs
INSERT INTO affiliate_programs (name, slug, description, commission_rate, cookie_days, signup_url, category) VALUES
('ChatGPT Plus', 'chatgpt-plus', 'OpenAI GPT-4 subscription with advanced features', 20.00, 30, 'https://chat.openai.com/', 'ai'),
('Claude Pro', 'claude-pro', 'Anthropic AI assistant subscription', 20.00, 30, 'https://claude.com/', 'ai'),
('Perplexity Pro', 'perplexity-pro', 'AI-powered search engine subscription', 20.00, 30, 'https://www.perplexity.ai/', 'ai'),
('Cursor AI', 'cursor-ai', 'AI-powered code editor', 20.00, 30, 'https://cursor.sh/', 'ai'),
('GitHub Copilot', 'github-copilot', 'AI pair programmer', 20.00, 30, 'https://github.com/features/copilot', 'ai'),
('Midjourney', 'midjourney', 'AI image generation', 10.00, 30, 'https://www.midjourney.com/', 'ai'),
('Notion AI', 'notion-ai', 'AI features in Notion workspace', 50.00, 30, 'https://www.notion.so/', 'software'),
('Raycast Pro', 'raycast-pro', 'AI-powered launcher for Mac', 20.00, 30, 'https://www.raycast.com/', 'software');

-- Gadgets Programs
INSERT INTO affiliate_programs (name, slug, description, commission_rate, cookie_days, signup_url, category) VALUES
('Anker', 'anker', 'Charging accessories and electronics', 8.00, 30, 'https://www.anker.com/', 'gadgets'),
('Apple', 'apple', 'Apple products through Apple Store', 3.00, 30, 'https://www.apple.com/', 'gadgets'),
('Amazon', 'amazon', 'Various tech products', 3.00, 24, 'https://www.amazon.com/', 'gadgets');

-- Software Programs
INSERT INTO affiliate_programs (name, slug, description, commission_rate, cookie_days, signup_url, category) VALUES
('Notion', 'notion', 'All-in-one workspace', 50.00, 30, 'https://www.notion.so/', 'software'),
('Linear', 'linear', 'Issue tracking for teams', 20.00, 30, 'https://linear.app/', 'software'),
('Vercel', 'vercel', 'Frontend cloud platform', 30.00, 30, 'https://vercel.com/', 'software'),
('Supabase', 'supabase', 'Open source Firebase alternative', 20.00, 30, 'https://supabase.com/', 'software');

-- Courses Programs
INSERT INTO affiliate_programs (name, slug, description, commission_rate, cookie_days, signup_url, category) VALUES
('Udemy', 'udemy', 'Online learning platform', 15.00, 30, 'https://www.udemy.com/', 'courses'),
('MasterClass', 'masterclass', 'Premium online courses', 20.00, 30, 'https://www.masterclass.com/', 'courses');

-- =====================================================
-- Popular AI Tools (High Converters for Tech Audience)
-- =====================================================

INSERT INTO affiliate_products (program_id, name, slug, description, image_url, affiliate_url, regular_price, sale_price, rating, review_count, category, tags, is_featured) VALUES
-- ChatGPT Products
((SELECT id FROM affiliate_programs WHERE slug = 'chatgpt-plus'), 
 'ChatGPT Plus', 'chatgpt-plus-monthly', 
 'Unlock GPT-4, GPT-4o, DALL-E, advanced voice mode, and faster responses. $20/month.',
 'https://cdn-icons-png.flaticon.com/512/5962/5962950.png',
 'https://chat.openai.com/',
 20.00, NULL, 4.70, 15000, 'ai_tool', ARRAY['ai', 'chatbot', 'gpt', 'openai'], true),

-- Claude Products  
((SELECT id FROM affiliate_programs WHERE slug = 'claude-pro'),
 'Claude Pro', 'claude-pro-subscription',
 'Sonnet 4 with 200K context window, 5x more usage than free tier.',
 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
 'https://claude.com/',
 20.00, NULL, 4.85, 8500, 'ai_tool', ARRAY['ai', 'assistant', 'anthropic', 'claude'], true),

-- Perplexity Products
((SELECT id FROM affiliate_programs WHERE slug = 'perplexity-pro'),
 'Perplexity Pro', 'perplexity-pro-subscription',
 'Unlimited copilot searches, advanced reasoning, and file uploads.',
 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
 'https://www.perplexity.ai/',
 20.00, NULL, 4.60, 5200, 'ai_tool', ARRAY['ai', 'search', 'research', 'perplexity'], true),

-- Cursor Products
((SELECT id FROM affiliate_programs WHERE slug = 'cursor-ai'),
 'Cursor Pro', 'cursor-pro-subscription',
 'The AI-first code editor. Write code 2x faster with AI features.',
 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
 'https://cursor.sh/',
 20.00, NULL, 4.75, 12000, 'ai_tool', ARRAY['ai', 'coding', 'editor', 'cursor'], true),

-- GitHub Copilot
((SELECT id FROM affiliate_programs WHERE slug = 'github-copilot'),
 'GitHub Copilot', 'github-copilot-monthly',
 'Your AI pair programmer. Code faster with AI suggestions.',
 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400',
 'https://github.com/features/copilot',
 10.00, NULL, 4.65, 25000, 'ai_tool', ARRAY['ai', 'coding', 'github', 'microsoft'], false),

-- Midjourney
((SELECT id FROM affiliate_programs WHERE slug = 'midjourney'),
 'Midjourney', 'midjourney-subscription',
 'Generate stunning AI images. Basic to Pro tiers available.',
 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
 'https://www.midjourney.com/',
 10.00, NULL, 4.55, 18000, 'ai_tool', ARRAY['ai', 'image', 'art', 'midjourney'], false),

-- Notion AI
((SELECT id FROM affiliate_programs WHERE slug = 'notion-ai'),
 'Notion AI', 'notion-ai-addon',
 'Write faster, summarize meetings, and automate tasks in Notion.',
 'https://images.unsplash.com/photo-1662947237406-73ad39661647?w=400',
 'https://www.notion.so/product/ai',
 50.00, NULL, 4.50, 8500, 'ai_tool', ARRAY['ai', 'productivity', 'workspace', 'notion'], false),

-- Raycast
((SELECT id FROM affiliate_programs WHERE slug = 'raycast-pro'),
 'Raycast Pro', 'raycast-pro-subscription',
 'AI-powered launcher for Mac. Save hours every week.',
 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=400',
 'https://www.raycast.com/',
 20.00, NULL, 4.80, 6500, 'software', ARRAY['mac', 'productivity', 'launcher', 'ai'], true),

-- Popular Software
((SELECT id FROM affiliate_programs WHERE slug = 'linear'),
 'Linear', 'linear-subscription',
 'Streamlined issue tracking for high-performing teams.',
 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
 'https://linear.app/',
 20.00, NULL, 4.70, 4200, 'software', ARRAY['project management', 'issues', 'tracking', 'linear'], false),

((SELECT id FROM affiliate_programs WHERE slug = 'vercel'),
 'Vercel', 'vercel-pro',
 'Deploy web projects with zero configuration.',
 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400',
 'https://vercel.com/',
 30.00, NULL, 4.65, 9800, 'software', ARRAY['hosting', 'deploy', 'frontend', 'vercel'], false),

-- Anker Products (Gadgets)
((SELECT id FROM affiliate_programs WHERE slug = 'anker'),
 'Anker PowerBank 20000mAh', 'anker-powerbank-20000',
 'Portable charger with fast charging for all devices.',
 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400',
 'https://www.amazon.com/s?k=anker+powerbank',
 8.00, NULL, 4.70, 45000, 'hardware', ARRAY['charging', 'portable', 'battery', 'anker'], false),

((SELECT id FROM affiliate_programs WHERE slug = 'anker'),
 'Anker Soundcore Life Note', 'anker-soundcore-life-note',
 'True wireless earbuds with AI-enhanced calls.',
 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
 'https://www.amazon.com/s?k=anker+earbuds',
 8.00, NULL, 4.50, 25000, 'hardware', ARRAY['audio', 'earbuds', 'wireless', 'anker'], false);

-- =====================================================
-- Course Recommendations
-- =====================================================

INSERT INTO affiliate_products (program_id, name, slug, description, image_url, affiliate_url, regular_price, sale_price, rating, review_count, category, tags, is_featured) VALUES
((SELECT id FROM affiliate_programs WHERE slug = 'udemy'),
 'AI & Machine Learning Bootcamp', 'udemy-ai-bootcamp',
 'Complete AI course covering ML, Deep Learning, and LLMs.',
 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
 'https://www.udemy.com/course/ai-machine-learning/',
 199.99, 19.99, 4.60, 52000, 'course', ARRAY['ai', 'machine learning', 'python', 'udemy'], true),

((SELECT id FROM affiliate_programs WHERE slug = 'masterclass')),
 'Walter Isaacson on AI', 'masterclass-walter-isaacson',
 'Learn about the innovators who shaped AI from the legendary biographer.',
 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400',
 'https://www.masterclass.com/classes/walter-isaacson-teaches-about-innovation',
 180.00, NULL, 4.70, 8500, 'course', ARRAY['ai', 'biography', 'innovation', 'masterclass'], false);
