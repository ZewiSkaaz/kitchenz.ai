import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies: any) => {
          cookies.forEach(({ name, value, options }: any) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isPublicApi = req.nextUrl.pathname.startsWith('/api/auth') || 
                      req.nextUrl.pathname.startsWith('/api/billing/webhook');
  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');

  // Auth Guard
  if (!session && (isDashboard || (isApiRoute && !isPublicApi))) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Security Headers for Production Grade SaaS
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // CSP: Allowing self, Supabase, Google Fonts, and Microsoft Clarity
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms https://c.bing.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://*.clarity.ms https://c.bing.com;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();
  
  res.headers.set('Content-Security-Policy', cspHeader);

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
