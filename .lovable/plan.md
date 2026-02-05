

# RSS-Based Scraper with 68/32 Content Ratio System

This plan replaces the Firecrawl-based scraper with a native RSS parser and implements a sophisticated content balancing system maintaining 68% tech and 32% other topics.

---

## Overview

The implementation will:
- Replace Firecrawl with native RSS/XML parsing using Deno's built-in XML parser
- Implement a content classification system with keyword-based categorization
- Create a dynamic balancing mechanism to maintain the 68/32 ratio
- Update the ranking algorithm with topic relevance and category alignment weights
- Add UI components showing the content mix distribution

---

## Content Ratio Configuration

| Category | Target % | Sub-Categories |
|----------|----------|----------------|
| **Tech** | 68% | AI, Apple, Tesla, Crypto, General Tech |
| **Finance** | 16% | Markets, Banking, Investments, Economic Policy |
| **Politics** | 8% | Government, Elections, Policy, International Relations |
| **Climate** | 8% | Environment, Sustainability, Energy |

---

## Implementation Architecture

### 1. Database Schema Updates

Add new columns and tables to support the ratio system:

**New columns on `sources` table:**
- `content_category` - enum: 'tech', 'finance', 'politics', 'climate'
- `sub_category` - varchar for more specific classification

**New columns on `articles` table:**
- `content_category` - classified category for the article
- `category_confidence` - confidence score of classification (0-1)

**New table: `content_ratio_config`:**
- Stores the configurable ratio targets (68/32 split)
- Allows adjustment without code changes

**New table: `scrape_statistics`:**
- Tracks current category distribution
- Records ratio over time for analytics

### 2. Native RSS Parser (Replace Firecrawl)

Create a new RSS parsing module in the edge function:
- Use Deno's built-in `DOMParser` for XML parsing
- Parse standard RSS 2.0 and Atom feeds
- Extract: title, link, description, pubDate, author, media:content

**RSS Parsing Flow:**
```text
Source RSS URL → Fetch XML → Parse Feed → Extract Items → Filter Articles
```

### 3. Content Classification System

Implement keyword-based classification with category-specific keyword lists:

**Tech Keywords:**
- AI: artificial intelligence, machine learning, neural network, GPT, LLM, deep learning, AI model
- Apple: iPhone, iPad, Mac, iOS, macOS, Apple Watch, WWDC, Tim Cook
- Tesla: Tesla, Elon Musk, electric vehicle, EV, Cybertruck, Model S/3/X/Y, FSD
- Crypto: bitcoin, ethereum, crypto, blockchain, DeFi, NFT, web3, cryptocurrency
- General: software, startup, app, tech, digital, cloud, programming

**Finance Keywords:**
- Markets, stocks, bonds, Fed, interest rates, inflation, economy, GDP, earnings, Wall Street, investment, banking

**Politics Keywords:**
- Congress, Senate, election, vote, bill, legislation, president, policy, government, democracy, Republican, Democrat

**Climate Keywords:**
- Climate change, global warming, carbon, emissions, renewable, solar, wind, sustainability, environment, green energy

**Classification Algorithm:**
1. Scan title and description for keywords
2. Count matches per category
3. Apply weighted scoring (title matches = 2x, description = 1x)
4. Assign category with highest score
5. Set confidence based on score differential

### 4. Dynamic Balancing System

**Quota-Based Approach (Option A from requirements):**

Before each scrape cycle:
1. Query current article distribution from past 24 hours
2. Calculate current ratios vs targets
3. Determine quotas for each category:
   - If tech is at 60% (target 68%), increase tech quota by 20%
   - If finance is at 20% (target 16%), decrease finance quota by 25%
4. Stop scraping category when quota reached

**Balancing Logic:**
```text
current_ratio = articles_in_category / total_recent_articles
deviation = target_ratio - current_ratio
adjustment_factor = 1 + (deviation * 2)  // Amplify correction
category_quota = base_quota * adjustment_factor
```

**Source Prioritization by Category:**

| Category | Sources | Quota Weight |
|----------|---------|--------------|
| Tech | TechCrunch, The Verge, Wired, Ars Technica, MIT Tech Review | 68% |
| Finance | Bloomberg, WSJ, Reuters (finance section) | 16% |
| Politics | Politico, The Hill, BBC Politics, Reuters (politics) | 8% |
| Climate | Inside Climate News, Yale E360, Guardian Environment | 8% |

### 5. Updated Ranking Algorithm

Modify the ranking formula to include topic relevance:

**New Ranking Formula:**
```text
rank_score = (source_authority × 0.25) +
             (recency_score × 0.20) +
             (title_engagement × 0.10) +
             (topic_relevance × 0.30) +
             (content_score × 0.10) +
             (category_alignment × 0.05)
```

**Topic Relevance Score (0-100):**
- Based on keyword density and classification confidence
- Higher score for articles with clear topic focus
- Bonus for trending topics

**Category Alignment Score (0-100):**
- Rewards articles that help maintain target ratio
- If tech is underrepresented, tech articles get bonus
- Calculated: `100 - (abs(current_ratio - target_ratio) × 200)`

### 6. New/Updated Files

| File | Type | Purpose |
|------|------|---------|
| `supabase/functions/scrape-news/index.ts` | Modify | Replace Firecrawl with RSS parser, add classification |
| `supabase/functions/scrape-news/rss-parser.ts` | Create | RSS/Atom feed parsing utilities |
| `supabase/functions/scrape-news/classifier.ts` | Create | Content classification with keywords |
| `supabase/functions/scrape-news/balancer.ts` | Create | Dynamic quota balancing logic |
| `supabase/functions/scrape-news/config.ts` | Create | Ratio configuration and keywords |
| `src/components/ContentMixIndicator.tsx` | Create | UI showing 68/32 distribution |
| `src/components/admin/ContentMixCard.tsx` | Create | Admin analytics for content ratio |
| `src/hooks/useContentMix.ts` | Create | Hook to fetch current ratio stats |

### 7. Edge Function: scrape-news/index.ts

Complete rewrite removing Firecrawl dependency:

**Main Flow:**
1. Authenticate request
2. Fetch current category distribution
3. Calculate quotas using balancer
4. For each source (ordered by priority):
   - Fetch RSS feed XML
   - Parse feed items
   - Classify each article
   - Check against category quota
   - Skip if quota reached, else process
5. Insert articles with category metadata
6. Trigger AI summarization
7. Return results with ratio statistics

**Key Changes:**
- Remove all `FIRECRAWL_API_KEY` references
- Add native XML parsing with `DOMParser`
- Implement classification before insertion
- Track and enforce quotas during scraping

### 8. UI Components

**ContentMixIndicator Component:**
```text
+------------------------------------------+
| Content Mix: 68% Tech / 32% Other        |
| [████████████████████░░░░░░░] 68% Tech   |
| Finance: 16% | Politics: 8% | Climate: 8%|
+------------------------------------------+
```

**Admin ContentMixCard:**
- Real-time ratio tracking
- Historical charts (last 7 days)
- Alert when ratio deviates >5%
- Manual rebalance trigger

**Category Badges on Articles:**
- Show category tag on each article card
- Color-coded by category (tech=blue, finance=green, politics=purple, climate=green)

### 9. Additional Sources to Add

New sources for balanced coverage:

**Finance Sources:**
- Bloomberg: https://www.bloomberg.com/feeds/sitemap_news.xml
- Financial Times: https://www.ft.com/rss/home/uk
- CNBC: https://www.cnbc.com/id/100003114/device/rss/rss.html

**Politics Sources:**
- Politico: https://rss.politico.com/politics-news.xml
- The Hill: https://thehill.com/news/feed/
- BBC Politics: https://feeds.bbci.co.uk/news/politics/rss.xml

**Climate Sources:**
- Inside Climate News: https://insideclimatenews.org/feed/
- Yale E360: https://e360.yale.edu/feed
- Guardian Environment: https://www.theguardian.com/environment/rss

---

## Database Migration

```sql
-- Add content category enum
CREATE TYPE content_category AS ENUM ('tech', 'finance', 'politics', 'climate');

-- Add category columns to sources
ALTER TABLE sources ADD COLUMN content_category content_category;
ALTER TABLE sources ADD COLUMN sub_category VARCHAR(50);

-- Add category columns to articles
ALTER TABLE articles ADD COLUMN content_category content_category;
ALTER TABLE articles ADD COLUMN category_confidence DECIMAL(3,2);

-- Create ratio configuration table
CREATE TABLE content_ratio_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category content_category NOT NULL,
    target_ratio DECIMAL(5,4) NOT NULL,
    sub_categories JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default ratios
INSERT INTO content_ratio_config (category, target_ratio, sub_categories) VALUES
    ('tech', 0.68, '["ai", "apple", "tesla", "crypto", "general"]'),
    ('finance', 0.16, '["markets", "banking", "investing", "economy"]'),
    ('politics', 0.08, '["government", "elections", "policy", "international"]'),
    ('climate', 0.08, '["environment", "energy", "sustainability"]');

-- Create scrape statistics table for monitoring
CREATE TABLE scrape_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scrape_date DATE NOT NULL,
    category content_category NOT NULL,
    articles_count INTEGER DEFAULT 0,
    ratio_achieved DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(scrape_date, category)
);

-- Update existing sources with categories
UPDATE sources SET content_category = 'tech' 
WHERE name IN ('TechCrunch', 'The Verge', 'Wired', 'Ars Technica', 'MIT Technology Review');
```

---

## Ranking Algorithm SQL Update

```sql
-- Add topic_relevance and category_alignment functions
CREATE OR REPLACE FUNCTION calculate_topic_relevance_score(article_id UUID)
RETURNS DECIMAL(10,6) AS $$
DECLARE
    confidence DECIMAL(3,2);
    base_score DECIMAL(10,6) := 50;
BEGIN
    SELECT COALESCE(category_confidence, 0.5) INTO confidence
    FROM articles WHERE id = article_id;
    
    -- Higher confidence = higher relevance
    base_score := base_score + (confidence * 50);
    
    RETURN LEAST(100, base_score);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_category_alignment_score(article_id UUID)
RETURNS DECIMAL(10,6) AS $$
DECLARE
    art_category content_category;
    target_ratio DECIMAL(5,4);
    current_ratio DECIMAL(5,4);
    alignment DECIMAL(10,6);
BEGIN
    SELECT content_category INTO art_category FROM articles WHERE id = article_id;
    SELECT crc.target_ratio INTO target_ratio FROM content_ratio_config crc 
    WHERE crc.category = art_category AND is_active = true;
    
    -- Get current 24h ratio
    SELECT COUNT(*)::DECIMAL / NULLIF(
        (SELECT COUNT(*) FROM articles WHERE created_at > NOW() - INTERVAL '24 hours'), 0
    ) INTO current_ratio
    FROM articles 
    WHERE content_category = art_category 
    AND created_at > NOW() - INTERVAL '24 hours';
    
    -- Reward articles that help achieve target ratio
    IF current_ratio < target_ratio THEN
        alignment := 100; -- Needed to reach target
    ELSE
        alignment := 100 - (ABS(current_ratio - target_ratio) * 200);
    END IF;
    
    RETURN GREATEST(0, LEAST(100, alignment));
END;
$$ LANGUAGE plpgsql;
```

---

## Testing & Monitoring

1. **Ratio Monitoring**: Admin dashboard card showing real-time category distribution
2. **Alerts**: Notification when ratio deviates >5% from target
3. **Analytics**: Weekly reports on category performance
4. **Manual Rebalance**: Admin ability to trigger rebalancing scrape

---

## Technical Details

### RSS Parser Implementation (Deno)

The RSS parser will use Deno's native capabilities:
```typescript
// Parse RSS/Atom feeds without external dependencies
const xml = await response.text();
const parser = new DOMParser();
const doc = parser.parseFromString(xml, "text/xml");
const items = doc.querySelectorAll("item, entry");
```

### Content Classifier

Weighted keyword matching with configurable thresholds:
```typescript
interface ClassificationResult {
  category: 'tech' | 'finance' | 'politics' | 'climate';
  subCategory: string;
  confidence: number;
  matchedKeywords: string[];
}
```

### Balancer Logic

Dynamic quota calculation ensuring 68/32 split:
```typescript
interface CategoryQuota {
  category: string;
  targetRatio: number;
  currentRatio: number;
  articlesToScrape: number;
  priority: number;
}
```

