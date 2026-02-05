 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { fetchAndParseFeed } from "./rss-parser.ts";
import { fetchOgImage } from "./feed/og-image.ts";
 import { classifyArticle, getSourceCategory } from "./classifier.ts";
 import { calculateQuotas, calculateDistribution, hasRemainingQuota, recordScrapedArticle, CategoryQuota } from "./balancer.ts";
 import { ContentCategory, MAX_ARTICLES_PER_SOURCE, MAX_CONTENT_LENGTH, BASE_ARTICLES_PER_SCRAPE } from "./config.ts";

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
   content_category: ContentCategory | null;
   sub_category: string | null;
   priority: string | null;
}

 interface ScrapeResult {
   source: string;
   category: ContentCategory | null;
   articlesFound: number;
   articlesAdded: number;
 }

 // Sanitize text for database storage
const sanitizeString = (str: string): string => {
  return str
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
     .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
};

 // Validate URL format
 const isValidUrl = (url: string): boolean => {
  try {
     new URL(url);
     return true;
  } catch {
    return false;
  }
};

 // Generate a slug from title
 const generateSlug = (title: string): string => {
   return title
     .toLowerCase()
     .replace(/[^a-z0-9]+/g, '-')
     .replace(/^-|-$/g, '')
     .slice(0, 100) + '-' + Date.now().toString(36);
 };
 
// Authenticate request - checks for admin/service role
 const authenticateRequest = async (req: Request): Promise<{ authorized: boolean; error?: string; isServiceRole?: boolean }> => {
  const authHeader = req.headers.get('Authorization');
  
  // Check for service role key (internal cron job calls)
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (authHeader === `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
     return { authorized: true, isServiceRole: true };
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

 // Get current category distribution from recent articles
 async function getCurrentDistribution(supabase: any): Promise<Map<ContentCategory, number>> {
   const distribution = new Map<ContentCategory, number>();
   
   const { data } = await supabase
     .from('articles')
     .select('content_category')
     .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
   
   if (data) {
     for (const article of data) {
       if (article.content_category) {
         const current = distribution.get(article.content_category) || 0;
         distribution.set(article.content_category, current + 1);
       }
     }
   }
   
   // Initialize missing categories
   for (const cat of ['tech', 'finance', 'politics', 'climate'] as ContentCategory[]) {
     if (!distribution.has(cat)) {
       distribution.set(cat, 0);
     }
   }
   
   return distribution;
 }
 
 // Record scrape statistics
 async function recordScrapeStats(
   supabase: any, 
   scrapedCounts: Map<ContentCategory, number>
 ): Promise<void> {
   const today = new Date().toISOString().split('T')[0];
   const total = Array.from(scrapedCounts.values()).reduce((sum, count) => sum + count, 0);
   
   for (const [category, count] of scrapedCounts) {
     const ratio = total > 0 ? count / total : 0;
     
     await supabase
       .from('scrape_statistics')
       .upsert({
         scrape_date: today,
         category,
         articles_count: count,
         ratio_achieved: ratio
       }, { onConflict: 'scrape_date,category' });
   }
 }
 
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

     // Parse request body for options
     let targetCategory: ContentCategory | 'all' = 'all';
     let maxArticles = BASE_ARTICLES_PER_SCRAPE;
    try {
      const body = await req.json();
       targetCategory = body?.category?.toLowerCase() || 'all';
       maxArticles = body?.maxArticles || BASE_ARTICLES_PER_SCRAPE;
    } catch {
      // No body or invalid JSON, use default
    }

     console.log(`Scraping category: ${targetCategory}, max articles: ${maxArticles}`);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

     // Get current category distribution
     const currentDistribution = await getCurrentDistribution(supabase);
     const distributionArray = calculateDistribution(currentDistribution);
     const { quotas, deviationAlert, recommendations } = calculateQuotas(distributionArray, maxArticles);
     
     console.log('Current distribution:', Object.fromEntries(currentDistribution));
     console.log('Quotas:', quotas.map(q => `${q.category}: ${q.quota}`).join(', '));
     if (deviationAlert) {
       console.log('Deviation alert! Recommendations:', recommendations);
     }
 
     // Get active sources with RSS URLs, ordered by priority
     const sourcesQuery = supabase
      .from("sources")
       .select("id, name, rss_url, website_url, content_category, sub_category, priority")
      .eq("is_active", true)
       .not("rss_url", "is", null)
       .order('priority', { ascending: false });

    const { data: allSources, error: sourcesError } = await sourcesQuery;

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
    }

     // Filter sources by target category if specified
    let sources = allSources;
     if (targetCategory !== 'all') {
       sources = allSources?.filter(source =>
         source.content_category === targetCategory
      ) || [];
    }

     // Sort sources by their category priority (underrepresented categories first)
     sources?.sort((a, b) => {
       const quotaA = quotas.find(q => q.category === a.content_category)?.priority || 0;
       const quotaB = quotas.find(q => q.category === b.content_category)?.priority || 0;
       return quotaB - quotaA;
     });

     console.log(`Found ${sources?.length || 0} active sources to scrape`);
 
     const results: ScrapeResult[] = [];
     const scrapedCounts = new Map<ContentCategory, number>();
     
     // Initialize scraped counts
     for (const cat of ['tech', 'finance', 'politics', 'climate'] as ContentCategory[]) {
       scrapedCounts.set(cat, 0);
     }

    for (const source of sources || []) {
      try {
         const sourceUrl = source.rss_url;
         if (!sourceUrl || !isValidUrl(sourceUrl)) {
          console.error(`Invalid source URL for ${source.name}`);
          continue;
        }
 
         // Get source category (from database or inferred)
         const sourceCategory = getSourceCategory(source.name, source.content_category as ContentCategory | undefined);
         
         // Check if this source's category still has quota
         if (sourceCategory && !hasRemainingQuota(sourceCategory, scrapedCounts, quotas)) {
           console.log(`Skipping ${source.name} - ${sourceCategory} quota reached`);
           continue;
         }

         console.log(`Scraping ${source.name} (${sourceCategory || 'unclassified'})...`);

         // Fetch and parse RSS feed
         const feed = await fetchAndParseFeed(sourceUrl);
         
         if (!feed) {
           console.error(`Failed to parse feed for ${source.name}`);
           results.push({
             source: source.name,
             category: sourceCategory,
             articlesFound: 0,
             articlesAdded: 0
           });
          continue;
        }

         console.log(`Found ${feed.items.length} items in ${source.name} feed`);

        let articlesAdded = 0;
         const itemsToProcess = feed.items.slice(0, MAX_ARTICLES_PER_SOURCE);

         for (const item of itemsToProcess) {
          try {
             // Validate article URL
             if (!item.link || !isValidUrl(item.link)) {
               continue;
             }
 
             // Validate title
             if (!item.title || item.title.length < 5 || item.title.length > 500) {
               continue;
             }
 
            // Check if article already exists
            const { data: existing } = await supabase
              .from("articles")
              .select("id")
               .eq("original_url", item.link)
              .maybeSingle();

            if (existing) {
              continue;
            }

             // Classify the article
             const classification = classifyArticle(item.title, item.description);
             const articleCategory = sourceCategory || classification.category;

             // Check quota for this article's category
             if (!hasRemainingQuota(articleCategory, scrapedCounts, quotas)) {
               console.log(`Skipping article - ${articleCategory} quota reached`);
              continue;
            }

             // Sanitize content
             const sanitizedTitle = sanitizeString(item.title);
             const sanitizedDescription = sanitizeString(item.description).slice(0, MAX_CONTENT_LENGTH);
             const sanitizedAuthor = item.author ? sanitizeString(item.author).slice(0, 255) : null;

             // Calculate read times
             const wordCount = sanitizedDescription.split(/\s+/).length;
             const originalReadTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 WPM
             const siftedReadTime = Math.max(1, Math.ceil(originalReadTime * 0.3)); // AI summary is ~30%

             // Generate slug
             const slug = generateSlug(sanitizedTitle);
             
             // Parse publication date
             let publishedAt = new Date().toISOString();
             if (item.pubDate) {
               try {
                 const parsed = new Date(item.pubDate);
                 if (!isNaN(parsed.getTime())) {
                   publishedAt = parsed.toISOString();
                 }
               } catch {
                 // Use default
               }
             }

             // Get image URL - from RSS or fetch og:image from article page
             let imageUrl = item.imageUrl;
             if (!imageUrl && item.link) {
               try {
                 imageUrl = await fetchOgImage(item.link);
                 if (imageUrl) {
                   console.log(`Fetched og:image for: ${sanitizedTitle.slice(0, 50)}...`);
                 }
               } catch {
                 // Silently fail - og:image is optional
               }
             }

            // Insert article
            const { data: newArticle, error: insertError } = await supabase
              .from("articles")
              .insert({
                title: sanitizedTitle,
                slug,
                 original_url: item.link,
                source_id: source.id,
                 summary: sanitizedDescription.slice(0, 500) + (sanitizedDescription.length > 500 ? "..." : ""),
                 image_url: imageUrl,
                author: sanitizedAuthor,
                 published_at: publishedAt,
                original_read_time: originalReadTime,
                sifted_read_time: siftedReadTime,
                 status: "pending",
                 rank_score: 0.5 + Math.random() * 0.5,
                 content_category: articleCategory,
                 category_confidence: classification.confidence,
                 topic: classification.subCategory
              })
              .select("id")
              .single();

            if (insertError) {
              console.error(`Failed to insert article: ${insertError.message}`);
              continue;
            }

            console.log(`Added article: ${sanitizedTitle}`);
            articlesAdded++;
             recordScrapedArticle(articleCategory, scrapedCounts);

             // Trigger AI summarization asynchronously
            fetch(`${SUPABASE_URL}/functions/v1/summarize-article`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                articleId: newArticle.id,
                 content: sanitizedDescription,
              }),
            }).catch((err) => console.error("Failed to trigger summarization:", err));
          } catch (articleError) {
             console.error(`Error processing article ${item.link}:`, articleError);
          }
        }

        results.push({
          source: source.name,
           category: sourceCategory,
           articlesFound: itemsToProcess.length,
          articlesAdded,
        });
      } catch (sourceError) {
        console.error(`Error scraping source ${source.name}:`, sourceError);
        results.push({
          source: source.name,
           category: source.content_category as ContentCategory | null,
          articlesFound: 0,
          articlesAdded: 0,
        });
      }
    }

     // Record scrape statistics
     await recordScrapeStats(supabase, scrapedCounts);
 
     const totalAdded = results.reduce((sum, r) => sum + r.articlesAdded, 0);
     const categoryBreakdown = Object.fromEntries(scrapedCounts);
 
    return new Response(
      JSON.stringify({
        success: true,
        results,
         totalArticlesAdded: totalAdded,
         categoryBreakdown,
         deviationAlert,
         recommendations: deviationAlert ? recommendations : [],
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
