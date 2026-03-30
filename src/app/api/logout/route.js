import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { getOidcConfig, sessionOptions } from '../../../lib/auth';
import * as client from 'openid-client';

export async function GET(request) {
  const session = await getIronSession(cookies(), sessionOptions);
  session.destroy();
  await session.save();

  try {
    const config = await getOidcConfig();
    const logoutUrl = client.buildEndSessionUrl(config, {
      client_id: process.env.REPL_ID,
      post_logout_redirect_uri: new URL('/', request.url).href,
    });
    return NextResponse.redirect(logoutUrl.href);
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
