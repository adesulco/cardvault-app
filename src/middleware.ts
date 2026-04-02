import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const GATE_PASSWORD = process.env.SITE_GATE_PASSWORD || 'cardvault2024';
const GATE_COOKIE_NAME = 'cardvault-gate-access';
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || record.expiresAt < now) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count += 1;
  return true;
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // ── 1. Edge Security Layer (Anti-Bot & Limiter) ──
  if (pathname.includes('/bids')) {
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

    // A. Explicit Headless/Script Blocking
    const blockedSignatures = ['headless', 'puppeteer', 'playwright', 'postmanruntime', 'curl', 'wget', 'python-requests'];
    if (blockedSignatures.some(sig => userAgent.toLowerCase().includes(sig))) {
      return NextResponse.json({ error: 'Automated script traffic rejected by Edge Firewall.' }, { status: 403 });
    }

    // B. Basic Localized IP Throttling (Vercel Lambda Isolated)
    if (!checkRateLimit(ip, 10, 10000)) { // Max 10 hits per 10 seconds
      return NextResponse.json({ error: '429 Too Many Requests (IP Blocked)' }, { status: 429 });
    }
  }

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
    // ── Global Platform Auth Wall Enforced Here ──
    const isAuth = request.cookies.has('next-auth.session-token') || request.cookies.has('__Secure-next-auth.session-token');
    const isPublic = pathname === '/' || pathname.startsWith('/auth') || pathname === '/gate';
    const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon') || pathname.startsWith('/manifest') || pathname.startsWith('/seed');

    if (!isAuth && !isPublic && !isStatic) {
       const url = request.nextUrl.clone();
       url.pathname = '/auth/login';
       url.searchParams.set('callbackUrl', request.nextUrl.pathname);
       return NextResponse.redirect(url);
    }
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
