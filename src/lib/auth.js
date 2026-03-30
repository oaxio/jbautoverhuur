import * as client from 'openid-client';

export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'jb-autoverhuur-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
};

let _oidcConfig = null;

export async function getOidcConfig() {
  if (!_oidcConfig) {
    _oidcConfig = await client.discovery(
      new URL('https://replit.com/oidc'),
      process.env.REPL_ID
    );
  }
  return _oidcConfig;
}
