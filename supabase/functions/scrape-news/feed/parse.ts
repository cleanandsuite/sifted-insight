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
  // Try common media/enclosure shapes. Library may expose extensions differently across feed types.
  const media = entry?.media ?? entry?.mediaRss ?? entry?.extensions?.media ?? null;

  const mediaCandidates = [
    media?.thumbnail?.url,
    media?.thumbnail?.href,
    media?.content?.url,
    media?.content?.href,
  ].filter(Boolean);
  if (mediaCandidates.length > 0) return mediaCandidates[0] as string;

  const enclosures = Array.isArray(entry?.enclosures) ? entry.enclosures : [];
  const enclosureImg = enclosures.find((e: any) => (e?.type ?? "").startsWith("image/"));
  const enclosureUrl = enclosureImg?.href ?? enclosureImg?.url;
  if (enclosureUrl) return enclosureUrl;

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
