# OG Image Generation - IMPLEMENTED ✅

Dynamic OG image system is now live. Generates 1200x600 PNG images with:
- Article headline (truncated to 55 chars)
- CTA: "NOOZ is the new news."
- NOOZ.NEWS branding
- Dark overlay for text readability
- Size: ~40KB (well under 600KB limit)

## Endpoint
`/functions/v1/generate-og-image?id={articleId}`

## Files
- `supabase/functions/generate-og-image/index.ts` - SVG-to-PNG generator
- `src/components/ArticleMetaTags.tsx` - Updated to use generator
- `supabase/functions/share-meta/index.ts` - Updated for server-side meta
