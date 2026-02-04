import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Source {
  id: string;
  name: string;
  rss_url: string | null;
  website_url: string | null;
}

interface ScrapedArticle {
  title: string;
  url: string;
  content: string;
  publishedAt: string | null;
  author: string | null;
  imageUrl: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get active sources with RSS URLs
    const { data: sources, error: sourcesError } = await supabase
      .from("sources")
      .select("id, name, rss_url, website_url")
      .eq("is_active", true)
      .not("rss_url", "is", null);

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
    }

    console.log(`Found ${sources?.length || 0} active sources to scrape`);

    const results: { source: string; articlesFound: number; articlesAdded: number }[] = [];

    for (const source of sources || []) {
      try {
        console.log(`Scraping ${source.name}...`);
        
        // Use Firecrawl to scrape the RSS feed page
        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: source.rss_url || source.website_url,
            formats: ["markdown", "links"],
            onlyMainContent: true,
          }),
        });

        if (!scrapeResponse.ok) {
          const errorText = await scrapeResponse.text();
          console.error(`Firecrawl error for ${source.name}: ${errorText}`);
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        const links = scrapeData.data?.links || scrapeData.links || [];
        
        // Filter for article links (common patterns)
        const articleLinks = links
          .filter((link: string) => {
            const url = link.toLowerCase();
            return (
              url.includes("/article") ||
              url.includes("/news") ||
              url.includes("/post") ||
              url.includes("/story") ||
              url.includes("/blog") ||
              url.match(/\/\d{4}\/\d{2}\//) || // Date patterns like /2024/01/
              url.match(/\d{5,}/) // Article IDs
            );
          })
          .slice(0, 5); // Limit to 5 articles per source per run

        console.log(`Found ${articleLinks.length} potential article links for ${source.name}`);

        let articlesAdded = 0;

        for (const articleUrl of articleLinks) {
          try {
            // Check if article already exists
            const { data: existing } = await supabase
              .from("articles")
              .select("id")
              .eq("original_url", articleUrl)
              .maybeSingle();

            if (existing) {
              console.log(`Article already exists: ${articleUrl}`);
              continue;
            }

            // Scrape individual article
            const articleResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url: articleUrl,
                formats: ["markdown"],
                onlyMainContent: true,
              }),
            });

            if (!articleResponse.ok) {
              console.error(`Failed to scrape article: ${articleUrl}`);
              continue;
            }

            const articleData = await articleResponse.json();
            const metadata = articleData.data?.metadata || articleData.metadata || {};
            const markdown = articleData.data?.markdown || articleData.markdown || "";

            if (!metadata.title || markdown.length < 200) {
              console.log(`Skipping article with insufficient content: ${articleUrl}`);
              continue;
            }

            // Calculate read times
            const wordCount = markdown.split(/\s+/).length;
            const originalReadTime = Math.ceil(wordCount / 200); // 200 WPM
            const siftedReadTime = Math.ceil(originalReadTime * 0.3); // AI summary is ~30% of original

            // Generate slug
            const slug = metadata.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 100) + "-" + Date.now().toString(36);

            // Insert article
            const { data: newArticle, error: insertError } = await supabase
              .from("articles")
              .insert({
                title: metadata.title,
                slug,
                original_url: articleUrl,
                source_id: source.id,
                summary: markdown.slice(0, 500) + "...",
                image_url: metadata.ogImage || metadata.image || null,
                author: metadata.author || null,
                published_at: metadata.publishedTime || new Date().toISOString(),
                original_read_time: originalReadTime,
                sifted_read_time: siftedReadTime,
                status: "pending", // Will be set to published after AI summary
                rank_score: 0.5 + Math.random() * 0.5, // Initial random score
              })
              .select("id")
              .single();

            if (insertError) {
              console.error(`Failed to insert article: ${insertError.message}`);
              continue;
            }

            console.log(`Added article: ${metadata.title}`);
            articlesAdded++;

            // Trigger AI summarization asynchronously
            fetch(`${SUPABASE_URL}/functions/v1/summarize-article`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                articleId: newArticle.id,
                content: markdown,
              }),
            }).catch((err) => console.error("Failed to trigger summarization:", err));
          } catch (articleError) {
            console.error(`Error processing article ${articleUrl}:`, articleError);
          }
        }

        results.push({
          source: source.name,
          articlesFound: articleLinks.length,
          articlesAdded,
        });
      } catch (sourceError) {
        console.error(`Error scraping source ${source.name}:`, sourceError);
        results.push({
          source: source.name,
          articlesFound: 0,
          articlesAdded: 0,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        totalArticlesAdded: results.reduce((sum, r) => sum + r.articlesAdded, 0),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Scrape error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
