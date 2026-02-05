

# Add Google News as an RSS Source

This plan adds Google News to your list of news sources so the scraper can pull articles from it.

---

## What We'll Do

Add Google News as a new source in your database with the appropriate RSS feed URL. Google News provides an RSS feed at `https://news.google.com/rss` for top stories.

---

## Database Change

Insert a new source record:

| Field | Value |
|-------|-------|
| **Name** | Google News |
| **RSS URL** | `https://news.google.com/rss` |
| **Website URL** | `https://news.google.com` |
| **Description** | Google's news aggregator, pulling top stories from thousands of publishers worldwide. Excellent for breaking news and trending topics across all categories. |
| **Priority** | high |
| **Scrape Interval** | 15 minutes |
| **Content Category** | tech (or null for mixed content) |

---

## SQL Migration

```sql
INSERT INTO sources (
  name, 
  rss_url, 
  website_url, 
  description, 
  priority, 
  scrape_interval_minutes,
  is_active
) VALUES (
  'Google News',
  'https://news.google.com/rss',
  'https://news.google.com',
  'Google''s news aggregator, pulling top stories from thousands of publishers worldwide. Excellent for breaking news and trending topics across all categories.',
  'high',
  15,
  true
);
```

---

## Alternative: Tech-Focused Google News Feed

If you want specifically technology news from Google, we can use:
- `https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB` (Technology topic)

---

## After This

1. The source will appear in your Admin → Sources page
2. You can click "Scrape Now" to test it
3. Or run a full scrape from the Dashboard

---

## Note on Scraping Fix

This plan also assumes the RSS parser fix from the previous approved plan has been implemented. If scraping still fails, we need to deploy the updated `rss-parser.ts` that uses the `@mikaelporttila/rss` library instead of the broken `deno_dom` parser.

