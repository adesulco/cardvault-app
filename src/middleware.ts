import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const GATE_PASSWORD = process.env.SITE_GATE_PASSWORD || 'cardvault2024';
const GATE_COOKIE_NAME = 'cardvault-gate-access';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Only gate www.cardvault.id — let beta, localhost, and vercel.app through
  const isMainDomain =
    hostname === 'www.cardvault.id' || hostname === 'cardvault.id';

  if (!isMainDomain) {
    return NextResponse.next();
  }

  // Allow the gate page itself, its API, static assets, and admin routes
  if (
    pathname === '/gate' ||
    pathname.startsWith('/api/gate') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest')
  ) {
    return NextResponse.next();
  }

  // Check if visitor has the access cookie
  const accessCookie = request.cookies.get(GATE_COOKIE_NAME);
  if (accessCookie?.value === 'granted') {
    return NextResponse.next();
  }

  // Redirect to gate page
  const gateUrl = request.nextUrl.clone();
  gateUrl.pathname = '/gate';
  gateUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(gateUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
