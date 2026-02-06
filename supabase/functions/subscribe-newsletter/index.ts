import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SubscribeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SubscribeRequest = await req.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Newsletter subscription request from: ${email}`);

    // Send welcome email to subscriber
    const welcomeEmail = await resend.emails.send({
      from: "NOOZ.NEWS <johnlo@nooz.news>",
      to: [email],
      subject: "Welcome to NOOZ.NEWS Daily Digest! 🗞️",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 20px;">Welcome to NOOZ.NEWS</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Thanks for subscribing! You'll now receive our AI-curated news digest with the stories that matter—summarized and ready to read in minutes.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Stay informed without the noise.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 14px; color: #666;">
            — The NOOZ.NEWS Team
          </p>
        </div>
      `,
    });

    console.log("Welcome email sent:", welcomeEmail);

    // Notify admin of new subscriber
    const adminNotification = await resend.emails.send({
      from: "NOOZ.NEWS <johnlo@nooz.news>",
      to: ["johnlo@sevend9.com"],
      subject: `New Newsletter Subscriber: ${email}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
          <h2>New Subscriber!</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subscribed at:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log("Admin notification sent:", adminNotification);

    return new Response(
      JSON.stringify({ success: true, message: "Successfully subscribed!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Newsletter subscription error:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);