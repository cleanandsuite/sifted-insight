import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { render } from "https://deno.land/x/resvg_wasm@0.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Truncate headline to 55 characters
function truncateHeadline(title: string, maxLength: number = 55): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength - 3) + "...";
}

// Escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Word wrap text for SVG (returns array of lines)
function wrapText(text: string, maxCharsPerLine: number = 35): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Limit to 2 lines max
  if (lines.length > 2) {
    lines[1] = lines[1].substring(0, lines[1].length - 3) + "...";
    return lines.slice(0, 2);
  }

  return lines;
}

// Generate SVG with article headline and CTA (branded gradient background)
function generateSvg(headline: string): string {
  const width = 1200;
  const height = 600;
  const headlineLines = wrapText(headline, 35);

  // Calculate headline position based on number of lines
  const headlineY = headlineLines.length === 1 ? 250 : 220;
  const lineHeight = 60;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- NOOZ branded gradient -->
    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="50%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#0f172a"/>
    </linearGradient>
    
    <!-- Accent gradient overlay -->
    <linearGradient id="accentGradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:rgba(59,130,246,0.15)"/>
      <stop offset="100%" style="stop-color:rgba(147,51,234,0.15)"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#brandGradient)"/>
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#accentGradient)"/>
  
  <!-- Decorative elements -->
  <circle cx="100" cy="100" r="300" fill="rgba(59,130,246,0.05)"/>
  <circle cx="1100" cy="500" r="250" fill="rgba(147,51,234,0.05)"/>
  
  <!-- Headline text -->
  <text 
    x="${width / 2}" 
    y="${headlineY}"
    text-anchor="middle" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="48"
    font-weight="700"
    fill="white"
    letter-spacing="-0.5"
  >
    ${headlineLines.map((line, i) => 
      `<tspan x="${width / 2}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    ).join("\n    ")}
  </text>
  
  <!-- Separator line -->
  <line 
    x1="${width / 2 - 120}" 
    y1="${headlineY + (headlineLines.length - 1) * lineHeight + 45}" 
    x2="${width / 2 + 120}" 
    y2="${headlineY + (headlineLines.length - 1) * lineHeight + 45}" 
    stroke="rgba(255,255,255,0.3)" 
    stroke-width="2"
  />
  
  <!-- CTA text -->
  <text 
    x="${width / 2}" 
    y="${headlineY + (headlineLines.length - 1) * lineHeight + 95}"
    text-anchor="middle" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="26"
    font-weight="400"
    fill="rgba(255,255,255,0.85)"
    letter-spacing="0.5"
  >
    NOOZ is the new news.
  </text>
  
  <!-- NOOZ.NEWS branding -->
  <text 
    x="${width / 2}" 
    y="${height - 50}"
    text-anchor="middle" 
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="28"
    font-weight="700"
    fill="rgba(255,255,255,0.9)"
    letter-spacing="2"
  >
    NOOZ.NEWS
  </text>
</svg>`;

  return svg;
}

Deno.serve(async (req) => {
  console.log("generate-og-image function invoked", req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const articleId = url.searchParams.get("id");

    if (!articleId) {
      return new Response("Missing article ID", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch article data
    const { data: article, error } = await supabase
      .from("articles")
      .select("id, title")
      .eq("id", articleId)
      .single();

    if (error || !article) {
      console.error("Article not found:", error);
      return new Response("Article not found", { status: 404, headers: corsHeaders });
    }

    // Truncate headline
    const headline = truncateHeadline(article.title, 55);

    // Generate SVG with branded gradient background
    const svg = generateSvg(headline);

    // Convert SVG to PNG using resvg-wasm
    const pngBuffer = await render(svg);

    console.log(`Generated OG image for article ${articleId}, size: ${pngBuffer.length} bytes`);

    // Verify under 600KB
    if (pngBuffer.length > 600 * 1024) {
      console.warn(`Image size ${pngBuffer.length} exceeds 600KB target`);
    }

    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error generating OG image:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to generate image" }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
  }
});
