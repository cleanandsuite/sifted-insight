
# Enhanced Analysis Summary for NOOZ.NEWS

This plan improves the Analysis section to provide a more thorough, paragraph-length summary with essential news details (who, what, where, when, why) while still being a digestible summary rather than the full article.

---

## Current State

The current AI prompt in `summarize-article/index.ts` instructs:
- **Analysis**: "2-3 sentences on implications and context"

This produces shallow analysis that lacks:
- Key names, places, and dates from the article
- The "why it matters" context
- Sufficient depth for readers to understand the story

---

## Solution

### 1. Update AI Prompt for Richer Analysis

Modify the system prompt in the summarize-article edge function to request a more substantive Analysis section:

**Current prompt:**
```
3. Analysis (2-3 sentences on implications and context)
```

**New prompt:**
```
3. Analysis (A thorough paragraph of 4-6 sentences that covers:
   - WHO: Key people, companies, or organizations involved
   - WHAT: The core news or development in detail
   - WHERE: Relevant locations or markets affected
   - WHEN: Timeline, dates, or deadlines mentioned
   - WHY: The significance and broader implications
   This should read like a condensed news brief that captures the essential story.)
```

### 2. Update Tool Function Description

Modify the function parameter description for `analysis`:

**Current:**
```json
"analysis": {
  "type": "string",
  "description": "2-3 sentences of context and implications"
}
```

**New:**
```json
"analysis": {
  "type": "string", 
  "description": "A thorough paragraph (4-6 sentences) covering who, what, where, when, and why this news matters. Include specific names, places, dates, and explain the significance."
}
```

---

## File Changes

| File | Change |
|------|--------|
| `supabase/functions/summarize-article/index.ts` | Update system prompt and tool parameter descriptions |

---

## Updated System Prompt

```typescript
content: `You are an expert news analyst and summarizer for NOOZ.NEWS. Your job is to distill complex articles into clear, actionable insights for busy professionals who want to stay informed without reading full articles.

Generate a comprehensive summary with the following structure:

1. Executive Summary (2-3 sentences capturing the headline news)

2. Key Points (3-5 bullet points of the most important facts, figures, and developments)

3. Analysis (A thorough paragraph of 4-6 sentences that tells the complete story:
   - Include key names of people, companies, and organizations
   - Specify relevant locations, markets, or regions affected
   - Note important dates, timelines, or deadlines
   - Explain WHY this matters and what the implications are
   - Provide enough context that a reader understands the full picture
   This should read like a condensed but complete news brief.)

4. Takeaways (2-3 actionable insights or things to watch for)

Write in a professional, journalistic tone. Be specific with facts—use actual names, numbers, and places from the article rather than vague references.`
```

---

## Example: Before vs After

**Before (current):**
> "This release marks a significant leap in AI capabilities. The improvements suggest a new direction for the industry."

**After (enhanced):**
> "OpenAI's release of GPT-5 on February 4, 2025, marks the company's most significant model update since GPT-4's launch in March 2023. CEO Sam Altman announced the model during a livestreamed event from San Francisco headquarters, highlighting its 'deep reasoning' mode that outperforms previous versions by 40% on complex problem-solving benchmarks. The timing positions OpenAI ahead of competitors Anthropic and Google, both expected to release major updates in Q2. Industry analysts at Goldman Sachs estimate the upgrade could drive $2 billion in additional API revenue this year, particularly from enterprise customers in healthcare and finance who require advanced reasoning capabilities."

---

## Technical Notes

- The AI model (google/gemini-3-flash-preview) handles longer output well
- No database schema changes needed—the `analysis` field is already TEXT type
- The UI component (`SummaryTabs.tsx`) already displays the full analysis text
- Existing articles will retain their current summaries; only newly scraped articles will get enhanced analysis

---

## Benefits

1. **More informative**: Readers get the complete story context
2. **Specific details**: Names, places, dates make it feel like real news
3. **Still summarized**: 4-6 sentences is still much shorter than the original 10+ minute article
4. **Answers "why should I care"**: Includes implications and significance
