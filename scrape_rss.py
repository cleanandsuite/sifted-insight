#!/usr/bin/env python3
"""
RSS News Scraper with Image Extraction
Fetches articles from 30+ tech news sources with featured images.
Deduplicates by normalized title and saves to JSON.
"""

import json
import re
import sys
from datetime import datetime
from xml.etree import ElementTree
from pathlib import Path

try:
    import requests
except ImportError:
    print("Error: 'requests' library not installed. Run: pip install requests")
    sys.exit(1)

# Output file
OUTPUT_FILE = Path(__file__).parent / "scraped_articles.json"

# XML Namespaces for Media RSS
NAMESPACES = {
    'media': 'http://search.yahoo.com/mrss/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'atom': 'http://www.w3.org/2005/Atom',
    'dc': 'http://purl.org/dc/elements/1.1/',
}

# Register namespaces for proper parsing
for prefix, uri in NAMESPACES.items():
    ElementTree.register_namespace(prefix, uri)

# =============================================================================
# RSS FEEDS CONFIGURATION
# Organized by category with all sources from the database + new requested feeds
# =============================================================================

FEEDS = {
    # =========================================================================
    # TECH (Target: 68%)
    # =========================================================================
    "tech": [
        ("TechCrunch", "https://techcrunch.com/feed/"),
        ("The Verge", "https://www.theverge.com/rss/index.xml"),
        ("Wired", "https://www.wired.com/feed/rss"),
        ("Ars Technica", "https://feeds.arstechnica.com/arstechnica/index"),
        ("MIT Technology Review", "https://www.technologyreview.com/feed/"),
        ("BBC Technology", "https://feeds.bbci.co.uk/news/technology/rss.xml"),
        ("Google News Tech", "https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB"),
    ],
    
    # =========================================================================
    # FINANCE (Target: 16% - includes Crypto)
    # =========================================================================
    "finance": [
        ("Bloomberg", "https://www.bloomberg.com/feed/podcast/decrypted.xml"),
        ("CNBC", "https://www.cnbc.com/id/100003114/device/rss/rss.html"),
        ("MarketWatch", "https://feeds.marketwatch.com/marketwatch/topstories/"),
        ("Reuters Business", "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best"),
        ("Financial Times", "https://www.ft.com/rss/home"),
        # Crypto (folded into Finance)
        ("Cointelegraph", "https://cointelegraph.com/rss"),
        ("CoinDesk", "https://www.coindesk.com/arc/outboundfeeds/rss/"),
        ("Decrypt", "https://decrypt.co/feed"),
    ],
    
    # =========================================================================
    # VIDEO GAMES & GAMING TECHNOLOGY (Target: 10%)
    # =========================================================================
    "video_games": [
        # Major Gaming News
        ("Polygon", "https://www.polygon.com/rss/index.xml"),
        ("Eurogamer", "https://www.eurogamer.net/?format=rss"),
        ("IGN", "https://feeds.feedburner.com/ign/games-all"),
        ("Kotaku", "https://kotaku.com/rss"),
        ("GameSpot", "https://www.gamespot.com/feeds/mashup/"),
        ("PC Gamer", "https://www.pcgamer.com/rss/"),
        ("Rock Paper Shotgun", "https://www.rockpapershotgun.com/feed"),
        ("VG247", "https://www.vg247.com/feed"),
        ("GamesRadar", "https://www.gamesradar.com/rss/"),
        ("Destructoid", "https://www.destructoid.com/feed/"),
        ("TheGamer", "https://www.thegamer.com/feed/"),
        ("Game Rant", "https://gamerant.com/feed/"),
        # Gaming Tech Coverage from Tech Sites
        ("Ars Technica Gaming", "https://feeds.arstechnica.com/arstechnica/gaming"),
        ("The Verge Gaming", "https://www.theverge.com/rss/games/index.xml"),
        ("Wired Gaming", "https://www.wired.com/feed/category/games/latest/rss"),
        # Platform Specific
        ("Nintendo Life", "https://www.nintendolife.com/feeds/latest"),
        ("Push Square", "https://www.pushsquare.com/feeds/latest"),
        ("Pure Xbox", "https://www.purexbox.com/feeds/latest"),
        # VR & Immersive Tech
        ("UploadVR", "https://uploadvr.com/feed/"),
        ("Road to VR", "https://www.roadtovr.com/feed/"),
        # Asian Gaming & JRPG
        ("Siliconera", "https://www.siliconera.com/feed/"),
        # Esports & Competitive
        ("Dexerto Gaming", "https://www.dexerto.com/feed/category/gaming"),
        ("DualShockers", "https://www.dualshockers.com/feed/"),
    ],
    
    # =========================================================================
    # POLITICS (Target: 8%)
    # =========================================================================
    "politics": [
        ("Politico", "https://rss.politico.com/politics-news.xml"),
        ("The Hill", "https://thehill.com/news/feed/"),
        ("NPR Politics", "https://feeds.npr.org/1014/rss.xml"),
        ("BBC Politics", "https://feeds.bbci.co.uk/news/politics/rss.xml"),
        ("AP News Politics", "https://rsshub.app/apnews/topics/politics"),
        ("Reuters Politics", "https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best"),
    ],
    
    # =========================================================================
    # CLIMATE (Target: 8%)
    # =========================================================================
    "climate": [
        ("Grist", "https://grist.org/feed/"),
        ("Yale E360", "https://e360.yale.edu/feed"),
        ("Guardian Environment", "https://www.theguardian.com/environment/rss"),
        ("Inside Climate News", "https://insideclimatenews.org/feed/"),
        ("Carbon Brief", "https://www.carbonbrief.org/feed/"),
        ("Climate Home News", "https://www.climatechangenews.com/feed/"),
    ],
}

# Flatten feeds for easy iteration
ALL_FEEDS = []
for category, feeds in FEEDS.items():
    for name, url in feeds:
        ALL_FEEDS.append((name, url, category))


def normalize_title(title: str) -> str:
    """
    Normalize title for deduplication.
    - Lowercase
    - Remove special characters
    - Collapse whitespace
    """
    if not title:
        return ""
    title = title.lower().strip()
    title = re.sub(r'[^a-z0-9\s]', '', title)
    title = re.sub(r'\s+', ' ', title)
    return title.strip()


def extract_image_url(entry: ElementTree.Element) -> str | None:
    """
    Extract featured image URL from RSS entry using multiple methods.
    
    Priority:
    1. media:content tag (Media RSS)
    2. media:thumbnail tag
    3. enclosure with image type
    4. img tag in description HTML
    """
    
    # Method 1: <media:content> tag
    media_content = entry.find('.//{http://search.yahoo.com/mrss/}content')
    if media_content is not None:
        url = media_content.get('url')
        medium = media_content.get('medium', '')
        mime_type = media_content.get('type', '')
        if url and (medium == 'image' or 'image' in mime_type or not medium):
            return url
    
    # Method 2: <media:thumbnail> tag
    media_thumb = entry.find('.//{http://search.yahoo.com/mrss/}thumbnail')
    if media_thumb is not None:
        url = media_thumb.get('url')
        if url:
            return url
    
    # Method 3: <enclosure> with image type
    enclosure = entry.find('enclosure')
    if enclosure is not None:
        url = enclosure.get('url')
        mime_type = enclosure.get('type', '')
        if url and 'image' in mime_type.lower():
            return url
    
    # Method 4: Look in description for <img> tag
    # Try different description element names
    for desc_tag in ['description', 'summary', '{http://purl.org/rss/1.0/modules/content/}encoded']:
        desc_elem = entry.find(desc_tag)
        if desc_elem is not None and desc_elem.text:
            # Extract first img src
            img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', desc_elem.text, re.IGNORECASE)
            if img_match:
                return img_match.group(1)
    
    # Method 5: Check for image in content:encoded
    content_encoded = entry.find('.//{http://purl.org/rss/1.0/modules/content/}encoded')
    if content_encoded is not None and content_encoded.text:
        img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', content_encoded.text, re.IGNORECASE)
        if img_match:
            return img_match.group(1)
    
    return None


def extract_link(entry: ElementTree.Element) -> str | None:
    """Extract article link from RSS entry."""
    # Standard RSS <link> tag
    link = entry.find('link')
    if link is not None:
        if link.text:
            return link.text.strip()
        # Atom-style link with href attribute
        href = link.get('href')
        if href:
            return href.strip()
    
    # Atom feed link with rel="alternate"
    for link_elem in entry.findall('{http://www.w3.org/2005/Atom}link'):
        rel = link_elem.get('rel', 'alternate')
        if rel == 'alternate':
            href = link_elem.get('href')
            if href:
                return href.strip()
    
    # guid as fallback (sometimes it's the URL)
    guid = entry.find('guid')
    if guid is not None and guid.text and guid.text.startswith('http'):
        return guid.text.strip()
    
    return None


def extract_description(entry: ElementTree.Element) -> str | None:
    """Extract description/summary from RSS entry."""
    # Try different description element names
    for desc_tag in ['description', 'summary', '{http://www.w3.org/2005/Atom}summary', 
                     '{http://www.w3.org/2005/Atom}content']:
        desc_elem = entry.find(desc_tag)
        if desc_elem is not None and desc_elem.text:
            # Strip HTML tags for clean summary
            text = re.sub(r'<[^>]+>', '', desc_elem.text)
            text = text.strip()
            if text:
                return text[:1000]  # Limit to 1000 chars
    
    return None


def extract_published_date(entry: ElementTree.Element) -> str | None:
    """Extract publication date from RSS entry."""
    for date_tag in ['pubDate', 'published', '{http://www.w3.org/2005/Atom}published', 
                     '{http://www.w3.org/2005/Atom}updated', '{http://purl.org/dc/elements/1.1/}date']:
        date_elem = entry.find(date_tag)
        if date_elem is not None and date_elem.text:
            return date_elem.text.strip()
    
    return None


def extract_author(entry: ElementTree.Element) -> str | None:
    """Extract author from RSS entry."""
    # Standard author tag
    author = entry.find('author')
    if author is not None:
        if author.text:
            return author.text.strip()
        # Atom-style with nested name
        name = author.find('{http://www.w3.org/2005/Atom}name')
        if name is not None and name.text:
            return name.text.strip()
    
    # dc:creator
    creator = entry.find('{http://purl.org/dc/elements/1.1/}creator')
    if creator is not None and creator.text:
        return creator.text.strip()
    
    return None


def fetch_feed(name: str, url: str, category: str) -> list[dict]:
    """
    Fetch and parse a single RSS feed.
    
    Args:
        name: Source name (e.g., "TechCrunch")
        url: RSS feed URL
        category: Category for this feed
        
    Returns:
        List of article dictionaries
    """
    articles = []
    
    try:
        headers = {
            'User-Agent': 'SIFT-NewsBot/1.0 (https://sifted-insight.lovable.app)',
            'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        }
        
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parse XML
        try:
            root = ElementTree.fromstring(response.content)
        except ElementTree.ParseError as e:
            print(f"  XML parse error for {name}: {e}")
            return []
        
        # Find all items (RSS) or entries (Atom)
        items = root.findall('.//item')
        if not items:
            items = root.findall('.//{http://www.w3.org/2005/Atom}entry')
        if not items:
            items = root.findall('.//entry')
        
        for item in items:
            # Extract title (required)
            title_elem = item.find('title')
            if title_elem is None:
                title_elem = item.find('{http://www.w3.org/2005/Atom}title')
            
            if title_elem is None or not title_elem.text:
                continue
            
            title = title_elem.text.strip()
            
            # Skip invalid titles
            if not title or title.startswith('<?') or len(title) < 10:
                continue
            
            # Extract other fields
            image_url = extract_image_url(item)
            link = extract_link(item)
            description = extract_description(item)
            published = extract_published_date(item)
            author = extract_author(item)
            
            article = {
                "title": title,
                "source": name,
                "category": category,
                "link": link,
                "image": image_url,
                "description": description,
                "author": author,
                "published": published,
                "scraped_at": datetime.now().isoformat()
            }
            
            articles.append(article)
    
    except requests.exceptions.Timeout:
        print(f"  Timeout fetching {name}")
    except requests.exceptions.RequestException as e:
        print(f"  Error fetching {name}: {e}")
    except Exception as e:
        print(f"  Unexpected error for {name}: {e}")
    
    return articles


def deduplicate(articles: list[dict]) -> list[dict]:
    """
    Remove duplicate articles based on normalized title.
    
    Args:
        articles: List of article dictionaries
        
    Returns:
        List of unique articles
    """
    seen_titles = set()
    seen_links = set()
    unique = []
    
    for article in articles:
        normalized = normalize_title(article['title'])
        link = article.get('link', '')
        
        # Skip if we've seen this title or link
        if normalized and normalized in seen_titles:
            continue
        if link and link in seen_links:
            continue
        
        if normalized:
            seen_titles.add(normalized)
        if link:
            seen_links.add(link)
        
        unique.append(article)
    
    return unique


def count_by_category(articles: list[dict]) -> dict[str, int]:
    """Count articles by category."""
    counts = {}
    for article in articles:
        cat = article.get('category', 'unknown')
        counts[cat] = counts.get(cat, 0) + 1
    return counts


def main():
    """Main function to scrape all RSS feeds."""
    print("=" * 60)
    print("SIFT RSS News Scraper")
    print("=" * 60)
    print(f"Time: {datetime.now().isoformat()}")
    print(f"Total feeds to scrape: {len(ALL_FEEDS)}")
    print()
    
    all_articles = []
    
    # Scrape each feed
    for name, url, category in ALL_FEEDS:
        print(f"Fetching {name} ({category})...")
        articles = fetch_feed(name, url, category)
        print(f"  Found {len(articles)} articles")
        all_articles.extend(articles)
    
    print()
    print("-" * 60)
    
    # Deduplicate
    unique_articles = deduplicate(all_articles)
    duplicates_removed = len(all_articles) - len(unique_articles)
    
    print(f"Total articles scraped: {len(all_articles)}")
    print(f"Duplicates removed: {duplicates_removed}")
    print(f"Unique articles: {len(unique_articles)}")
    print()
    
    # Category breakdown
    category_counts = count_by_category(unique_articles)
    print("Articles by category:")
    for cat, count in sorted(category_counts.items()):
        pct = (count / len(unique_articles) * 100) if unique_articles else 0
        print(f"  {cat}: {count} ({pct:.1f}%)")
    
    # Count articles with images
    with_images = sum(1 for a in unique_articles if a.get('image'))
    print(f"\nArticles with images: {with_images} ({with_images/len(unique_articles)*100:.1f}%)" if unique_articles else "")
    
    # Save to JSON
    output = {
        "scraped_at": datetime.now().isoformat(),
        "total_articles": len(unique_articles),
        "category_counts": category_counts,
        "feeds_scraped": len(ALL_FEEDS),
        "articles": unique_articles
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print()
    print("=" * 60)
    print(f"Saved to: {OUTPUT_FILE}")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
