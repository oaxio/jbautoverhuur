import { NextResponse } from 'next/server';
import * as client from 'openid-client';
import { getOidcConfig } from '../../../lib/auth';

export async function GET(request) {
  const config = await getOidcConfig();

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();

  const domain = process.env.REPLIT_DOMAINS?.split(',')[0]?.trim();
  const baseUrl = domain ? `https://${domain}` : new URL(request.url).origin;
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
