import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation schema
const requestSchema = z.object({
  articleId: z.string().uuid({ message: "Invalid article ID format" }),
  content: z.string()
    .min(200, { message: "Content must be at least 200 characters" })
    .max(100000, { message: "Content exceeds maximum length" }),
});

// Authenticate request - checks for service role or admin
const authenticateRequest = async (req: Request): Promise<{ authorized: boolean; error?: string }> => {
  const authHeader = req.headers.get('Authorization');
  
  // Check for service role key (internal calls from scrape-news)
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (authHeader === `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return { authorized: true };
  }
  
  // For external calls, require authentication
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

  // Any authenticated user can trigger summarization
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parseResult = requestSchema.safeParse(requestBody);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: parseResult.error.errors.map(e => e.message),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { articleId, content } = parseResult.data;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify article exists
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("id, status")
      .eq("id", articleId)
      .single();

    if (articleError || !article) {
      return new Response(
        JSON.stringify({ error: "Article not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating summary for article ${articleId}...`);

    // Call Lovable AI to generate structured summary (limit content to 8000 chars)
    const truncatedContent = content.slice(0, 8000);
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert news analyst and summarizer for NOOZ.NEWS. Your job is to distill complex articles into clear, actionable insights for busy professionals who want to stay informed without reading full articles.

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

Write in a professional, journalistic tone. Be specific with facts—use actual names, numbers, and places from the article rather than vague references.`,
          },
          {
            role: "user",
            content: `Please analyze and summarize this article:\n\n${truncatedContent}`,
          },
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
                  executive_summary: {
                    type: "string",
                    description: "2-3 sentence executive summary",
                  },
                  key_points: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 key points as bullet points",
                  },
                  analysis: {
                    type: "string",
                    description: "A thorough paragraph (4-6 sentences) covering who, what, where, when, and why this news matters. Include specific names, places, dates, and explain the significance.",
                  },
                  takeaways: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 actionable takeaways",
                  },
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
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("AI credits exhausted. Please add credits to continue.");
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No summary generated by AI");
    }

    const summary = JSON.parse(toolCall.function.arguments);

    console.log("Summary generated:", summary.executive_summary.slice(0, 100) + "...");

    // Insert summary
    const { error: summaryError } = await supabase
      .from("summaries")
      .upsert({
        article_id: articleId,
        executive_summary: summary.executive_summary,
        key_points: summary.key_points,
        analysis: summary.analysis,
        takeaways: summary.takeaways,
        model_used: "google/gemini-3-flash-preview",
        confidence_score: 0.85,
      }, {
        onConflict: "article_id",
      });

    if (summaryError) {
      throw new Error(`Failed to save summary: ${summaryError.message}`);
    }

    // Update article status to published
    const { error: updateError } = await supabase
      .from("articles")
      .update({
        status: "published",
        summary: summary.executive_summary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (updateError) {
      throw new Error(`Failed to update article: ${updateError.message}`);
    }

    console.log(`Article ${articleId} summarized and published`);

    return new Response(
      JSON.stringify({
        success: true,
        articleId,
        summary: {
          executive_summary: summary.executive_summary,
          key_points_count: summary.key_points.length,
          takeaways_count: summary.takeaways.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Summarization error:", error);
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
