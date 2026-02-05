 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
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
 
     // Forward to johnlo@sevend9.com
     // In production, you would integrate with an email service like Resend, SendGrid, etc.
     // For now, we'll log the subscription and return success
     console.log(`Newsletter subscription: ${email} -> forwarding to johnlo@sevend9.com`);
     
     // Store subscription info (could be expanded to use a database table)
     const subscriptionData = {
       email,
       subscribedAt: new Date().toISOString(),
       forwardTo: "johnlo@sevend9.com",
     };
     
     console.log("Subscription data:", JSON.stringify(subscriptionData));
 
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