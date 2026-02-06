import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const articleId = url.searchParams.get("id");

    if (!articleId) {
      return new Response("Missing article ID", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch article data
    const { data: article, error } = await supabase
      .from("articles")
      .select(`
        id,
        title,
        summary,
        image_url,
        media_url,
        author,
        published_at,
        topic,
        tags,
        sources:source_id (name)
      `)
      .eq("id", articleId)
      .single();

    if (error || !article) {
      console.error("Article not found:", error);
      return new Response("Article not found", { status: 404 });
    }

    // Determine the best image to use
    const imageUrl = article.media_url || article.image_url || "https://sifted-insight.lovable.app/og-image.png";
    const siteName = "NOOZ•NEWS";
    const siteUrl = "https://sifted-insight.lovable.app";
    const articleUrl = `${siteUrl}/article/${article.id}`;
    const description = article.summary || `Read the latest on ${article.topic || 'trending news'} from ${siteName}`;
    const authorName = article.author || "NOOZ•NEWS Staff";
    const sourceName = article.sources?.name || siteName;
    const publishedDate = article.published_at ? new Date(article.published_at).toISOString() : new Date().toISOString();
    const tags = article.tags?.join(", ") || article.topic || "news";

    // Generate HTML with comprehensive OG tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${escapeHtml(article.title)} | ${siteName}</title>
  <meta name="title" content="${escapeHtml(article.title)} | ${siteName}">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="${escapeHtml(authorName)}">
  <meta name="keywords" content="${escapeHtml(tags)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${articleUrl}">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${siteName}">
  <meta property="article:published_time" content="${publishedDate}">
  <meta property="article:author" content="${escapeHtml(authorName)}">
  <meta property="article:section" content="${escapeHtml(article.topic || 'News')}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${articleUrl}">
  <meta name="twitter:title" content="${escapeHtml(article.title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:site" content="@noozdotnews">
  
  <!-- Canonical -->
  <link rel="canonical" href="${articleUrl}">
  
  <!-- Redirect to actual article -->
  <meta http-equiv="refresh" content="0;url=${articleUrl}">
  <script>window.location.href = "${articleUrl}";</script>
</head>
<body>
  <p>Redirecting to <a href="${articleUrl}">${escapeHtml(article.title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error generating share meta:", error);
    return new Response("Internal server error", { status: 500 });
  }
});

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
