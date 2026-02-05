 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 // AI Provider configuration
 type AIProvider = 'minimax' | 'lovable';
 
 const AI_PROVIDERS: Record<AIProvider, { url: string; model: string }> = {
   minimax: {
     url: 'https://api.minimax.io/v1/chat/completions',
     model: 'MiniMax-M2.1',
   },
   lovable: {
     url: 'https://ai.gateway.lovable.dev/v1/chat/completions',
     model: 'google/gemini-3-flash-preview',
   },
 };
 
 const getAIProvider = (): { provider: AIProvider; apiKey: string } => {
   const minimaxKey = Deno.env.get("MINIMAX_API_KEY");
   if (minimaxKey) {
     return { provider: 'minimax', apiKey: minimaxKey };
   }
   
   const lovableKey = Deno.env.get("LOVABLE_API_KEY");
   if (lovableKey) {
     return { provider: 'lovable', apiKey: lovableKey };
   }
   
   throw new Error("No AI API key configured");
 };
 
 const SYSTEM_PROMPT = `You are an expert news analyst and summarizer for NOOZ.NEWS. Your job is to distill complex articles into clear, actionable insights for busy professionals who want to stay informed without reading full articles.
 
 Generate a comprehensive summary with the following structure:
 
 1. Executive Summary (2-3 sentences capturing the headline news)
 
 2. Key Points (3-5 bullet points of the most important facts, figures, and developments)
 
 3. Analysis (A thorough paragraph of 4-6 sentences that tells the complete story:
    - Include key names of people, companies, and organizations
    - Specify relevant locations, markets, or regions affected
    - Note important dates, timelines, or deadlines
    - Explain WHY this matters and what the implications are
    - Provide enough context that a reader understands the full picture
    This should read like a condensed but complete news brief.)
 
 4. Takeaways (2-3 actionable insights or things to watch for)
 
 Write in a professional, journalistic tone. Be specific with facts—use actual names, numbers, and places from the article rather than vague references.`;
 
 interface Article {
   id: string;
   title: string;
 }
 
 interface SummarizeResult {
   articleId: string;
   success: boolean;
   error?: string;
 }
 
 // Summarize a single article
 async function summarizeArticle(
   article: Article,
   supabaseUrl: string,
   serviceRoleKey: string,
   providerUrl: string,
   providerModel: string,
   apiKey: string
 ): Promise<SummarizeResult> {
   const supabase = createClient(supabaseUrl, serviceRoleKey);
   
   try {
     const content = article.title;
     if (content.length < 20) {
       return { articleId: article.id, success: false, error: "Content too short" };
     }
 
     const truncatedContent = content.slice(0, 8000);
 
     const aiResponse = await fetch(providerUrl, {
       method: "POST",
       headers: {
         Authorization: `Bearer ${apiKey}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: providerModel,
         messages: [
           { role: "system", content: SYSTEM_PROMPT },
           { role: "user", content: `Please analyze and summarize this article:\n\nTitle: ${article.title}\n\n${truncatedContent}` },
         ],
         tools: [
           {
             type: "function",
             function: {
               name: "create_summary",
               description: "Create a structured article summary",
               parameters: {
                 type: "object",
                 properties: {
                   executive_summary: { type: "string", description: "2-3 sentence executive summary" },
                   key_points: { type: "array", items: { type: "string" }, description: "3-5 key points" },
                   analysis: { type: "string", description: "4-6 sentence analysis paragraph" },
                   takeaways: { type: "array", items: { type: "string" }, description: "2-3 takeaways" },
                 },
                 required: ["executive_summary", "key_points", "analysis", "takeaways"],
                 additionalProperties: false,
               },
             },
           },
         ],
         tool_choice: { type: "function", function: { name: "create_summary" } },
       }),
     });
 
     if (!aiResponse.ok) {
       const errorText = await aiResponse.text();
       console.error(`AI error for ${article.id}:`, aiResponse.status, errorText);
       return { articleId: article.id, success: false, error: `AI error: ${aiResponse.status}` };
     }
 
     const aiData = await aiResponse.json();
     const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
     
     if (!toolCall?.function?.arguments) {
       return { articleId: article.id, success: false, error: "No summary generated" };
     }
 
     const summary = JSON.parse(toolCall.function.arguments);
 
     // Upsert summary
     const { error: summaryError } = await supabase
       .from("summaries")
       .upsert({
         article_id: article.id,
         executive_summary: summary.executive_summary,
         key_points: summary.key_points,
         analysis: summary.analysis,
         takeaways: summary.takeaways,
         model_used: providerModel,
         confidence_score: 0.85,
       }, { onConflict: "article_id" });
 
     if (summaryError) {
       return { articleId: article.id, success: false, error: summaryError.message };
     }
 
     // Update article status
     await supabase
       .from("articles")
       .update({
         status: "published",
         summary: summary.executive_summary,
         updated_at: new Date().toISOString(),
       })
       .eq("id", article.id);
 
     return { articleId: article.id, success: true };
   } catch (error) {
     console.error(`Error summarizing ${article.id}:`, error);
     return { articleId: article.id, success: false, error: String(error) };
   }
 }
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     // Authenticate
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
     const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
     const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 
     if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
       throw new Error("Supabase configuration missing");
     }
 
     // Verify user is authenticated
     const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
       global: { headers: { Authorization: authHeader } },
     });
     const { data: { user }, error: authError } = await authClient.auth.getUser();
     
     if (authError || !user) {
       return new Response(JSON.stringify({ error: "Unauthorized" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Get AI provider
     const { provider, apiKey } = getAIProvider();
     const providerConfig = AI_PROVIDERS[provider];
     
     console.log(`Batch summarization using ${provider} (${providerConfig.model})`);
 
     // Use service role for DB operations
     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
 
     // Parse request for optional limit
     let limit = 10; // Default batch size
     try {
       const body = await req.json();
       if (body.limit && typeof body.limit === "number" && body.limit > 0 && body.limit <= 50) {
         limit = body.limit;
       }
     } catch {
       // Use default limit
     }
 
     // Fetch pending articles
     const { data: articles, error: fetchError } = await supabase
       .from("articles")
       .select("id, title")
       .eq("status", "pending")
       .order("created_at", { ascending: false })
       .limit(limit);
 
     if (fetchError) {
       throw new Error(`Failed to fetch articles: ${fetchError.message}`);
     }
 
     if (!articles || articles.length === 0) {
       return new Response(
         JSON.stringify({ success: true, message: "No pending articles to process", processed: 0 }),
         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     console.log(`Processing ${articles.length} pending articles in parallel...`);
 
     // Process articles in parallel (max 5 concurrent)
     const CONCURRENCY = 5;
     const results: SummarizeResult[] = [];
     
     for (let i = 0; i < articles.length; i += CONCURRENCY) {
       const batch = articles.slice(i, i + CONCURRENCY);
       const batchResults = await Promise.all(
         batch.map((article) => summarizeArticle(
           article as Article,
           SUPABASE_URL,
           SUPABASE_SERVICE_ROLE_KEY,
           providerConfig.url,
           providerConfig.model,
           apiKey
         ))
       );
       results.push(...batchResults);
       
       // Small delay between batches to avoid rate limits
       if (i + CONCURRENCY < articles.length) {
         await new Promise((resolve) => setTimeout(resolve, 500));
       }
     }
 
     const successCount = results.filter((r) => r.success).length;
     const failedCount = results.filter((r) => !r.success).length;
 
     console.log(`Batch complete: ${successCount} succeeded, ${failedCount} failed`);
 
     return new Response(
       JSON.stringify({
         success: true,
         provider,
         model: providerConfig.model,
         processed: results.length,
         succeeded: successCount,
         failed: failedCount,
         results: results.map((r) => ({
           articleId: r.articleId,
           success: r.success,
           error: r.error,
         })),
       }),
       { headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Batch summarization error:", error);
     return new Response(
       JSON.stringify({ success: false, error: String(error) }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });