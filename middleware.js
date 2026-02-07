import { NextResponse } from 'next/server'

export function middleware(req) {
  const userAgent = req.headers.get('user-agent') || ''
  const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram/i.test(userAgent)
  const pathname = req.nextUrl.pathname

  if (isCrawler && pathname.startsWith('/article/')) {
    const articleId = pathname.split('/article/')[1]?.split('?')[0] || ''
    const edgeUrl = `https://hqjszktwczdnyyomllzd.supabase.co/functions/v1/share-meta?id=${articleId}`
    return NextResponse.redirect(edgeUrl, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/article/:path*',
  ],
}
