import { NextResponse } from 'next/server';
import * as client from 'openid-client';
import { getOidcConfig } from '../../../lib/auth';

export async function GET(request) {
  const config = await getOidcConfig();

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();

  // Detect the domain the user is actually visiting from via headers.
  // request.url resolves to 0.0.0.0:5000 internally, so we rely on
  // X-Forwarded-Host / Host headers set by the Replit proxy instead.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const hostHeader = request.headers.get('host');
  const allowedDomains = (process.env.REPLIT_DOMAINS ?? '').split(',').map(d => d.trim()).filter(Boolean);
  const firstDomain = allowedDomains[0];

  // Use the forwarded/host header if it matches a known Replit domain,
  // otherwise fall back to the first entry in REPLIT_DOMAINS.
  const requestHost = forwardedHost || hostHeader || '';
  const isKnownDomain = allowedDomains.includes(requestHost) ||
    requestHost.endsWith('.replit.dev') ||
    requestHost.endsWith('.replit.app');
  const domain = isKnownDomain ? requestHost : firstDomain;

  const baseUrl = domain ? `https://${domain}` : 'https://localhost:5000';
  const callbackUrl = `${baseUrl}/api/callback`;

  const authUrl = client.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl,
    scope: 'openid email profile offline_access',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  const response = NextResponse.redirect(authUrl.href);

  // Store PKCE params in plain cookies on the redirect response directly
  const cookieOpts = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 300,
  };
  response.cookies.set('oidc_state', state, cookieOpts);
  response.cookies.set('oidc_verifier', codeVerifier, cookieOpts);
  response.cookies.set('oidc_callback', callbackUrl, cookieOpts);

  return response;
}
