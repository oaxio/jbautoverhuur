import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import * as client from 'openid-client';
import { getOidcConfig, sessionOptions } from '../../../lib/auth';

export async function GET(request) {
  const config = await getOidcConfig();

  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();

  const origin = new URL(request.url).origin;
  const callbackUrl = `${origin}/api/callback`;

  const authUrl = client.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl,
    scope: 'openid email profile offline_access',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  const session = await getIronSession(cookies(), sessionOptions);
  session.codeVerifier = codeVerifier;
  session.state = state;
  session.callbackUrl = callbackUrl;
  await session.save();

  return NextResponse.redirect(authUrl.href);
}
