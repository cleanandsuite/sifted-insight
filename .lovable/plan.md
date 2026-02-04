

# Enhanced Scrape Control with Progress Indicator

✅ IMPLEMENTED

## What was built:

1. **ScrapeControlCard Component** (`src/components/admin/ScrapeControlCard.tsx`)
   - Category dropdown (All, AI, Apple, Tesla, Crypto, Climate, Politics, Finance)
   - Loading spinner with animated RefreshCw icon
   - Progress bar with percentage display
   - Phase text showing current operation
   - Results summary with per-source breakdown
   - Disabled button state during scraping

2. **Edge Function Updates** (`supabase/functions/scrape-news/index.ts`)
   - Added `CATEGORY_SOURCE_MAP` for filtering sources by category
   - Accepts `{ category?: string }` in request body
   - Filters sources based on category parameter
   - Returns same response format for compatibility

3. **Dashboard Integration** (`src/pages/admin/Dashboard.tsx`)
   - Added ScrapeControlCard to main content area
   - Removed old simple "Scrape Now" button from header
   - Connected refetch callback for analytics refresh

## Testing
Navigate to `/admin/dashboard` to test the scrape control.
