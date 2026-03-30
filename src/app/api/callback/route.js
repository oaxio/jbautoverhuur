import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/auth';

const TOKEN_ENDPOINT = 'https://replit.com/oidc/token';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');

  const storedState = request.cookies.get('oidc_state')?.value;
  const codeVerifier = request.cookies.get('oidc_verifier')?.value;
  const callbackUrl = request.cookies.get('oidc_callback')?.value;

  // Derive the public base URL from the stored callback URL or env var
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0]?.trim();
  const publicBase = domain ? `https://${domain}` : (callbackUrl ? new URL(callbackUrl).origin : null);

  if (!code || !storedState || !codeVerifier || returnedState !== storedState) {
    const loginDest = publicBase ? `${publicBase}/api/login` : '/api/login';
    return NextResponse.redirect(loginDest);
  }

  // Exchange authorization code for tokens directly
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: callbackUrl,
    client_id: process.env.REPL_ID,
    code_verifier: codeVerifier,
  });

  const tokenRes = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || tokenData.error) {
    console.error('[callback] token error:', tokenData);
    const loginDest = publicBase ? `${publicBase}/api/login` : '/api/login';
    return NextResponse.redirect(loginDest);
  }

  // Decode the ID token JWT to get user claims (we trust Replit's signed response)
  let claims = {};
  if (tokenData.id_token) {
    try {
      const payload = tokenData.id_token.split('.')[1];
      claims = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    } catch (e) {
      console.error('[callback] failed to decode id_token:', e.message);
    }
  }
  console.log('[callback] claims keys:', Object.keys(claims));

  // Store session
  const session = await getIronSession(cookies(), sessionOptions);
  session.user = {
    id: claims.sub ?? null,
    email: claims.email ?? null,
    firstName: claims.first_name ?? claims.given_name ?? null,
    lastName: claims.last_name ?? claims.family_name ?? null,
    profileImageUrl: claims.profile_image_url ?? claims.picture ?? null,
  };
  await session.save();

  // Redirect to the public home page — never use request.url here as it
  // contains the internal 0.0.0.0:5000 address, not the public domain.
  const homeDest = publicBase ? `${publicBase}/` : '/';
  const response = NextResponse.redirect(homeDest);
  response.cookies.set('oidc_state', '', { maxAge: 0, path: '/' });
  response.cookies.set('oidc_verifier', '', { maxAge: 0, path: '/' });
  response.cookies.set('oidc_callback', '', { maxAge: 0, path: '/' });

  return response;
}
