

# OG Image Generation with Headline & CTA

## Overview
Create a dynamic image generation system that produces Facebook-optimized OG images with:
- **Article headline** (50-60 characters max)
- **Call-to-action**: "NOOZ is the new news" (or similar tagline)
- **Dimensions**: 1200x600 pixels
- **Size**: Under 600KB

---

## Visual Design

```text
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │              [Article Background Image]                  │  │
│  │                  (with dark overlay)                     │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │                                                    │  │  │
│  │  │   "Apple Partners With OpenAI on                   │  │  │
│  │  │    Revolutionary AI Features..."                   │  │  │
│  │  │                                                    │  │  │
│  │  │              ── HEADLINE (50-60 chars) ──          │  │  │
│  │  │                                                    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │        ═══════════════════════════════════════           │  │
│  │                                                          │  │
│  │              NOOZ is the new news.                       │  │
│  │                     ── CTA ──                            │  │
│  │                                                          │  │
│  │  [NOOZ.NEWS logo/branding]                               │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Dimensions: 1200 x 600 pixels
```

---

## Technical Approach

Since Deno Edge Functions have limited image manipulation libraries, we'll use **SVG-to-PNG rendering** via the `@vercel/og` compatible approach or pure SVG with embedded base64 background.

### Option A: SVG with Embedded Image (Recommended)
1. Fetch the source article image
2. Convert to base64
3. Generate SVG with text overlays
4. Convert SVG to PNG using `resvg-wasm`

### Option B: HTML Canvas Rendering
Use Satori (from Vercel) which renders JSX to SVG, then convert to PNG.

---

## Implementation Steps

### Step 1: Create `generate-og-image` Edge Function

**New file:** `supabase/functions/generate-og-image/index.ts`

This function will:
1. Accept `articleId` as a query parameter
2. Fetch article data (title, image_url)
3. Truncate headline to 55 characters
4. Generate SVG with:
   - Background image (darkened overlay)
   - Headline text (bold, white, centered)
   - CTA text: "NOOZ is the new news."
   - NOOZ.NEWS branding
5. Convert SVG to PNG using `resvg-wasm`
6. Return optimized image under 600KB

**Text specifications:**
- Headline: Inter Bold, ~48px, white, max 2 lines
- CTA: Inter Regular, ~24px, white/light gray
- Max headline length: 55 characters (truncate with "...")

### Step 2: Update Meta Tag Components

**Modified files:**
- `src/components/ArticleMetaTags.tsx`
- `supabase/functions/share-meta/index.ts`

Changes:
- Update `og:image` to point to the new generator endpoint
- Update dimensions to 1200x600
- URL format: `/functions/v1/generate-og-image?id={articleId}`

---

## Text Content

| Element | Content | Max Length |
|---------|---------|------------|
| Headline | Article title (truncated) | 55 characters |
| CTA | "NOOZ is the new news." | 22 characters |
| Branding | "NOOZ.NEWS" | 9 characters |

**Total text on image**: ~86 characters max (well within guidelines)

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `supabase/functions/generate-og-image/index.ts` | Dynamic OG image generator with text overlays |
| Modify | `src/components/ArticleMetaTags.tsx` | Point to new generator, update to 1200x600 |
| Modify | `supabase/functions/share-meta/index.ts` | Point to new generator, update to 1200x600 |

---

## Technical Details

### SVG Template Structure

The generated SVG will include:
1. **Background**: Article image as base64, scaled to cover
2. **Dark overlay**: Semi-transparent black gradient for text readability
3. **Headline**: White text, bold, centered, wrapped to 2 lines max
4. **Separator line**: Subtle divider
5. **CTA**: "NOOZ is the new news." in lighter weight
6. **Logo**: NOOZ.NEWS text or favicon in corner

### Image Processing

Using `resvg-wasm` for SVG-to-PNG conversion:
- Input: SVG with embedded fonts and images
- Output: PNG at 1200x600
- Compression: PNG optimization to stay under 600KB

### Font Handling

Since we can't load custom fonts in Edge Functions easily, we'll:
- Use system fonts: `system-ui, -apple-system, sans-serif`
- Or embed Inter as base64 in the SVG (increases size but ensures consistency)

---

## Caching Strategy

```
Cache-Control: public, max-age=86400, s-maxage=604800
```

- Generated images cached for 24 hours in browser
- CDN caches for 7 days
- Reduces regeneration load

---

## Fallback Handling

If image generation fails:
1. Use a pre-made static OG image with just branding
2. Located at `public/og-image.png` (update to 1200x600 with CTA)

---

## Example Output

**Article**: "Apple Partners With OpenAI to Revolutionize Siri AI"

**Generated OG Image**:
- Background: Original article image (darkened)
- Headline: "Apple Partners With OpenAI to Revolutionize..."
- CTA: "NOOZ is the new news."
- Branding: NOOZ.NEWS logo in corner
- Size: ~300-500KB (JPEG/PNG optimized)
- Dimensions: 1200x600

