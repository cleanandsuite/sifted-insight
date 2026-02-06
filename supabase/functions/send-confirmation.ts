/**
 * Send Confirmation Email Edge Function
 * 
 * This function is called when a new subscriber joins.
 * It sends a verification email with a confirmation link.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SIFT_FROM_EMAIL = 'newsletter@sifted-insight.com';
const SIFT_FROM_NAME = 'Sift Daily';

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

// Generate verification link
function generateVerificationLink(token: string): string {
  const baseUrl = Deno.env.get('APP_URL') ?? 'https://sifted-insight.com';
  return `${baseUrl}/verify?token=${token}`;
}

// Generate unsubscribe link
function generateUnsubscribeLink(token: string): string {
  const baseUrl = Deno.env.get('APP_URL') ?? 'https://sifted-insight.com';
  return `${baseUrl}/unsubscribe?token=${token}`;
}

// Generate confirmation email HTML
function generateConfirmationHTML(
  verificationLink: string,
  frequency: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Confirm Your Subscription</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .email-header { background-color: #1a1a1a; padding: 24px; text-align: center; }
    .email-header .logo { font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace; font-size: 24px; font-weight: bold; color: #ffffff; text-decoration: none; }
    .email-content { padding: 32px 24px; }
    .email-footer { background-color: #f5f5f5; padding: 24px; text-align: center; border-top: 1px solid #e5e5e5; }
    .email-footer a { color: #666; text-decoration: underline; }
    .email-footer p { margin: 8px 0; font-size: 12px; color: #666; }
    .btn { display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <a href="https://sifted-insight.com" class="logo">S/</a>
    </div>
    <div class="email-content">
      <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Welcome to Sift!</h1>
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #444;">Thanks for subscribing to our ${frequency} digest. Please confirm your email address to start receiving your curated news.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verificationLink}" class="btn">Confirm Subscription</a>
      </div>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #666;">Or copy this link into your browser:</p>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; word-break: break-all; background-color: #f5f5f5; padding: 12px; border-radius: 4px;">${verificationLink}</p>
      <p style="margin: 0; font-size: 14px; color: #666;">If you didn't request this email, you can safely ignore it.</p>
    </div>
    <div class="email-footer">
      <p>You're receiving this because you signed up for Sift.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
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

  try {
    const body = await req.json();
    const { subscriberId } = body;

    if (!subscriberId) {
      return new Response(JSON.stringify({ error: 'Missing subscriberId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get subscriber details
    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .select('id, email, frequency, verification_token')
      .eq('id', subscriberId)
      .single();

    if (error || !subscriber) {
      return new Response(JSON.stringify({ error: 'Subscriber not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!subscriber.verification_token) {
      return new Response(JSON.stringify({ error: 'No verification token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const verificationLink = generateVerificationLink(subscriber.verification_token);
    const html = generateConfirmationHTML(subscriber.verification_token, subscriber.frequency || 'daily');
    const text = `
Welcome to Sift!

Please confirm your subscription by visiting:
${verificationLink}

You're signing up for ${subscriber.frequency || 'daily'} digest emails.

If you didn't request this, please ignore this email.

- The Sift Team
    `.trim();

    const result = await sendEmail(
      subscriber.email,
      'Confirm your Sift newsletter subscription',
      html,
      text
    );

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Confirmation email sent',
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: result.error,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending confirmation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: String(error),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
