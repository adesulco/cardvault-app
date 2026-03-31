import { NextResponse } from 'next/server';

const GATE_PASSWORD = process.env.SITE_GATE_PASSWORD || 'cardvault2024';
const GATE_COOKIE_NAME = 'cardvault-gate-access';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === GATE_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // Set access cookie — expires in 7 days
      response.cookies.set(GATE_COOKIE_NAME, 'granted', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
