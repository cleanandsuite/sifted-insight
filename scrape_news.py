#!/usr/bin/env python3
"""
NOOZ News Scraper - Saves articles to JSON file
"""

import feedparser
import requests
from datetime import datetime
import json
import os
import re
from urllib.parse import urlparse

# Supabase URL (for reference)
SUPABASE_URL = "https://jmhtzyctxntaojuovrtf.supabase.co"

def extract_image(entry):
    """Extract featured image URL from RSS entry"""
    
    # 1. Try media:content or media:thumbnail
    if hasattr(entry, 'media_content'):
        for media in entry.media_content:
            if media.get('url'):
                return media['url']
    
    if hasattr(entry, 'media_thumbnail'):
        for media in entry.media_thumbnail:
            if media.get('url'):
                return media['url']
    
    # 2. Try links with rel="image"
    if hasattr(entry, 'links'):
        for link in entry.links:
            if link.get('rel') == 'image' and link.get('href'):
                return link['href']
    
    # 3. Try to extract <img> from summary/content
    summary = entry.get('summary', '') or entry.get('content', '')
    img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', summary, re.IGNORECASE)
    if img_match:
        return img_match.group(1)
    
    # 4. Try enclosures
    if hasattr(entry, 'enclosures'):
        for enc in entry.enclosures:
            if enc.get('type', '').startswith('image/'):
                return enc.get('href', '')
    
    return None

RSS_FEEDS = [
    {"name": "Bloomberg", "url": "https://feeds.bloomberg.com/technology/news.rss"},
    {"name": "MIT Tech Review", "url": "https://www.technologyreview.com/feed/"},
    {"name": "The Atlantic", "url": "https://www.theatlantic.com/feed/channel/technology"},
    {"name": "TechCrunch", "url": "https://techcrunch.com/feed/"},
    {"name": "Wired", "url": "https://www.wired.com/feed/rss"},
    # Additional feeds
    {"name": "Ars Technica", "url": "https://feeds.arstechnica.com/arstechnica/index"},
    {"name": "The Verge", "url": "https://www.theverge.com/rss/index.xml"},
    {"name": "Engadget", "url": "https://www.engadget.com/rss.xml"},
    {"name": "VentureBeat", "url": "https://venturebeat.com/feed/"},
    {"name": "TechRadar", "url": "https://www.techradar.com/rss/news"},
    {"name": "CNET", "url": "https://www.cnet.com/rss/news/"},
    {"name": "Gizmodo", "url": "https://gizmodo.com/rss"},
]

print("NOOZ News Scraper")
print("=" * 50)
print(f"Supabase: {SUPABASE_URL}")
print()

all_articles = []

for feed in RSS_FEEDS:
    print(f"Fetching {feed['name']}...")
    try:
        response = requests.get(feed['url'], timeout=30)
        feed_data = feedparser.parse(response.text)
        
        count = 0
        for entry in feed_data.entries[:60]:
            image_url = extract_image(entry)
            article = {
                "title": entry.get("title", "")[:500],
                "url": entry.get("link", ""),
                "summary": entry.get("summary", "")[:800] if entry.get("summary") else "",
                "content": entry.get("summary", "")[:5000] if entry.get("summary") else "",
                "image_url": image_url or "",
                "source_name": feed["name"],
                "published_at": entry.get("published", datetime.now().isoformat()),
                "status": "published",
                "created_at": datetime.now().isoformat(),
            }
            if article["title"] and article["url"]:
                all_articles.append(article)
                count += 1
        
        print(f"  -> {count} articles")
        
    except Exception as e:
        print(f"  ERROR: {e}")

print()
print(f"Total: {len(all_articles)} articles")

# Save to JSON
with open("scraped_articles.json", "w") as f:
    json.dump(all_articles, f, indent=2)

print(f"Saved to scraped_articles.json")
print()
print("To insert into Supabase:")
print("1. Go to Supabase Dashboard -> Table Editor -> articles")
print("2. Click 'Insert' -> 'Insert from CSV/JSON'")
print(f"3. Select scraped_articles.json")
print()
print("Or paste this URL in your browser to test the Supabase insert:")
print(f"{SUPABASE_URL}/table-editor/articles")
