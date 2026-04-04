export async function GET() {
  return Response.json({
    status: 'healthy',
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
