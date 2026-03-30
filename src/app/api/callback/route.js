import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import * as client from 'openid-client';
import { getOidcConfig, sessionOptions } from '../../../lib/auth';

export async function GET(request) {
  const state = request.cookies.get('oidc_state')?.value;
  const codeVerifier = request.cookies.get('oidc_verifier')?.value;
  const callbackUrl = request.cookies.get('oidc_callback')?.value;

  if (!state || !codeVerifier) {
    return NextResponse.redirect(new URL('/api/login', request.url));
  }

  const config = await getOidcConfig();

  let tokens;
  try {
    tokens = await client.authorizationCodeGrant(config, new URL(request.url), {
      pkceCodeVerifier: codeVerifier,
      expectedState: state,
      redirectUri: callbackUrl,
    });
  } catch (err) {
    console.error('OIDC callback error:', err);
    return NextResponse.redirect(new URL('/api/login', request.url));
  }

  const claims = tokens.claims();

  // Write user session via cookies() — this is included in any response returned
  const session = await getIronSession(cookies(), sessionOptions);
  session.user = {
    id: claims.sub,
    email: claims.email ?? null,
    firstName: claims.first_name ?? null,
    lastName: claims.last_name ?? null,
    profileImageUrl: claims.profile_image_url ?? null,
  };
  await session.save();

  // Redirect home and clear the PKCE cookies
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set('oidc_state', '', { maxAge: 0, path: '/' });
  response.cookies.set('oidc_verifier', '', { maxAge: 0, path: '/' });
  response.cookies.set('oidc_callback', '', { maxAge: 0, path: '/' });

  return response;
}
