import { NextResponse } from 'next/server';

// This endpoint redirects from wherever the app is served (e.g. 0.0.0.0:5000
// in the Replit preview) to the real public Replit domain before starting the
// OAuth flow. This ensures the PKCE cookies and the callback URL share the
// same origin.
export async function GET() {
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0]?.trim();
  const loginUrl = domain
    ? `https://${domain}/api/login`
    : '/api/login';

  return NextResponse.redirect(loginUrl);
}
