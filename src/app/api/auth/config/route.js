import { NextResponse } from 'next/server';

// Returns the correct public login URL so client-side code doesn't have to
// guess the domain (the preview iframe loads at 0.0.0.0:5000 internally).
export async function GET(request) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const hostHeader = request.headers.get('host');
  const allowedDomains = (process.env.REPLIT_DOMAINS ?? '').split(',').map(d => d.trim()).filter(Boolean);
  const firstDomain = allowedDomains[0];

  const requestHost = forwardedHost || hostHeader || '';
  const isKnownDomain = allowedDomains.includes(requestHost) ||
    requestHost.endsWith('.replit.dev') ||
    requestHost.endsWith('.replit.app');
  const domain = isKnownDomain ? requestHost : firstDomain;

  const loginUrl = domain ? `https://${domain}/api/login` : '/api/login';
  return NextResponse.json({ loginUrl });
}
