import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import * as client from 'openid-client';
import { getOidcConfig, sessionOptions } from '../../../lib/auth';

export async function GET(request) {
  const cookieStore = cookies();
  const session = await getIronSession(cookieStore, sessionOptions);

  const { codeVerifier, state, callbackUrl } = session;

  if (!codeVerifier || !state) {
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

  session.user = {
    id: claims.sub,
    email: claims.email ?? null,
    firstName: claims.first_name ?? null,
    lastName: claims.last_name ?? null,
    profileImageUrl: claims.profile_image_url ?? null,
  };
  delete session.codeVerifier;
  delete session.state;
  delete session.callbackUrl;
  await session.save();

  return NextResponse.redirect(new URL('/', request.url));
}
