// Native RSS/Atom feed parser for Deno runtime
// deno-lint-ignore-file no-explicit-any

import { parseFeedXml } from "./feed/parse.ts";
import type { ParsedFeed } from "./feed/types.ts";
export type { FeedItem, ParsedFeed } from "./feed/types.ts";

const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent": "SIFT-NewsBot/1.0 (https://sifted-insight.lovable.app)",
  Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
};

/**
 * Fetch and parse an RSS or Atom feed from a URL.
 */
export async function fetchAndParseFeed(url: string): Promise<ParsedFeed | null> {
  try {
    const response = await fetch(url, { headers: DEFAULT_HEADERS });

    if (!response.ok) {
      console.error(`Failed to fetch feed ${url}: ${response.status} ${response.statusText}`);
      return null;
    }

    const xml = await response.text();
    const parsed = await parseFeed(xml);

    if (!parsed) {
      console.error(`Failed to parse feed XML for ${url}. XML snippet:`, xml.slice(0, 200));
    }

    return parsed;
  } catch (error) {
    console.error(`Error fetching feed ${url}:`, error);
    return null;
  }
}

/**
 * Parse RSS or Atom XML into structured feed data.
 */
export async function parseFeed(xml: string): Promise<ParsedFeed | null> {
  return await parseFeedXml(xml);
}
