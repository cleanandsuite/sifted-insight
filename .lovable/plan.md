

## Plan: Build Comprehensive Python RSS News Scraper

### Overview
Create a standalone Python RSS scraper that fetches articles from all configured tech news sources, extracts featured images using multiple methods, deduplicates by normalized title, and outputs to a JSON file. This script uses standard Python libraries (requests + xml.etree.ElementTree) as requested.

---

### All RSS Feeds to Include

Combining the user's requested feeds with existing database sources:

| Category | Source | RSS URL |
|----------|--------|---------|
| Tech | TechCrunch | https://techcrunch.com/feed/ |
| Tech | The Verge | https://www.theverge.com/rss/index.xml |
| Tech | Wired | https://www.wired.com/feed/rss |
| Tech | Ars Technica | https://feeds.arstechnica.com/arstechnica/index |
| Tech | MIT Technology Review | https://www.technologyreview.com/feed/ |
| Finance | Bloomberg | https://www.bloomberg.com/feeds/sitemap_news.xml |
| Finance | CNBC | https://www.cnbc.com/id/100003114/device/rss/rss.html |
| Finance | MarketWatch | https://feeds.marketwatch.com/marketwatch/topstories/ |
| Finance | Reuters Business | https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best&best-type=reuters-best-business-news |
| Video Games | Polygon | https://www.polygon.com/rss/index.xml |
| Video Games | Eurogamer | https://www.eurogamer.net/?format=rss |
| Video Games | IGN | https://feeds.feedburner.com/ign/games-all |
| Video Games | Ars Technica Gaming | https://feeds.arstechnica.com/arstechnica/gaming |
| Video Games | The Verge Gaming | https://www.theverge.com/rss/games/index.xml |
| Video Games | Wired Gaming | https://www.wired.com/feed/category/games/latest/rss |
| Politics | Politico | https://rss.politico.com/politics-news.xml |
| Politics | The Hill | https://thehill.com/news/feed/ |
| Politics | NPR Politics | https://feeds.npr.org/1014/rss.xml |
| Politics | BBC Politics | https://feeds.bbci.co.uk/news/politics/rss.xml |
| Climate | Grist | https://grist.org/feed/ |
| Climate | Yale E360 | https://e360.yale.edu/feed |
| Climate | Guardian Environment | https://www.theguardian.com/environment/rss |
| Climate | Inside Climate News | https://insideclimatenews.org/feed/ |
| Crypto | Cointelegraph | https://cointelegraph.com/rss |
| Crypto | CoinDesk | https://www.coindesk.com/arc/outboundfeeds/rss/ |
| Crypto | Decrypt | https://decrypt.co/feed |
| General | Google News | https://news.google.com/rss |
| General | BBC Technology | https://feeds.bbci.co.uk/news/technology/rss.xml |

---

### Script Architecture

```text
scrape_rss.py
     │
     ├─► fetch_feed(name, url)
     │       ├── HTTP GET with requests
     │       ├── Parse XML with ElementTree
     │       └── Return list of articles
     │
     ├─► extract_image_url(entry)
     │       ├── Method 1: media:content tag
     │       ├── Method 2: media:thumbnail tag
     │       ├── Method 3: enclosure with image type
     │       └── Method 4: img tag in description
     │
     ├─► normalize_title(title)
     │       ├── Lowercase
     │       ├── Remove special characters
     │       └── Collapse whitespace
     │
     ├─► deduplicate(articles)
     │       └── Remove duplicates by normalized title
     │
     └─► main()
             ├── Loop through all feeds
             ├── Aggregate articles
             ├── Deduplicate
             └── Save to scraped_articles.json
```

---

### File to Create

**`scrape_rss.py`** - Complete Python script with:

1. **Feed Configuration**: All 30+ RSS feeds organized by category
2. **HTTP Fetching**: Using `requests` library with timeout and error handling
3. **XML Parsing**: Using `xml.etree.ElementTree` with namespace handling
4. **Image Extraction**: 4-method approach for finding featured images:
   - `media:content` tag (Media RSS namespace)
   - `media:thumbnail` tag
   - `enclosure` tag with image MIME type
   - `<img>` tag extraction from description HTML
5. **Title Normalization**: Lowercase, strip punctuation, collapse whitespace
6. **Deduplication**: Set-based deduplication by normalized title
7. **JSON Output**: Save to `scraped_articles.json`

---

### Output JSON Format

```json
[
  {
    "title": "Article Headline",
    "source": "TechCrunch",
    "image": "https://example.com/featured-image.jpg",
    "scraped_at": "2026-02-06T15:00:00.000Z"
  }
]
```

---

### Technical Implementation Details

#### Namespace Handling for Media RSS
```python
NAMESPACES = {
    'media': 'http://search.yahoo.com/mrss/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'atom': 'http://www.w3.org/2005/Atom'
}
```

#### Image Extraction Priority
1. `{http://search.yahoo.com/mrss/}content` - most common for news
2. `{http://search.yahoo.com/mrss/}thumbnail` - fallback
3. `enclosure[@type="image/*"]` - podcast-style feeds
4. Regex extraction from `description` HTML content

#### Error Handling
- Timeout after 15 seconds per feed
- Continue on individual feed failures
- Log errors without crashing
- Skip articles with missing required fields (title)

---

### Requirements
- Python 3.x
- `requests` library (for HTTP)
- `xml.etree.ElementTree` (built-in, for XML parsing)

No external dependencies beyond `requests` (standard in most Python environments).

