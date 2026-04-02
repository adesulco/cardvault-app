import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const adminSecret = process.env.ADMIN_JWT_SECRET;
if (!adminSecret && process.env.NODE_ENV === 'production') {
  console.warn('CRITICAL: ADMIN_JWT_SECRET is not set in production!');
}

const SECRET = new TextEncoder().encode(
  adminSecret || 'development-fallback-only-secret-2024'
);

export async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, SECRET);

    if (!payload.isAdmin) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function requireAdminAuth(request: NextRequest) {
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return NextResponse.json(
      { error: 'Unauthorized - admin access required' },
      { status: 401 }
    );
  }
  return null;
}
