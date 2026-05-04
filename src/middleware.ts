import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protéger les routes sensibles (Pages et API)
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  const isPublicApi = req.nextUrl.pathname.startsWith('/api/auth'); // Exclure le callback auth

  if (!session && (req.nextUrl.pathname.startsWith('/dashboard') || (isApiRoute && !isPublicApi))) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
