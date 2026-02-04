

# Enhanced Scrape Control with Progress Indicator

This plan implements an improved "Scrape Now" button with loading states, progress indicator, and category filtering options.

---

## Overview

The current simple "Scrape Now" button will be replaced with a comprehensive scraping control panel featuring:
- Category/source filtering to scrape specific news types
- Loading spinner and disabled state during scraping
- Real-time progress indicator showing scrape status
- Detailed results display with per-source breakdown

---

## Implementation Details

### 1. Enhanced Scrape Control Card

Create a new dedicated card in the admin dashboard with:
- Dropdown to select which category/source to scrape (All, AI, Apple, Tesla, Crypto, Climate, Politics, Finance)
- Visual loading spinner that animates during scraping
- Progress bar showing completion percentage
- Status text showing current scrape phase
- Results summary after completion

### 2. UI Components

**Scrape Control Panel Structure:**
```text
+------------------------------------------+
|  SCRAPE CONTROL                          |
+------------------------------------------+
|                                          |
|  Category: [Dropdown: All Sources   v]   |
|                                          |
|  [=========>               ] 45%         |
|  Scraping TechCrunch... (2/5)            |
|                                          |
|  [ Scrape Now ]  (disabled while active) |
|                                          |
|  Last Run: 2 minutes ago                 |
|  Articles Added: 12                      |
+------------------------------------------+
```

### 3. State Management

The scrape function will track:
- `isScraping` - boolean to disable button and show spinner
- `progress` - percentage (0-100) for progress bar
- `currentPhase` - text showing current operation
- `results` - array of per-source results after completion

### 4. Category Filtering

The edge function will accept an optional `category` parameter to filter which sources to scrape:
- Map categories to source names (e.g., AI -> TechCrunch, The Verge)
- When category is "all" or not provided, scrape all active sources

**Category to Source Mapping:**
| Category | Sources |
|----------|---------|
| AI | TechCrunch, The Verge, MIT Tech Review |
| Apple | The Verge, Ars Technica |
| Tesla | The Verge, Ars Technica |
| Crypto | TechCrunch, Wired |
| Climate | MIT Technology Review, The Verge |
| Politics | Reuters, Bloomberg, The Guardian |
| Finance | Bloomberg, Reuters, WSJ |
| All | All active sources |

### 5. Edge Function Modification

Update `scrape-news/index.ts` to:
- Accept `{ category?: string }` in request body
- Filter sources based on category mapping
- Return progress-friendly response with source count

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/Dashboard.tsx` | Add ScrapeControlCard component with Select dropdown, Progress bar, loading states, and results display |
| `supabase/functions/scrape-news/index.ts` | Add optional category parameter to filter sources |

---

## Technical Implementation

### Dashboard Component Changes

1. Add state variables for scraping progress:
   - `isScraping: boolean`
   - `scrapeProgress: number`
   - `scrapePhase: string`
   - `selectedCategory: string`
   - `lastScrapeResults: ScrapeResult[]`

2. Create `ScrapeControlCard` component with:
   - Select dropdown for category selection using existing CATEGORIES from CategoryNav
   - Progress component showing real-time progress
   - RefreshCw icon that spins when scraping
   - Disabled state on button during operation
   - Toast notifications for success/failure

3. Update `handleTriggerScrape` to:
   - Set loading state immediately
   - Send selected category to edge function
   - Update progress (simulated since real-time not available)
   - Display detailed results on completion

### Edge Function Changes

1. Parse request body for optional `category` field
2. Add `CATEGORY_SOURCE_MAP` constant mapping categories to source name patterns
3. Filter sources query based on category parameter
4. Return `totalSources` count in response for progress tracking

---

## Testing the Scraping

After implementation:
1. Navigate to `/admin/dashboard`
2. Select a category from the dropdown (e.g., "AI")
3. Click "Scrape Now" button
4. Observe:
   - Button becomes disabled with spinning icon
   - Progress bar advances
   - Phase text updates
   - Results display on completion with per-source breakdown

