import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

// Validation schemas
const urlSchema = z.string().url().max(2048);
const titleSchema = z.string().min(5).max(500);
const authorSchema = z.string().max(255).nullable();

// Allowed domains for article scraping
const ALLOWED_DOMAINS = [
  'techcrunch.com',
  'theverge.com',
  'wired.com',
  'arstechnica.com',
  'technologyreview.com',
  'engadget.com',
  'mashable.com',
  'venturebeat.com',
  'zdnet.com',
  'cnet.com',
  'reuters.com',
  'bloomberg.com',
  'nytimes.com',
  'wsj.com',
  'bbc.com',
  'theguardian.com',
];

const MAX_ARTICLES_PER_SOURCE = 5;
const MAX_CONTENT_LENGTH = 100000;

// Sanitize string by removing control characters
const sanitizeString = (str: string): string => {
  return str
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .trim();
};

// Validate URL is from allowed domain
const isAllowedDomain = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ALLOWED_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
};

// Authenticate request - checks for admin/service role
const authenticateRequest = async (req: Request): Promise<{ authorized: boolean; error?: string }> => {
  const authHeader = req.headers.get('Authorization');
  
  // Check for service role key (internal cron job calls)
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (authHeader === `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return { authorized: true };
  }
  
  // For external calls, require admin authentication
  if (!authHeader) {
    return { authorized: false, error: 'Missing authorization header' };
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { authorized: false, error: 'Server configuration error' };
  }

  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) {
    return { authorized: false, error: 'Unauthorized' };
  }

  // For now, any authenticated user can trigger scraping
  // In production, you might want to add role-based checks here
  return { authorized: true };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authResult = await authenticateRequest(req);
    if (!authResult.authorized) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        
        // Validate source URL
        const sourceUrl = source.rss_url || source.website_url;
        if (!sourceUrl || !urlSchema.safeParse(sourceUrl).success) {
          console.error(`Invalid source URL for ${source.name}`);
          continue;
        }

        // Use Firecrawl to scrape the RSS feed page
        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: sourceUrl,
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
        
        // Validate Firecrawl response
        if (!scrapeData?.data && !scrapeData?.links) {
          console.error(`Invalid response from Firecrawl for ${source.name}`);
          continue;
        }

        const links = scrapeData.data?.links || scrapeData.links || [];
        
        // Filter for article links (common patterns) and validate URLs
        const articleLinks = links
          .filter((link: string) => {
            // Validate URL format
            if (!urlSchema.safeParse(link).success) {
              return false;
            }
            
            // Check if from allowed domain
            if (!isAllowedDomain(link)) {
              return false;
            }

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
          .slice(0, MAX_ARTICLES_PER_SOURCE);

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
            let markdown = articleData.data?.markdown || articleData.markdown || "";

            // Validate markdown content
            if (!markdown || markdown.length < 200) {
              console.log(`Skipping article with insufficient content: ${articleUrl}`);
              continue;
            }

            // Truncate content if too long
            if (markdown.length > MAX_CONTENT_LENGTH) {
              markdown = markdown.slice(0, MAX_CONTENT_LENGTH);
            }

            // Validate title
            if (!titleSchema.safeParse(metadata.title).success) {
              console.log(`Invalid title for article: ${articleUrl}`);
              continue;
            }

            // Sanitize metadata
            const sanitizedTitle = sanitizeString(metadata.title);
            const sanitizedAuthor = metadata.author ? sanitizeString(metadata.author).slice(0, 255) : null;

            // Calculate read times
            const wordCount = markdown.split(/\s+/).length;
            const originalReadTime = Math.ceil(wordCount / 200); // 200 WPM
            const siftedReadTime = Math.ceil(originalReadTime * 0.3); // AI summary is ~30% of original

            // Generate slug
            const slug = sanitizedTitle
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 100) + "-" + Date.now().toString(36);

            // Insert article
            const { data: newArticle, error: insertError } = await supabase
              .from("articles")
              .insert({
                title: sanitizedTitle,
                slug,
                original_url: articleUrl,
                source_id: source.id,
                summary: sanitizeString(markdown.slice(0, 500)) + "...",
                image_url: metadata.ogImage || metadata.image || null,
                author: sanitizedAuthor,
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

            console.log(`Added article: ${sanitizedTitle}`);
            articlesAdded++;

            // Trigger AI summarization asynchronously with service role auth
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
        error: "An error occurred while processing the request",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
