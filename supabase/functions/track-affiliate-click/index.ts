// NOOZ Affiliate Click Tracker
// Edge Function: Track clicks and redirect to affiliate URL

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AffiliateRequest {
  product_slug: string
  source?: string
  article_id?: number
}

serve(async (req: Request) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { product_slug, source = 'direct', article_id }: AffiliateRequest = await req.json()

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get product and program info
    const { data: product, error } = await supabase
      .from('affiliate_products')
      .select(`
        id,
        name,
        affiliate_url,
        program:affiliate_programs(name)
      `)
      .eq('slug', product_slug)
      .eq('is_active', true)
      .single()

    if (error || !product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Track the click
    const { error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert({
        product_id: product.id,
        article_id: article_id || null,
        source: source,
        referrer: req.headers.get('referer'),
        user_agent: req.headers.get('user-agent'),
        ip_hash: await hashIP(req.headers.get('x-forwarded-for') || 'unknown')
      })

    if (clickError) {
      console.error('Click tracking error:', clickError)
    }

    // Increment product clicks
    await supabase
      .rpc('increment_product_clicks', { product_slug })

    // Return redirect URL
    return new Response(JSON.stringify({
      success: true,
      redirect_url: product.affiliate_url,
      product_name: product.name
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Affiliate error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

// Simple IP hashing for privacy
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + Deno.env.get('SALT') || 'nooz-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
}
