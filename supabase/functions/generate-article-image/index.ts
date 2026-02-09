import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { render } from "https://deno.land/x/resvg_wasm@0.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ContentCategory = 'tech' | 'finance' | 'politics' | 'climate' | 'video_games';

// Category-specific color schemes
const CATEGORY_STYLES: Record<ContentCategory, { primary: string; secondary: string; accent: string; icon: string }> = {
  tech: {
    primary: '#0f172a',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    icon: '⚡',
  },
  video_games: {
    primary: '#1a1625',
    secondary: '#f59e0b',
    accent: '#fbbf24',
    icon: '🎮',
  },
  finance: {
    primary: '#0d1f17',
    secondary: '#10b981',
    accent: '#34d399',
    icon: '📈',
  },
  politics: {
    primary: '#1a1628',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
    icon: '🏛️',
  },
  climate: {
    primary: '#0f1f1a',
    secondary: '#22c55e',
    accent: '#4ade80',
    icon: '🌍',
  },
};

// Escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Word wrap text for SVG
function wrapText(text: string, maxCharsPerLine: number = 28): string[] {
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

  // Limit to 3 lines max
  if (lines.length > 3) {
    lines[2] = lines[2].substring(0, Math.max(0, lines[2].length - 3)) + "...";
    return lines.slice(0, 3);
  }

  return lines;
}

// Generate infographic-style SVG
function generateInfoGraphicSvg(
  headline: string,
  category: ContentCategory,
  topic?: string,
  keyPoints?: string[]
): string {
  const width = 800;
  const height = 500;
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.tech;
  const headlineLines = wrapText(headline, 28);
  const lineHeight = 42;
  const startY = 140;

  // Generate abstract data visualization elements
  const dataVizElements = generateDataVizElements(style.secondary, style.accent);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${style.primary}"/>
      <stop offset="100%" style="stop-color:#000"/>
    </linearGradient>
    
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${style.secondary}"/>
      <stop offset="100%" style="stop-color:${style.accent}"/>
    </linearGradient>
    
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#bgGradient)"/>
  
  <!-- Abstract data visualization elements -->
  ${dataVizElements}
  
  <!-- Category badge -->
  <rect x="40" y="40" width="120" height="36" rx="4" fill="${style.secondary}" opacity="0.2"/>
  <rect x="40" y="40" width="120" height="36" rx="4" fill="none" stroke="${style.secondary}" stroke-width="1"/>
  <text x="100" y="64" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="${style.accent}">
    ${escapeXml((topic || category).toUpperCase())}
  </text>
  
  <!-- Headline text -->
  <text 
    x="40" 
    y="${startY}"
    font-family="system-ui, -apple-system, sans-serif"
    font-size="36"
    font-weight="700"
    fill="white"
    letter-spacing="-0.5"
  >
    ${headlineLines.map((line, i) => 
      `<tspan x="40" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
    ).join("\n    ")}
  </text>
  
  <!-- Key points indicators (if available) -->
  ${generateKeyPointsIndicators(keyPoints, startY + headlineLines.length * lineHeight + 30, style)}
  
  <!-- NOOZ.NEWS branding -->
  <text 
    x="40" 
    y="${height - 35}"
    font-family="system-ui, sans-serif"
    font-size="16"
    font-weight="600"
    fill="rgba(255,255,255,0.6)"
    letter-spacing="1"
  >
    NOOZ.NEWS
  </text>
  
  <!-- Category icon -->
  <text 
    x="${width - 60}" 
    y="70"
    font-size="40"
    text-anchor="middle"
  >
    ${style.icon}
  </text>
</svg>`;

  return svg;
}

// Generate abstract data visualization elements
function generateDataVizElements(primary: string, secondary: string): string {
  const elements: string[] = [];
  
  // Decorative circles
  elements.push(`<circle cx="700" cy="400" r="180" fill="${primary}" opacity="0.1"/>`);
  elements.push(`<circle cx="750" cy="350" r="100" fill="${secondary}" opacity="0.08"/>`);
  
  // Abstract line chart
  const chartY = 320;
  const points = [
    [500, chartY + 40],
    [540, chartY + 20],
    [580, chartY + 35],
    [620, chartY + 10],
    [660, chartY + 25],
    [700, chartY - 5],
    [740, chartY + 15],
  ];
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  elements.push(`<path d="${pathD}" fill="none" stroke="${primary}" stroke-width="3" opacity="0.4" stroke-linecap="round"/>`);
  
  // Bar chart visualization
  const barX = 520;
  const bars = [
    { height: 60, opacity: 0.3 },
    { height: 85, opacity: 0.4 },
    { height: 45, opacity: 0.25 },
    { height: 70, opacity: 0.35 },
    { height: 95, opacity: 0.45 },
  ];
  bars.forEach((bar, i) => {
    elements.push(`<rect x="${barX + i * 45}" y="${420 - bar.height}" width="30" height="${bar.height}" fill="${secondary}" opacity="${bar.opacity}" rx="2"/>`);
  });
  
  // Decorative dots
  for (let i = 0; i < 5; i++) {
    const x = 600 + Math.random() * 150;
    const y = 100 + Math.random() * 100;
    const size = 4 + Math.random() * 6;
    elements.push(`<circle cx="${x}" cy="${y}" r="${size}" fill="${secondary}" opacity="${0.1 + Math.random() * 0.2}"/>`);
  }
  
  return elements.join('\n  ');
}

// Generate key points indicators
function generateKeyPointsIndicators(keyPoints: string[] | undefined, y: number, style: { secondary: string; accent: string }): string {
  if (!keyPoints || keyPoints.length === 0) return '';
  
  const indicators: string[] = [];
  const count = Math.min(keyPoints.length, 4);
  
  for (let i = 0; i < count; i++) {
    indicators.push(`
      <circle cx="${60 + i * 20}" cy="${y + 10}" r="5" fill="${style.secondary}" opacity="0.6"/>
    `);
  }
  
  indicators.push(`
    <text x="${60 + count * 20 + 10}" y="${y + 15}" font-family="system-ui, sans-serif" font-size="13" fill="${style.accent}" opacity="0.8">
      ${count} key insights
    </text>
  `);
  
  return indicators.join('');
}

Deno.serve(async (req) => {
  console.log("generate-article-image function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const articleId = url.searchParams.get("id");

    if (!articleId) {
      return new Response(JSON.stringify({ error: "Missing article ID" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch article data with summary
    const { data: article, error: articleError } = await supabase
      .from("articles")
      .select("id, title, topic, content_category")
      .eq("id", articleId)
      .single();

    if (articleError || !article) {
      console.error("Article not found:", articleError);
      return new Response(JSON.stringify({ error: "Article not found" }), { 
        status: 404, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Try to get key points from summary
    let keyPoints: string[] | undefined;
    const { data: summary } = await supabase
      .from("summaries")
      .select("key_points")
      .eq("article_id", articleId)
      .single();
    
    if (summary?.key_points && Array.isArray(summary.key_points)) {
      keyPoints = summary.key_points as string[];
    }

    const category = (article.content_category as ContentCategory) || 'tech';

    // Generate infographic SVG
    const svg = generateInfoGraphicSvg(
      article.title,
      category,
      article.topic || undefined,
      keyPoints
    );

    // Convert SVG to PNG
    const pngBuffer = await render(svg);

    console.log(`Generated article image for ${articleId}, size: ${pngBuffer.length} bytes`);

    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800", // 7 days
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error generating article image:", error);
    
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
