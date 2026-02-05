import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { fetchOgImage, extractOgImage } from "./og-image.ts";

Deno.test("extract og:image from TechCrunch article", async () => {
  // Use a real TechCrunch article URL
  const url = "https://techcrunch.com/2026/02/04/sam-altman-got-exceptionally-testy-over-claude-super-bowl-ads/";
  
  const imageUrl = await fetchOgImage(url);
  
  console.log("og:image URL:", imageUrl);
  
  // Should find an image
  assertExists(imageUrl, "Should find og:image");
  assertEquals(typeof imageUrl, "string");
});

Deno.test("extractOgImage parses meta tag correctly", () => {
  const html = `
    <html>
    <head>
      <meta property="og:image" content="https://example.com/image.jpg" />
    </head>
    </html>
  `;
  
  const result = extractOgImage(html);
  assertEquals(result, "https://example.com/image.jpg");
});

Deno.test("extractOgImage handles alt format", () => {
  const html = `
    <html>
    <head>
      <meta content="https://example.com/image2.png" property="og:image" />
    </head>
    </html>
  `;
  
  const result = extractOgImage(html);
  assertEquals(result, "https://example.com/image2.png");
});
