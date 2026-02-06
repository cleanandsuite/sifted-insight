#!/usr/bin/env python3
"""Generate MANUAL_ARTICLE_SEED.sql with image URLs"""
import json
import re
from datetime import datetime

def slugify(text):
    """Create URL-friendly slug"""
    text = text.lower()[:60]
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text

with open('scraped_articles.json') as f:
    articles = json.load(f)

sql = """-- =====================================================
-- MANUAL ARTICLE SEED - Run in Supabase SQL Editor
-- Generated: """ + datetime.now().strftime('%Y-%m-%d %H:%M') + """
-- Open: https://jmhtzyctxntaojuovrtf.supabase.co/sql
-- =====================================================

-- Add columns if they don't exist
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_name VARCHAR(100);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Get source IDs
"""

# Get/create source mapping
sources = {}
for a in articles:
    src = a['source_name']
    if src not in sources:
        sources[src] = f"'{src}'"

sql += "-- Source mapping (replace with actual UUIDs from sources table)\n"
for src, placeholder in sources.items():
    sql += f"-- {src}: {placeholder}\n"

sql += """
-- Insert articles
INSERT INTO articles (title, original_url, summary, content_text, source_name, image_url, published_at, status, slug) VALUES
"""

values = []
for a in articles:
    title = a['title'].replace("'", "''")[:450]
    url = a['url'].replace("'", "''")
    summary = (a.get('summary', '') or a.get('content', '')[:500]).replace("'", "''")
    content = (a.get('content', '') or a['summary'][:2000]).replace("'", "''")
    src = a['source_name']
    img = (a.get('image_url') or '').replace("'", "''")
    published = a['published_at'][:19].replace('T', ' ') + 'Z' if 'T' in a['published_at'] else a['published_at'][:19]
    slug = slugify(a['title'])
    
    values.append(f"('{title}', '{url}', '{summary}', '{content}', '{src}', '{img}', '{published}', 'published', '{slug}')")

sql += ',\n'.join(values) + ';\n\n-- Verify'
sql += """
SELECT COUNT(*) as articles_inserted FROM articles;
SELECT source_name, COUNT(*) FROM articles GROUP BY source_name;
"""

with open('MANUAL_ARTICLE_SEED.sql', 'w', encoding='utf-8') as f:
    f.write(sql)

print(f"Generated MANUAL_ARTICLE_SEED.sql with {len(articles)} articles")
print(f"With images: {sum(1 for a in articles if a.get('image_url'))}")
