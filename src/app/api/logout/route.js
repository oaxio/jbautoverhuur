import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/auth';

export async function GET(request) {
  // Destroy the local session cookie — no need to hit Replit's OIDC end-session
  const session = await getIronSession(cookies(), sessionOptions);
  session.destroy();
  await session.save();

  // Redirect back to whichever domain the user came from
  const forwardedHost = request.headers.get('x-forwarded-host');
  const hostHeader = request.headers.get('host');
  const allowedDomains = (process.env.REPLIT_DOMAINS ?? '').split(',').map(d => d.trim()).filter(Boolean);
  const firstDomain = allowedDomains[0];

  const requestHost = forwardedHost || hostHeader || '';
  const isKnownDomain = allowedDomains.includes(requestHost) ||
    requestHost.endsWith('.replit.dev') ||
    requestHost.endsWith('.replit.app');
  const domain = isKnownDomain ? requestHost : firstDomain;

  const dest = domain ? `https://${domain}/` : '/';
  return NextResponse.redirect(dest);
}
