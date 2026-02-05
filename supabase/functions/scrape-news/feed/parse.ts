// deno-lint-ignore-file no-explicit-any

import { parseFeed as denoRssParseFeed } from "https://deno.land/x/rss@1.1.2/mod.ts";
import type { FeedItem, ParsedFeed } from "./types.ts";
import { extractFirstImageUrlFromHtml, sanitizeText, sanitizeUrl } from "./sanitize.ts";

function toIsoDate(value: any): string | null {
  if (!value) return null;
  try {
    if (value instanceof Date) return value.toISOString();
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

function pickLink(entry: any): string | null {
  const links = Array.isArray(entry?.links) ? entry.links : [];

  const best =
    links.find((l: any) => {
      const rel = (l?.rel ?? "").toLowerCase();
      const type = (l?.type ?? "").toLowerCase();
      const href = l?.href;
      if (!href) return false;
      // Prefer alternate HTML links when present
      const relOk = rel === "alternate" || rel === "";
      const typeOk = type.includes("html") || type === "";
      return relOk && typeOk;
    }) ?? links[0];

  return best?.href ?? entry?.link?.href ?? entry?.link ?? null;
}

function pickAuthor(entry: any): string | null {
  return (
    entry?.author?.name ??
    entry?.author?.value ??
    entry?.dc?.creator?.value ??
    entry?.creator?.value ??
    null
  );
}

function pickDescription(entry: any): string {
  return (
    entry?.description?.value ??
    entry?.summary?.value ??
    entry?.content?.value ??
    entry?.description ??
    entry?.summary ??
    entry?.content ??
    ""
  );
}

function pickImageUrl(entry: any, descriptionHtml: string): string | null {
  // The @mikaelporttila/rss library exposes media namespace as "media:rss" extension
  // with nested structures like media:rss.thumbnail, media:rss.content, etc.

  // 1. Check media:rss extension (most common for images in RSS 2.0)
  // Library uses "media:rss" destructuring helper - check multiple possible locations
  const mediaRss = 
    entry?.["media:rss"] ?? 
    entry?.mediaRss ?? 
    entry?.media ?? 
    entry?.["media"] ??
    null;

  if (mediaRss) {
    // media:thumbnail
    const thumbnail = mediaRss?.thumbnail;
    if (thumbnail) {
      const thumbUrl = thumbnail?.url ?? thumbnail?.href ?? (typeof thumbnail === "string" ? thumbnail : null);
      if (thumbUrl) return thumbUrl;
      // Sometimes it's an array
      if (Array.isArray(thumbnail) && thumbnail[0]) {
        const first = thumbnail[0];
        const url = first?.url ?? first?.href ?? (typeof first === "string" ? first : null);
        if (url) return url;
      }
    }

    // media:content (often used for images)
    const content = mediaRss?.content;
    if (content) {
      const contentUrl = content?.url ?? content?.href ?? (typeof content === "string" ? content : null);
      if (contentUrl && (content?.medium === "image" || !content?.medium)) return contentUrl;
      // Array form
      if (Array.isArray(content)) {
        const imgContent = content.find((c: any) => c?.medium === "image" || (c?.type ?? "").startsWith("image/"));
        const url = imgContent?.url ?? imgContent?.href;
        if (url) return url;
        // Fallback to first content
        const first = content[0];
        const firstUrl = first?.url ?? first?.href;
        if (firstUrl) return firstUrl;
      }
    }
  }

  // 2. Check attachments (library uses "attachments" for RSS enclosures)
  const attachments = entry?.attachments ?? entry?.enclosures ?? entry?.enclosure ?? [];
  const attachmentList = Array.isArray(attachments) ? attachments : [attachments].filter(Boolean);
  for (const att of attachmentList) {
    const mimeType = att?.mimeType ?? att?.type ?? "";
    const url = att?.url ?? att?.href;
    if (url && (mimeType.startsWith("image/") || mimeType === "")) {
      if (mimeType.startsWith("image/")) return url;
      if (/\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i.test(url)) return url;
    }
  }

  // 2b. Also check raw enclosures format
  const enclosures = entry?.enclosure ?? [];
  const enclosureList = Array.isArray(enclosures) ? enclosures : [enclosures].filter(Boolean);
  for (const enc of enclosureList) {
    const type = enc?.type ?? "";
    const url = enc?.url ?? enc?.href;
    if (url && (type.startsWith("image/") || type === "")) {
      // If no type, check if URL looks like an image
      if (type.startsWith("image/")) return url;
      if (/\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i.test(url)) return url;
    }
  }

  // 3. Check links for image type (Atom feeds sometimes use link with type)
  const links = entry?.links ?? [];
  for (const link of links) {
    const rel = link?.rel ?? "";
    const type = link?.type ?? "";
    const href = link?.href;
    if (href && (rel === "enclosure" || type.startsWith("image/"))) {
      return href;
    }
  }

  // 4. Check image element (some RSS feeds use <image> at item level)
  const itemImage = entry?.image;
  if (itemImage) {
    const imgUrl = itemImage?.url ?? itemImage?.href ?? (typeof itemImage === "string" ? itemImage : null);
    if (imgUrl) return imgUrl;
  }

  // 5. Check itunes:image (common for podcasts)
  const itunesImage = entry?.["itunes:image"] ?? entry?.itunes?.image;
  if (itunesImage) {
    const url = itunesImage?.href ?? itunesImage?.url ?? (typeof itunesImage === "string" ? itunesImage : null);
    if (url) return url;
  }

  // 6. Fallback: extract from HTML content/description
  return extractFirstImageUrlFromHtml(descriptionHtml);
}

/**
 * Parse RSS or Atom XML into structured feed data.
 */
export async function parseFeedXml(xml: string): Promise<ParsedFeed | null> {
  try {
    const feed: any = await denoRssParseFeed(xml);

    const feedTypeRaw = String(feed?.feedType ?? feed?.type ?? "").toLowerCase();
    const feedType: "rss" | "atom" = feedTypeRaw.includes("atom") ? "atom" : "rss";

    const title = sanitizeText(feed?.title?.value ?? feed?.title ?? "Unknown Feed");
    const entries = (feed?.entries ?? feed?.items ?? []) as any[];

    const items: FeedItem[] = [];
    for (const entry of entries) {
      // Debug: log first entry structure to help diagnose image extraction
      if (items.length === 0) {
        console.log("Sample entry keys:", Object.keys(entry ?? {}));
        if (entry?.["media:rss"]) console.log("media:rss:", JSON.stringify(entry["media:rss"]).slice(0, 300));
        if (entry?.attachments) console.log("attachments:", JSON.stringify(entry.attachments).slice(0, 300));
        if (entry?.enclosures) console.log("enclosures:", JSON.stringify(entry.enclosures).slice(0, 300));
        if (entry?.links) console.log("links sample:", JSON.stringify(entry.links.slice(0, 2)).slice(0, 300));
      }

      const rawTitle = entry?.title?.value ?? entry?.title ?? "";
      const rawDescription = pickDescription(entry);
      const rawLink = pickLink(entry);

      const titleSanitized = sanitizeText(rawTitle);
      const linkSanitized = rawLink ? sanitizeUrl(rawLink) : "";
      if (!titleSanitized || !linkSanitized) continue;

      const imageUrl = pickImageUrl(entry, rawDescription);

      items.push({
        title: titleSanitized,
        link: linkSanitized,
        description: sanitizeText(rawDescription),
        pubDate: toIsoDate(entry?.published ?? entry?.updated),
        author: pickAuthor(entry) ? sanitizeText(pickAuthor(entry) as string) : null,
        imageUrl: imageUrl ? sanitizeUrl(imageUrl) : null,
        guid: entry?.id ?? entry?.guid?.value ?? entry?.guid ?? null,
      });
    }

    return { title, items, feedType };
  } catch (error) {
    console.error("Error parsing feed XML:", error);
    return null;
  }
}
