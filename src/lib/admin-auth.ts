import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'cardvault-admin-secret-key-2024'
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
