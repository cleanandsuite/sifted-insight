

# Use Your Own AI for Faster Article Summarization

## Current Bottleneck

Your system currently uses **Lovable AI** (specifically `google/gemini-3-flash-preview`) to summarize articles. Each article triggers a separate call to the `summarize-article` edge function, and the Lovable AI gateway has rate limits that slow down bulk processing.

**Current stats:**
- 244 articles stuck in `pending` status
- Summarization happens one-by-one after scraping
- Rate limits can throttle processing during high volume scrapes

---

## Options to Speed Up with Your Own AI

### Option A: Use Your Own OpenAI API Key (Recommended)

Add your OpenAI API key to bypass Lovable AI rate limits and use your own quota.

**Benefits:**
- Higher rate limits (especially on paid tiers)
- Parallel processing (process 5-10 articles simultaneously)
- Choose faster models like `gpt-4o-mini` for lower cost/latency

**You would need to provide:**
- Your OpenAI API key (`OPENAI_API_KEY`)

---

### Option B: Use Your Own Google AI / Gemini API Key

If you prefer Google's models, you can use your own Gemini API key.

**Benefits:**
- Same quality models you're using now
- Higher rate limits on your own account
- Can use `gemini-1.5-flash` for faster processing

**You would need to provide:**
- Your Google AI API key (`GOOGLE_AI_API_KEY`)

---

### Option C: Use Anthropic Claude

Claude is excellent for summarization tasks.

**Benefits:**
- High quality summaries
- Good rate limits on paid plans

**You would need to provide:**
- Your Anthropic API key (`ANTHROPIC_API_KEY`)

---

## What I'll Implement

Once you choose an option and provide the API key, I'll:

1. **Update `summarize-article` edge function** to use your chosen AI provider
2. **Add parallel batch processing** - summarize 5-10 articles at once instead of one-by-one
3. **Add a "Bulk Summarize" button** in admin dashboard to process all pending articles
4. **Implement retry logic** for failed summarizations

---

## Technical Details

### Architecture Change

```text
Current Flow:
┌─────────────┐    ┌──────────────────┐    ┌────────────────┐
│ Scrape News │───▶│ Trigger Summary  │───▶│ Lovable AI     │
│ (1 article) │    │ (fire & forget)  │    │ (rate limited) │
└─────────────┘    └──────────────────┘    └────────────────┘

New Flow:
┌─────────────┐    ┌──────────────────┐    ┌────────────────┐
│ Scrape News │───▶│ Queue Articles   │───▶│ Your AI API    │
│ (all feeds) │    │ (batch process)  │    │ (parallel 10x) │
└─────────────┘    └──────────────────┘    └────────────────┘
```

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/summarize-article/index.ts` | Support multiple AI providers, add batch mode |
| `src/components/admin/ScrapeControlCard.tsx` | Add "Summarize Pending" button |
| New: `supabase/functions/batch-summarize/index.ts` | Parallel processing of pending articles |

---

## Which AI Provider Would You Like to Use?

Let me know which option you prefer:
- **A) OpenAI** - Provide your `OPENAI_API_KEY`
- **B) Google Gemini** - Provide your `GOOGLE_AI_API_KEY`  
- **C) Anthropic Claude** - Provide your `ANTHROPIC_API_KEY`

