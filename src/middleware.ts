import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 1. Strict-Transport-Security (HSTS)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // 2. Content-Security-Policy (CSP)
  // Adapté pour Next.js, Supabase, Stripe et Microsoft Clarity (Action #4)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.clarity.ms https://*.clarity.ms;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.clarity.ms;
    frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  // 3. Autres headers de sécurité recommandés
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()')

  return response
}

export const config = {
  matcher: [
    /*
     * Applique le middleware sur toutes les routes SAUF :
     * - api (API routes)
     * - _next/static (fichiers statiques)
     * - _next/image (images optimisées)
     * - favicon.ico (favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
