import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Touch critical paths to keep functions warm across Vercel regional edges
    await fetch('https://beta.cardvault.id/', { method: 'HEAD' });
    
    return NextResponse.json({ 
      warmed: true, 
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
