 // Fetch og:image from article page
 // deno-lint-ignore-file no-explicit-any
 
 const FETCH_TIMEOUT_MS = 8000;
 
 // User agents to rotate through for better success rate
 const USER_AGENTS = [
   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
   "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
 ];
 
 /**
  * Fetch the og:image URL from an article's HTML page.
  * Returns null if not found or on error.
  */
 export async function fetchOgImage(articleUrl: string): Promise<string | null> {
   try {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
     
     // Pick a random user agent for better success rate
     const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
 
     const response = await fetch(articleUrl, {
       headers: {
         "User-Agent": userAgent,
         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
         "Accept-Language": "en-US,en;q=0.5",
         "Accept-Encoding": "gzip, deflate",
         "Connection": "keep-alive",
         "Upgrade-Insecure-Requests": "1",
       },
       signal: controller.signal,
       redirect: "follow",
     });
 
     clearTimeout(timeoutId);
 
     if (!response.ok) {
       console.log(`og:image fetch failed for ${articleUrl}: ${response.status}`);
       return null;
     }
 
     // Only read first 150KB to find meta tags (they're in <head>)
     const reader = response.body?.getReader();
     if (!reader) return null;
 
     let html = "";
     const decoder = new TextDecoder();
     const MAX_BYTES = 150 * 1024;
 
     while (html.length < MAX_BYTES) {
       const { done, value } = await reader.read();
       if (done) break;
       html += decoder.decode(value, { stream: true });
       // Stop if we've passed </head>
       if (html.includes("</head>")) break;
     }
 
     reader.cancel().catch(() => {}); // Cancel the rest
 
     const imageUrl = extractOgImage(html);
     if (imageUrl) {
       console.log(`Found og:image for ${articleUrl.slice(0, 50)}...`);
     }
     return imageUrl;
   } catch (error: any) {
     // Timeout or network error - log and return null
     console.log(`og:image error for ${articleUrl}: ${error.message || 'timeout'}`);
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
