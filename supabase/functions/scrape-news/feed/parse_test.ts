// deno-lint-ignore-file no-explicit-any
import { assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { parseFeed as denoRssParseFeed } from "https://deno.land/x/rss@1.1.2/mod.ts";

Deno.test("parse TechCrunch RSS and inspect entry structure", async () => {
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
  const feed: any = await denoRssParseFeed(xml);

  console.log("Feed type:", feed?.feedType ?? feed?.type);
  console.log("Feed title:", feed?.title?.value ?? feed?.title);
  console.log("Number of entries:", feed?.entries?.length ?? feed?.items?.length ?? 0);

  const entries = feed?.entries ?? feed?.items ?? [];
  if (entries.length > 0) {
    const entry = entries[0];
    console.log("\n=== First Entry ===");
    console.log("All keys:", Object.keys(entry));
    console.log("Title:", entry?.title?.value ?? entry?.title);
    console.log("Links:", JSON.stringify(entry?.links?.slice?.(0, 2) ?? entry?.links));
    console.log("Attachments:", JSON.stringify(entry?.attachments));
    console.log("media:rss:", JSON.stringify(entry?.["media:rss"]));
    console.log("enclosures:", JSON.stringify(entry?.enclosures));
    console.log("image:", JSON.stringify(entry?.image));

    // MediaRss is a type/fields helper, not a function - check the raw entry for media:rss data
    console.log("\n=== MediaRss fields on entry ===");
    // The library may use different key names
    for (const key of Object.keys(entry)) {
      if (key.toLowerCase().includes("media") || key.toLowerCase().includes("enclosure") || key.toLowerCase().includes("attach") || key.toLowerCase().includes("image")) {
        console.log(`${key}:`, JSON.stringify(entry[key])?.slice(0, 300));
      }
    }

    // Log description to see if it has <img> tags
    const desc = entry?.description?.value ?? entry?.description ?? "";
    console.log("\nDescription (full):", desc);
    
    // Check if description contains <img>
    const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
    console.log("Image found in description:", imgMatch ? imgMatch[1] : "NONE");
  }

  assertExists(feed);
});

Deno.test("parse Google News RSS and inspect entry structure", async () => {
  const url = "https://news.google.com/rss";
  const response = await fetch(url, {
    headers: {
      "User-Agent": "TestBot/1.0",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    console.log("Could not fetch Google News feed:", response.status);
    return;
  }

  const xml = await response.text();
  const feed: any = await denoRssParseFeed(xml);

  console.log("Feed type:", feed?.feedType ?? feed?.type);
  console.log("Number of entries:", feed?.entries?.length ?? 0);

  const entries = feed?.entries ?? [];
  if (entries.length > 0) {
    const entry = entries[0];
    console.log("\n=== First Google News Entry ===");
    console.log("All keys:", Object.keys(entry));
    console.log("Title:", entry?.title?.value ?? entry?.title);
    
    // Check for media
    for (const key of Object.keys(entry)) {
      if (key.toLowerCase().includes("media") || key.toLowerCase().includes("enclosure") || key.toLowerCase().includes("attach") || key.toLowerCase().includes("image")) {
        console.log(`${key}:`, JSON.stringify(entry[key])?.slice(0, 500));
      }
    }
    
    const desc = entry?.description?.value ?? entry?.description ?? "";
    console.log("\nDescription:", desc.slice(0, 500));
    
    const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
    console.log("Image found in description:", imgMatch ? imgMatch[1] : "NONE");
  }

  assertExists(feed);
});
