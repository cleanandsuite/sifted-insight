/**
 * Resend Email Integration for Sift Newsletter
 * 
 * This module provides functions to send emails using the Resend API.
 * Resend offers a free tier of 100 emails/day.
 * 
 * Setup:
 * 1. Sign up at https://resend.com
 * 2. Get your API key from the dashboard
 * 3. Add RESEND_API_KEY to your environment variables
 */

import type { Article } from '@/hooks/useArticles';

// Resend API configuration
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com';
const SIFT_FROM_EMAIL = 'newsletter@sifted-insight.com';
const SIFT_FROM_NAME = 'Sift Daily';

// Email types
export type EmailType = 'confirmation' | 'daily_digest' | 'weekly_recap';

// Article interface for email templates
export interface EmailArticle {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  publishedAt: string;
  url: string;
  aiSummary?: {
    keyPoints: string[];
    analysis: string;
    takeaways: string[];
  };
}

/**
 * Send an email using Resend API
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const response = await fetch(`${RESEND_API_URL}/emails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${SIFT_FROM_NAME} <${SIFT_FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        reply_to: replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return {
        success: false,
        error: data.message || 'Failed to send email',
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Resend send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate email unsubscribe link
 */
export function generateUnsubscribeLink(unsubscribeToken: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}/unsubscribe?token=${unsubscribeToken}`;
}

/**
 * Generate verification link
 */
export function generateVerificationLink(verificationToken: string): string {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}/verify?token=${verificationToken}`;
}

/**
 * Send confirmation email
 */
export async function sendConfirmationEmail({
  email,
  verificationToken,
  frequency,
}: {
  email: string;
  verificationToken: string;
  frequency: 'daily' | 'weekly';
}): Promise<{ success: boolean; error?: string }> {
  const verificationLink = generateVerificationLink(verificationToken);
  
  const html = generateConfirmationEmailHTML({
    verificationLink,
    frequency,
  });

  return sendEmail({
    to: email,
    subject: 'Confirm your Sift newsletter subscription',
    html,
    text: `
Welcome to Sift!

Please confirm your subscription by visiting:
${verificationLink}

You're signing up for ${frequency} digest emails.

If you didn't request this, please ignore this email.

- The Sift Team
    `.trim(),
  });
}

/**
 * Send daily digest email
 */
export async function sendDailyDigestEmail({
  email,
  articles,
  unsubscribeToken,
}: {
  email: string;
  articles: EmailArticle[];
  unsubscribeToken: string;
}): Promise<{ success: boolean; error?: string }> {
  const unsubscribeLink = generateUnsubscribeLink(unsubscribeToken);
  
  const html = generateDailyDigestEmailHTML({
    articles,
    unsubscribeLink,
  });

  return sendEmail({
    to: email,
    subject: `Your Daily Digest - Top ${articles.length} Stories`,
    html,
    text: generateDailyDigestText({
      articles,
      unsubscribeLink,
    }),
    replyTo: 'hello@sifted-insight.com',
  });
}

/**
 * Send weekly recap email
 */
export async function sendWeeklyRecapEmail({
  email,
  articles,
  unsubscribeToken,
}: {
  email: string;
  articles: EmailArticle[];
  unsubscribeToken: string;
}): Promise<{ success: boolean; error?: string }> {
  const unsubscribeLink = generateUnsubscribeLink(unsubscribeToken);
  
  const html = generateWeeklyRecapEmailHTML({
    articles,
    unsubscribeLink,
  });

  return sendEmail({
    to: email,
    subject: `Your Weekly Recap - Top ${articles.length} Stories`,
    html,
    text: generateWeeklyRecapText({
      articles,
      unsubscribeLink,
    }),
    replyTo: 'hello@sifted-insight.com',
  });
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

interface EmailTemplateParams {
  verificationLink?: string;
  unsubscribeLink?: string;
  articles?: EmailArticle[];
  frequency?: 'daily' | 'weekly';
}

/**
 * Generate base email template
 */
function generateBaseEmail({
  children,
  preheader,
}: {
  children: string;
  preheader?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Sift Newsletter</title>
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background-color: #1a1a1a; padding: 24px; text-align: center; }
    .email-header .logo { font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace; font-size: 24px; font-weight: bold; color: #ffffff; text-decoration: none; }
    .email-content { padding: 32px 24px; }
    .email-footer { background-color: #f5f5f5; padding: 24px; text-align: center; border-top: 1px solid #e5e5e5; }
    .email-footer a { color: #666; text-decoration: underline; }
    .email-footer p { margin: 8px 0; font-size: 12px; color: #666; }
    .preheader { display: none; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; }
    @media (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-content { padding: 20px 16px !important; }
    }
  </style>
</head>
<body>
  <span class="preheader">${preheader || 'Sift Newsletter'}</span>
  <div class="email-container">
    <div class="email-header">
      <a href="https://sifted-insight.com" class="logo">S/</a>
    </div>
    <div class="email-content">
      ${children}
    </div>
    <div class="email-footer">
      <p>You're receiving this because you subscribed to Sift.</p>
      <p><a href="{{unsubscribeLink}}">Unsubscribe</a> | <a href="{{preferencesLink}}">Update Preferences</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Confirmation email HTML template
 */
function generateConfirmationEmailHTML({
  verificationLink,
  frequency,
}: EmailTemplateParams): string {
  const children = `
    <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Welcome to Sift!</h1>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #444;">Thanks for subscribing to our ${frequency} digest. Please confirm your email address to start receiving your curated news.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationLink}" style="display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">Confirm Subscription</a>
    </div>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #666;">Or copy this link into your browser:</p>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; word-break: break-all; background-color: #f5f5f5; padding: 12px; border-radius: 4px;">${verificationLink}</p>
    <p style="margin: 0; font-size: 14px; color: #666;">If you didn't request this email, you can safely ignore it.</p>
  `.trim();

  return generateBaseEmail({
    children,
    preheader: `Confirm your ${frequency} subscription to Sift`,
  }).replace(/\{\{unsubscribeLink\}\}/g, '#').replace(/\{\{preferencesLink\}\}/g, '#');
}

/**
 * Daily digest email HTML template
 */
function generateDailyDigestEmailHTML({
  articles,
  unsubscribeLink,
}: EmailTemplateParams): string {
  const articlesList = articles?.map((article, index) => `
    <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #e5e5e5;">
      <span style="display: inline-block; width: 28px; height: 28px; background-color: #1a1a1a; color: #ffffff; text-align: center; line-height: 28px; font-size: 14px; font-weight: 600; border-radius: 50%; margin-bottom: 12px;">${index + 1}</span>
      <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;"><a href="${article.url}" style="color: #1a1a1a; text-decoration: none;">${article.title}</a></h3>
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #666;">${article.sourceName} • ${formatDate(article.publishedAt)}</p>
      ${article.aiSummary ? `
        <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #1a1a1a;"><strong>AI Summary:</strong></p>
          <ul style="margin: 0 0 12px 0; padding-left: 20px; font-size: 14px; color: #444;">
            ${article.aiSummary.keyPoints.map((point: string) => `<li style="margin-bottom: 4px;">${point}</li>`).join('')}
          </ul>
        </div>
      ` : `
        <p style="margin: 0; font-size: 14px; color: #444; line-height: 1.5;">${article.summary}</p>
      `}
      <a href="${article.url}" style="display: inline-block; margin-top: 12px; font-size: 14px; color: #1a1a1a; font-weight: 600;">Read full article →</a>
    </div>
  `).join('') || '';

  const children = `
    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Your Daily Digest</h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #666;">${formatDate(new Date())} • Top ${articles?.length || 0} stories</p>
    ${articlesList}
  `.trim();

  return generateBaseEmail({
    children,
    preheader: `Top ${articles?.length || 0} stories for today`,
  }).replace(/\{\{unsubscribeLink\}\}/g, unsubscribeLink || '#');
}

/**
 * Weekly recap email HTML template
 */
function generateWeeklyRecapEmailHTML({
  articles,
  unsubscribeLink,
}: EmailTemplateParams): string {
  const articlesList = articles?.map((article, index) => `
    <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e5e5;">
      <span style="display: inline-block; width: 24px; height: 24px; background-color: #1a1a1a; color: #ffffff; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; border-radius: 50%; margin-bottom: 8px; margin-right: 8px;">${index + 1}</span>
      <h3 style="display: inline; margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;"><a href="${article.url}" style="color: #1a1a1a; text-decoration: none;">${article.title}</a></h3>
      <p style="margin: 4px 0 0 32px; font-size: 12px; color: #666;">${article.sourceName} • ${formatDate(article.publishedAt)}</p>
    </div>
  `).join('') || '';

  const children = `
    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Your Weekly Recap</h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #666;">This week on Sift • Top ${articles?.length || 0} stories</p>
    ${articlesList}
  `.trim();

  return generateBaseEmail({
    children,
    preheader: `Top ${articles?.length || 0} stories from this week`,
  }).replace(/\{\{unsubscribeLink\}\}/g, unsubscribeLink || '#');
}

/**
 * Daily digest text version
 */
function generateDailyDigestText({
  articles,
  unsubscribeLink,
}: EmailTemplateParams): string {
  const list = articles?.map((article, index) => `
${index + 1}. ${article.title}
   ${article.sourceName} • ${formatDate(article.publishedAt)}
   ${article.aiSummary?.keyPoints.map((p: string) => `   • ${p}`).join('\n') || article.summary}
   Read more: ${article.url}
  `).join('\n\n') || '';

  return `
YOUR DAILY DIGEST
${formatDate(new Date())}

${list}

---
You're receiving this email because you subscribed to Sift.
Unsubscribe: ${unsubscribeLink}
  `.trim();
}

/**
 * Weekly recap text version
 */
function generateWeeklyRecapText({
  articles,
  unsubscribeLink,
}: EmailTemplateParams): string {
  const list = articles?.map((article, index) => `
${index + 1}. ${article.title}
   ${article.sourceName}
  `).join('\n') || '';

  return `
YOUR WEEKLY RECAP
Top ${articles?.length || 0} stories from this week

${list}

---
You're receiving this email because you subscribed to Sift.
Unsubscribe: ${unsubscribeLink}
  `.trim();
}

/**
 * Format date for email display
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
