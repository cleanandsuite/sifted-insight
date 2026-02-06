#!/usr/bin/env python3
"""
RSS News Scraper - Fetches latest news from RSS feeds and saves to JSON.
Deduplicates articles by link and title similarity.
Generates placeholder images for articles without them.
"""

import json
import re
import sys
import random
from datetime import datetime
from pathlib import Path
import feedparser
import requests
from bs4 import BeautifulSoup

# Common news RSS feeds (ordered by preference - first source wins)
RSS_FEEDS = {
    "google_news": "https://news.google.com/rss/search?q=TOP_STORIES&hl=en-US&gl=US&ceid=US:en",
    "bbc_world": "http://feeds.bbci.co.uk/news/world/rss.xml",
    "nyt_world": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "guardian_world": "https://www.theguardian.com/world/rss",
    "reuters_world": "https://www.reutersagency.com/feed/?best-topics=world&loc=force",
    "cnn_world": "http://rss.cnn.com/rss/edition_world.rss",
    "wsj_world": "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    # Game Dev / Technology (web scraped)
    "game_developer": "https://www.gamedeveloper.com/business",
    "unity_blog": "https://blogs.unity3d.com/feed/",
}

OUTPUT_FILE = Path(__file__).parent / "scraped_articles.json"

# Placeholder image colors by source
SOURCE_COLORS = {
    "google_news": "#4285F4",  # Google blue
    "bbc_world": "#BB1919",    # BBC red
    "nyt_world": "#000000",     # NYT black
    "guardian_world": "#052962", # Guardian dark blue
    "reuters_world": "#FF6600", # Reuters orange
    "cnn_world": "#CC0000",     # CNN red
    "wsj_world": "#000000",     # WSJ black
    # Game Dev
    "game_developer": "#FF4500",  # Orange red
    "unity_blog": "#222C37",      # Unity dark
}

def parse_date(entry):
    """Extract publication date from RSS entry."""
    if hasattr(entry, 'published'):
        return entry.published
    elif hasattr(entry, 'updated'):
        return entry.updated
    elif hasattr(entry, 'dc', 'date'):
        return entry.dc.date
    else:
        return datetime.now().isoformat()

def get_image(entry):
    """Extract image URL from RSS entry."""
    # Try media:content (Media RSS)
    if hasattr(entry, 'media_content'):
        for media in entry.media_content:
            if media.get('type', '').startswith('image/'):
                return media.get('url', '')
    
    # Try media:thumbnail
    if hasattr(entry, 'media_thumbnail'):
        for thumb in entry.media_thumbnail:
            if thumb.get('url'):
                return thumb['url']
    
    # Try enclosures
    if hasattr(entry, 'enclosures'):
        for enc in entry.enclosures:
            if enc.get('type', '').startswith('image/'):
                return enc.get('href', '')
    
    # Try links with rel="image"
    if hasattr(entry, 'links'):
        for link in entry.links:
            if link.get('rel') == 'image' and link.get('href'):
                return link['href']
    
    return None

def generate_placeholder_image(source, title, width=640, height=360):
    """Generate a placeholder image for articles without images."""
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # Get color for source
        color = SOURCE_COLORS.get(source, "#333333")
        r = int(color[1:3], 16)
        g = int(color[3:5], 16)
        b = int(color[5:7], 16)
        
        # Create gradient background
        img = Image.new('RGB', (width, height), color=(r, g, b))
        draw = ImageDraw.Draw(img)
        
        # Add subtle pattern
        for i in range(0, width, 4):
            overlay_r = max(0, r - 20)
            overlay_g = max(0, g - 20)
            overlay_b = max(0, b - 20)
            draw.line([(i, 0), (i, height)], fill=(overlay_r, overlay_g, overlay_b), width=1)
        
        # Add source badge
        badge_text = source.replace('_', ' ').upper()
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = Image.load_default()
        
        # Draw source name at bottom
        text_color = (255, 255, 255)
        bbox = draw.textbbox((0, 0), badge_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        draw.text(((width - text_width) // 2, height - text_height - 15), badge_text, font=font, fill=text_color)
        
        # Save to file
        filename = f"placeholder_{source}_{int(datetime.now().timestamp())}.jpg"
        filepath = Path(__file__).parent / filename
        img.save(filepath, 'JPEG', quality=60, optimize=True)
        
        return str(filepath)
    except ImportError:
        # PIL not available, return None
        return None
    except Exception as e:
        print(f"  Warning: Could not generate placeholder image: {e}")
        return None

def extract_title_terms(title):
    """Extract normalized key terms from title for comparison."""
    title = title.lower()
    # Remove punctuation and split
    words = re.sub(r'[^\w\s]', '', title).split()
    # Filter common words and short words
    stopwords = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'of', 'in', 'for', 'on', 'at', 'by', 'and', 'or', 'as', 'with', 'says', 'say', 'after', 'before', 'new', 'over', 'more', 'its', 'what', 'how', 'why', 'when', 'where', 'who', 'that', 'this', 'from', 'has', 'have', 'been', 'will', 'would', 'could', 'should'}
    return set(w for w in words if w not in stopwords and len(w) > 2)

def articles_overlap(a1, a2, threshold=0.4):
    """Check if two articles overlap (same story)."""
    # Exact link match = same article
    if a1['link'] == a2['link']:
        return True
    
    # Check title similarity
    terms1 = extract_title_terms(a1['title'])
    terms2 = extract_title_terms(a2['title'])
    
    if not terms1 or not terms2:
        return False
    
    intersection = len(terms1 & terms2)
    union = len(terms1 | terms2)
    similarity = intersection / union if union > 0 else 0
    
    return similarity >= threshold

def deduplicate_articles(articles, feed_order):
    """Remove duplicate articles, keeping first source based on feed order."""
    seen = []
    unique = []
    seen_links = set()
    
    for article in articles:
        link = article['link']
        source = article['source']
        
        # Exact link check
        if link in seen_links:
            continue
        
        # Check similarity with existing articles
        is_duplicate = False
        for seen_article in seen:
            if articles_overlap(article, seen_article):
                # Skip if current source is lower priority than the one we already have
                if feed_order.index(source) > feed_order.index(seen_article['source']):
                    is_duplicate = True
                    break
                else:
                    # Replace the existing one with higher priority source
                    unique.remove(seen_article)
                    seen.remove(seen_article)
                    seen_links.discard(seen_article['link'])
                    break
        
        if not is_duplicate:
            unique.append(article)
            seen.append(article)
            seen_links.add(link)
    
    return unique

def scrape_feed(feed_id, url):
    """Scrape a single RSS feed."""
    try:
        print(f"Fetching {feed_id}...")
        feed = feedparser.parse(url)
        
        if feed.bozo or len(feed.entries) == 0:
            # Try web scraping as fallback
            print(f"  RSS failed, trying web scrape...")
            articles = scrape_web_fallback(feed_id, url)
            if articles:
                print(f"  Found {len(articles)} articles via web scrape")
                return articles
            print(f"  Warning: Could not parse {feed_id}")
            return []
        
        articles = []
        for entry in feed.entries[:10]:  # Limit to 10 articles per feed
            article = {
                "title": entry.get("title", "No title"),
                "link": entry.get("link", ""),
                "summary": entry.get("summary", "")[:500] if entry.get("summary") else "",
                "published": parse_date(entry),
                "source": feed_id,
                "feed_title": feed.feed.get("title", feed_id),
                "image": get_image(entry),
            }
            articles.append(article)
        
        print(f"  Found {len(articles)} articles")
        return articles
        
    except Exception as e:
        print(f"  Error fetching {feed_id}: {e}")
        return []

def scrape_web_fallback(feed_id, url):
    """Fallback web scraping for feeds that don't work."""
    try:
        import requests
        from bs4 import BeautifulSoup
        
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        
        if feed_id == 'game_developer':
            # Scrape Game Developer articles from /business section
            business_url = 'https://www.gamedeveloper.com/business'
            resp = requests.get(business_url, headers=headers, timeout=15)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.content, 'html.parser')
                links = soup.find_all('a', href=lambda x: x and '/business/' in x and len(x) > 20)
                seen = set()
                for link in links[:10]:
                    title = link.get_text(strip=True)
                    href = link.get('href', '')
                    if title and href and href not in seen:
                        seen.add(href)
                        if not href.startswith('http'):
                            href = 'https://www.gamedeveloper.com' + href
                        articles.append({
                            "title": title,
                            "link": href,
                            "summary": "",
                            "published": datetime.now().isoformat(),
                            "source": feed_id,
                            "feed_title": "Game Developer",
                            "image": None,
                        })
        
        return articles
    except Exception as e:
        print(f"  Web scrape error: {e}")
        return []

def add_placeholder_images(articles):
    """Add placeholder images for articles without images."""
    count = 0
    for article in articles:
        if not article.get('image'):
            placeholder = generate_placeholder_image(article['source'], article['title'])
            if placeholder:
                article['image'] = placeholder
                count += 1
    return count

def main():
    """Main function to scrape all RSS feeds."""
    print("=" * 50)
    print("RSS News Scraper")
    print("=" * 50)
    print(f"Time: {datetime.now().isoformat()}")
    print()
    
    all_articles = []
    
    for feed_id, url in RSS_FEEDS.items():
        articles = scrape_feed(feed_id, url)
        all_articles.extend(articles)
    
    # Sort by publication date (newest first)
    all_articles.sort(key=lambda x: x.get("published", ""), reverse=True)
    
    # Deduplicate articles (keep first source per story)
    feed_order = list(RSS_FEEDS.keys())
    unique_articles = deduplicate_articles(all_articles, feed_order)
    
    # Generate placeholder images for articles without images
    try:
        from PIL import Image, ImageDraw, ImageFont
        placeholder_count = add_placeholder_images(unique_articles)
        print(f"Generated {placeholder_count} placeholder images")
    except ImportError:
        print("  Note: PIL not installed, skipping placeholder images")
    
    print(f"After deduplication: {len(unique_articles)} unique articles (removed {len(all_articles) - len(unique_articles)} duplicates)")
    
    # Save to JSON
    output = {
        "scraped_at": datetime.now().isoformat(),
        "total_articles": len(unique_articles),
        "feeds_scraped": list(RSS_FEEDS.keys()),
        "articles": unique_articles
    }
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print()
    print("=" * 50)
    print(f"Total articles: {len(unique_articles)}")
    print(f"Saved to: {OUTPUT_FILE}")
    print("=" * 50)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
