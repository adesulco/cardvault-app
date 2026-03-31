import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const GATE_PASSWORD = process.env.SITE_GATE_PASSWORD || 'cardvault2024';
const GATE_COOKIE_NAME = 'cardvault-gate-access';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // ── Admin subdomain routing ──
  // admin.cardvault.id → rewrite to /admin routes
  const isAdminDomain = hostname === 'admin.cardvault.id';

  if (isAdminDomain) {
    // Allow API routes, static assets through
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/manifest')
    ) {
      return NextResponse.next();
    }

    // If already on /admin path, let it through
    if (pathname.startsWith('/admin')) {
      return NextResponse.next();
    }

    // Rewrite root and other paths to /admin equivalent
    const url = request.nextUrl.clone();
    if (pathname === '/') {
      url.pathname = '/admin';
    } else if (pathname === '/login') {
      url.pathname = '/admin/login';
    } else {
      url.pathname = `/admin${pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // ── Password gate for www.cardvault.id ──
  const isMainDomain =
    hostname === 'www.cardvault.id' || hostname === 'cardvault.id';

  if (!isMainDomain) {
    return NextResponse.next();
  }

  // Allow the gate page itself, its API, static assets
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
