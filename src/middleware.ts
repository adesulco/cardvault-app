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

function applySecurityHeaders(request: NextRequest, response: NextResponse, nonce: string) {
  const origin = request.headers.get('origin');
  response.headers.delete('Access-Control-Allow-Origin');
  if (origin && ['https://beta.cardvault.id', 'https://admin.cardvault.id'].includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  } else {
    // Prevent wildcard fallbacks natively
    const host = request.headers.get('host');
    response.headers.set(
      'Access-Control-Allow-Origin',
      host === 'admin.cardvault.id' ? 'https://admin.cardvault.id' : 'https://beta.cardvault.id'
    );
  }

  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  const isProd = process.env.NODE_ENV === 'production';
  const cspHeader = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isProd ? '' : "'unsafe-eval'"}; style-src 'self' 'nonce-${nonce}' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';`;
  response.headers.set('Content-Security-Policy', cspHeader.replace(/\s{2,}/g, ' ').trim());

  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
  }

  return response;
}

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // Helper to ensure all responses get headers
  const buildResponse = (res: NextResponse) => applySecurityHeaders(request, res, nonce);

  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // 1. Edge Security Layer
  if (pathname.includes('/bids')) {
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';

    const blockedSignatures = ['headless', 'puppeteer', 'playwright', 'postmanruntime', 'curl', 'wget', 'python-requests'];
    if (blockedSignatures.some(sig => userAgent.toLowerCase().includes(sig))) {
      return buildResponse(NextResponse.json({ error: 'Automated script traffic rejected' }, { status: 403 }));
    }

    if (!checkRateLimit(ip, 10, 10000)) {
      return buildResponse(NextResponse.json({ error: '429 Too Many Requests' }, { status: 429 }));
    }
  }

  // 2. Admin routing & Auth Filter
  const isAdminDomain = hostname === 'admin.cardvault.id';

  if (isAdminDomain) {
    let response = NextResponse.next({ request: { headers: requestHeaders } });
    
    // Check for explicit session cookie
    const hasAdminSession = request.cookies.has('admin_token');
    
    const isApi = pathname.startsWith('/api/');
    const isLogin = pathname === '/admin/login' || pathname === '/login';
    const isPublicStatic = pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/manifest');

    if (!hasAdminSession && !isLogin && !isPublicStatic) {
       if (isApi) {
          if (pathname === '/api/admin/session') {
            // Let the login POST request go through natively
          } else {
            return buildResponse(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
          }
       } else {
          const url = request.nextUrl.clone();
          url.pathname = '/admin/login';
          return buildResponse(NextResponse.redirect(url));
       }
    }

    if (pathname === '/admin/dashboard' || pathname === '/admin/dashboard/') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return buildResponse(NextResponse.redirect(url));
    }
    
    if (pathname === '/admin/promo-banners' || pathname === '/admin/promo-banners/') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/banners';
      return buildResponse(NextResponse.redirect(url));
    }

    if (
      !isApi &&
      !isPublicStatic &&
      !pathname.startsWith('/admin')
    ) {
      const url = request.nextUrl.clone();
      if (pathname === '/') {
        url.pathname = '/admin';
      } else if (pathname === '/login') {
        url.pathname = '/admin/login';
      } else {
        url.pathname = `/admin${pathname}`;
      }
      response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    }
    
    return buildResponse(response);
  }

  // 3. Password gate
  const isMainDomain = hostname === 'www.cardvault.id' || hostname === 'cardvault.id' || hostname === 'beta.cardvault.id' || hostname === 'localhost:3000';
  if (!isMainDomain) {
    return buildResponse(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  if (
    pathname === '/gate' ||
    pathname.startsWith('/api/gate') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest')
  ) {
    return buildResponse(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  const accessCookie = request.cookies.get(GATE_COOKIE_NAME);
  if (accessCookie?.value === 'granted' || process.env.NODE_ENV !== 'production') {
    const isAuth = request.cookies.has('next-auth.session-token') || request.cookies.has('__Secure-next-auth.session-token') || request.cookies.has('cv_session_token');
    const isPublic = pathname === '/' || pathname.startsWith('/auth') || pathname === '/gate';
    const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon') || pathname.startsWith('/manifest') || pathname.startsWith('/seed');

    if (!isAuth && !isPublic && !isStatic) {
       const url = request.nextUrl.clone();
       url.pathname = '/auth/login';
       url.searchParams.set('callbackUrl', request.nextUrl.pathname);
       return buildResponse(NextResponse.redirect(url));
    }
    return buildResponse(NextResponse.next({ request: { headers: requestHeaders } }));
  }

  const gateUrl = request.nextUrl.clone();
  gateUrl.pathname = '/gate';
  gateUrl.searchParams.set('next', pathname);
  return buildResponse(NextResponse.redirect(gateUrl));
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
