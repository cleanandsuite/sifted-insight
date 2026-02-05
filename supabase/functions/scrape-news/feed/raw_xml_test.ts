// deno-lint-ignore-file no-explicit-any
import { assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("check raw TechCrunch XML for media:thumbnail", async () => {
  const url = "https://techcrunch.com/feed/";
  const response = await fetch(url, {
    headers: {
      "User-Agent": "TestBot/1.0",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    console.log("Could not fetch TechCrunch feed:", response.status);
    return;
  }

  const xml = await response.text();
  
  // Look for media:thumbnail or media:content in raw XML
  const hasMediaThumbnail = xml.includes("media:thumbnail");
  const hasMediaContent = xml.includes("media:content");
  const hasEnclosure = xml.includes("<enclosure");
  
  console.log("Raw XML contains media:thumbnail:", hasMediaThumbnail);
  console.log("Raw XML contains media:content:", hasMediaContent);
  console.log("Raw XML contains enclosure:", hasEnclosure);
  
  // Extract first item's media:thumbnail if present
  const itemMatch = xml.match(/<item>[\s\S]*?<\/item>/);
  if (itemMatch) {
    console.log("\n=== First <item> raw XML ===");
    console.log(itemMatch[0].slice(0, 2000));
  }

  assertExists(xml);
});