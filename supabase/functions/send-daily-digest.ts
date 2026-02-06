/**
 * Send Daily Digest Edge Function
 * 
 * This Edge Function is triggered daily to send newsletters to subscribers.
 * It queries the top-ranked articles and sends personalized digests.
 * 
 * Setup in Supabase Dashboard:
 * 1. Go to Edge Functions
 * 2. Create new function: send-daily-digest
 * 3. Paste this code
 * 4. Set up a cron job to trigger it daily at 8 AM
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SIFT_FROM_EMAIL = 'newsletter@sifted-insight.com';
const SIFT_FROM_NAME = 'Sift Daily';

interface Article {
  id: string;
  title: string;
  summary: string;
  original_url: string;
  published_at: string;
  source_name: string;
  key_points?: string[];
  analysis?: string;
  takeaways?: string[];
}

interface Subscriber {
  id: string;
  email: string;
  frequency: string;
  categories: string[];
}

interface DailyDigestResponse {
  success: boolean;
  message: string;
  subscribers_processed?: number;
  emails_sent?: number;
  errors?: string[];
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Resend API call
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${SIFT_FROM_NAME} <${SIFT_FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
        text,
        reply_to: 'hello@sifted-insight.com',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Resend error:', error);
    return { success: false, error: String(error) };
  }
}

// Generate unsubscribe link
function generateUnsubscribeLink(subscriberId: string): string {
  const baseUrl = Deno.env.get('APP_URL') ?? 'https://sifted-insight.com';
  return `${baseUrl}/unsubscribe?id=${subscriberId}`;
}

// Get top articles from last 24 hours
async function getTopArticles(limit: number = 10): Promise<Article[]> {
  const { data, error } = await supabase
    .rpc('get_top_articles_for_digest', {
      hours_back: 24,
      article_limit: limit,
    });

  if (error) {
    console.error('Error fetching articles:', error);
    // Fallback query
    const { data: fallback } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        summary,
        original_url,
        published_at,
        sources (name)
      `)
      .eq('status', 'published')
      .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false })
      .limit(limit);
    
    return (fallback || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      original_url: a.original_url,
      published_at: a.published_at,
      source_name: a.sources?.name || 'Unknown',
    }));
  }

  return data || [];
}

// Generate daily digest HTML
function generateDailyDigestHTML(
  articles: Article[],
  unsubscribeLink: string
): string {
  const articlesList = articles.map((article, index) => `
    <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e5e5e5;">
      <span style="display: inline-block; width: 28px; height: 28px; background-color: #1a1a1a; color: #ffffff; text-align: center; line-height: 28px; font-size: 14px; font-weight: 600; border-radius: 50%; margin-bottom: 12px;">${index + 1}</span>
      <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">
        <a href="${article.original_url}" style="color: #1a1a1a; text-decoration: none;">${article.title}</a>
      </h3>
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">${article.source_name} • ${new Date(article.published_at).toLocaleDateString()}</p>
      ${article.key_points ? `
        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #1a1a1a;"><strong>AI Summary:</strong></p>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #444;">
            ${article.key_points.map((point) => `<li style="margin-bottom: 4px;">${point}</li>`).join('')}
          </ul>
        </div>
      ` : `
        <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.5;">${article.summary || ''}</p>
      `}
      <a href="${article.original_url}" style="display: inline-block; margin-top: 12px; font-size: 14px; color: #1a1a1a; font-weight: 600;">Read full article →</a>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Sift Daily Digest</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background-color: #1a1a1a; padding: 24px; text-align: center; }
    .email-header .logo { font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace; font-size: 24px; font-weight: bold; color: #ffffff; text-decoration: none; }
    .email-content { padding: 32px 24px; }
    .email-footer { background-color: #f5f5f5; padding: 24px; text-align: center; border-top: 1px solid #e5e5e5; }
    .email-footer a { color: #666; text-decoration: underline; }
    .email-footer p { margin: 8px 0; font-size: 12px; color: #666; }
    @media (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-content { padding: 20px 16px !important; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <a href="https://sifted-insight.com" class="logo">S/</a>
    </div>
    <div class="email-content">
      <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Your Daily Digest</h1>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #666;">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • Top ${articles.length} stories</p>
      ${articlesList}
    </div>
    <div class="email-footer">
      <p>You're receiving this because you subscribed to Sift.</p>
      <p><a href="${unsubscribeLink}">Unsubscribe</a> | <a href="https://sifted-insight.com/preferences">Update Preferences</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Generate plain text version
function generateDailyDigestText(articles: Article[], unsubscribeLink: string): string {
  const list = articles.map((article, index) => `
${index + 1}. ${article.title}
   ${article.source_name} • ${new Date(article.published_at).toLocaleDateString()}
   ${article.key_points?.map((p) => `   • ${p}`).join('\n') || article.summary || ''}
   Read more: ${article.original_url}
  `).join('\n');

  return `
YOUR DAILY DIGEST
${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}

${list}

---
You're receiving this email because you subscribed to Sift.
Unsubscribe: ${unsubscribeLink}
  `.trim();
}

// Get verified subscribers
async function getVerifiedSubscribers(frequency: string): Promise<Subscriber[]> {
  const { data, error } = await supabase
    .from('subscribers')
    .select('id, email, frequency, categories')
    .eq('is_verified', true)
    .eq('frequency', frequency)
    .is('unsubscribed_at', null);

  if (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }

  return (data || []).map((sub) => ({
    id: sub.id,
    email: sub.email,
    frequency: sub.frequency,
    categories: sub.categories || [],
  }));
}

// Record email sent
async function recordEmailSent(
  subscriberId: string,
  emailType: string,
  subject: string,
  articles: Article[]
): Promise<void> {
  await supabase.from('email_history').insert({
    subscriber_id: subscriberId,
    email_type: emailType,
    subject,
    articles_included: articles.map((a) => a.id),
    status: 'sent',
    sent_at: new Date().toISOString(),
  });

  // Update subscriber metrics
  await supabase
    .from('subscribers')
    .update({
      emails_sent: supabase.raw('emails_sent + 1'),
      last_email_at: new Date().toISOString(),
    })
    .eq('id', subscriberId);
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify authorization (optional: add API key check)
  const authHeader = req.headers.get('Authorization');
  const expectedKey = Deno.env.get('EDGE_FUNCTION_API_KEY');
  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { frequency = 'daily', dryRun = false } = body;

    console.log(`Starting ${frequency} digest...`);

    // Get articles
    const articles = await getTopArticles(frequency === 'daily' ? 5 : 15);
    console.log(`Found ${articles.length} articles`);

    if (articles.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No articles to send',
        subscribers_processed: 0,
        emails_sent: 0,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get subscribers
    const subscribers = await getVerifiedSubscribers(frequency);
    console.log(`Found ${subscribers.length} subscribers`);

    let emailsSent = 0;
    const errors: string[] = [];

    // Send emails
    for (const subscriber of subscribers) {
      if (dryRun) {
        console.log(`[DRY RUN] Would send to ${subscriber.email}`);
        emailsSent++;
        continue;
      }

      const unsubscribeLink = generateUnsubscribeLink(subscriber.id);
      const html = generateDailyDigestHTML(articles, unsubscribeLink);
      const text = generateDailyDigestText(articles, unsubscribeLink);
      const subject = `Your ${frequency === 'daily' ? 'Daily' : 'Weekly'} Digest - Top ${articles.length} Stories`;

      const result = await sendEmail(subscriber.email, subject, html, text);

      if (result.success) {
        await recordEmailSent(subscriber.id, `${frequency}_digest`, subject, articles);
        emailsSent++;
      } else {
        errors.push(`${subscriber.email}: ${result.error}`);
        console.error(`Failed to send to ${subscriber.email}:`, result.error);
      }

      // Rate limiting: Resend allows 10 emails/second on free tier
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const response: DailyDigestResponse = {
      success: true,
      message: `Processed ${subscribers.length} subscribers, sent ${emailsSent} emails`,
      subscribers_processed: subscribers.length,
      emails_sent: emailsSent,
    };

    if (errors.length > 0) {
      response.errors = errors;
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending digest:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to send digest',
      error: String(error),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
