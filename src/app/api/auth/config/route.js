import { NextResponse } from 'next/server';

// Returns the correct public login URL so client-side code doesn't have to
// guess the domain (the preview iframe loads at 0.0.0.0:5000 internally).
export async function GET() {
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0]?.trim();
  const loginUrl = domain ? `https://${domain}/api/login` : '/api/login';
  return NextResponse.json({ loginUrl });
}
