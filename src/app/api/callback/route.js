import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/auth';

const TOKEN_ENDPOINT = 'https://replit.com/oidc/token';
const USERINFO_ENDPOINT = 'https://replit.com/oidc/userinfo';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');

  const storedState = request.cookies.get('oidc_state')?.value;
  const codeVerifier = request.cookies.get('oidc_verifier')?.value;
  const callbackUrl = request.cookies.get('oidc_callback')?.value;

  console.log('[callback] code:', code ? 'present' : 'MISSING');
  console.log('[callback] state match:', returnedState === storedState ? 'OK' : `MISMATCH (got ${returnedState}, expected ${storedState})`);
  console.log('[callback] codeVerifier:', codeVerifier ? 'present' : 'MISSING');
  console.log('[callback] callbackUrl:', callbackUrl);

  if (!code || !storedState || !codeVerifier || returnedState !== storedState) {
    console.log('[callback] guard failed, restarting login');
    return NextResponse.redirect(new URL('/api/login', request.url));
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
  console.log('[callback] token response status:', tokenRes.status, tokenData.error ?? 'OK');

  if (!tokenRes.ok || tokenData.error) {
    console.error('[callback] token error:', tokenData);
    return NextResponse.redirect(new URL('/api/login', request.url));
  }

  // Fetch user info
  const userRes = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userInfo = await userRes.json();
  console.log('[callback] userinfo sub:', userInfo.sub ?? 'MISSING');

  // Store session
  const session = await getIronSession(cookies(), sessionOptions);
  session.user = {
    id: userInfo.sub,
    email: userInfo.email ?? null,
    firstName: userInfo.first_name ?? null,
    lastName: userInfo.last_name ?? null,
    profileImageUrl: userInfo.profile_image_url ?? null,
  };
  await session.save();

  // Redirect home and clear PKCE cookies
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('oidc_state', '', { maxAge: 0, path: '/' });
  response.cookies.set('oidc_verifier', '', { maxAge: 0, path: '/' });
  response.cookies.set('oidc_callback', '', { maxAge: 0, path: '/' });

  return response;
}
