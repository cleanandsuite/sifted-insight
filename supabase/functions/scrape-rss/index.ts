import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all sources
    const { data: sources } = await supabase.from("sources").select("*");
    const sourceMap = new Map();
    sources?.forEach(s => sourceMap.set(s.name.toLowerCase(), s.id));

    const feeds = [
      { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", source: "bbc", priority: 1 },
      { url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", source: "nyt", priority: 2 },
      { url: "https://feeds.arstechnica.com/arstechnica/index", source: "ars technica", priority: 2 },
      { url: "https://techcrunch.com/feed/", source: "techcrunch", priority: 3 },
      { url: "https://www.theverge.com/rss/index.xml", source: "the verge", priority: 3 },
      { url: "https://wired.com/feed/rss", source: "wired", priority: 3 },
    ];

    const articles = [];
    let processed = 0;

    for (const feed of feeds) {
      try {
        const response = await fetch(feed.url);
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        
        const items = xml.querySelectorAll("item");
        
        for (let i = 0; i < Math.min(items.length, 10); i++) {
          const item = items[i];
          const title = item.querySelector("title")?.textContent?.trim() || "";
          const link = item.querySelector("link")?.textContent?.trim() || "";
          const description = item.querySelector("description")?.textContent?.trim() || "";
          const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";

          if (!title || !link) continue;

          // Get source_id from map
          const source_id = sourceMap.get(feed.source)?.id || null;

          articles.push({
            title,
            url: link,
            summary: description.substring(0, 800),
            content: description,
            source_id,
            published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            status: "published",
            created_at: new Date().toISOString(),
          });
        }
        processed++;
      } catch (err) {
        console.error(`Error scraping ${feed.source}:`, err);
      }
    }

    console.log(`Processed ${processed} feeds, collected ${articles.length} articles`);

    // Insert all (ignore duplicates)
    if (articles.length > 0) {
      const { data, error } = await supabase.from("articles")
        .upsert(articles, { onConflict: 'url', ignoreDuplicates: false })
        .select();
      
      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        articles_collected: articles.length,
        articles_inserted: data?.length || 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, articles_collected: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

console.log("Scraper function ready...");
