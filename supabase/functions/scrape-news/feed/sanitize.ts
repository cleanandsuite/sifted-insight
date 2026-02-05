// deno-lint-ignore-file no-explicit-any

/**
 * Sanitize text by removing HTML tags and control characters.
 */
export function sanitizeText(text: string): string {
  return (text ?? "")
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Sanitize URL.
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL((url ?? "").trim());
    return parsed.href;
  } catch {
    return (url ?? "").trim();
  }
}

/**
 * Extract the first image URL from an HTML snippet.
 */
export function extractFirstImageUrlFromHtml(html: string): string | null {
  const content = html ?? "";
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch?.[1] ?? null;
}
