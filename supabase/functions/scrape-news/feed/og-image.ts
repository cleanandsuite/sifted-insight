// Fetch og:image from article page
// deno-lint-ignore-file no-explicit-any

const FETCH_TIMEOUT_MS = 5000;

/**
 * Fetch the og:image URL from an article's HTML page.
 * Returns null if not found or on error.
 */
export async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(articleUrl, {
      headers: {
        "User-Agent": "SIFT-NewsBot/1.0 (https://sifted-insight.lovable.app)",
        Accept: "text/html",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    // Only read first 100KB to find meta tags (they're in <head>)
    const reader = response.body?.getReader();
    if (!reader) return null;

    let html = "";
    const decoder = new TextDecoder();
    const MAX_BYTES = 100 * 1024;

    while (html.length < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      // Stop if we've passed </head>
      if (html.includes("</head>")) break;
    }

    reader.cancel().catch(() => {}); // Cancel the rest

    return extractOgImage(html);
  } catch (error: any) {
    // Timeout or network error - silently return null
    return null;
  }
}

/**
 * Extract og:image from HTML head section.
 */
export function extractOgImage(html: string): string | null {
  // Try og:image first
  const ogImageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogImageMatch?.[1]) {
    return ogImageMatch[1];
  }

  // Alternative format: content before property
  const ogImageAltMatch = html.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
  );
  if (ogImageAltMatch?.[1]) {
    return ogImageAltMatch[1];
  }

  // Try twitter:image as fallback
  const twitterImageMatch = html.match(
    /<meta[^>]+(?:name|property)=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (twitterImageMatch?.[1]) {
    return twitterImageMatch[1];
  }

  // Alt format for twitter:image
  const twitterImageAltMatch = html.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']twitter:image["']/i
  );
  if (twitterImageAltMatch?.[1]) {
    return twitterImageAltMatch[1];
  }

  return null;
}
