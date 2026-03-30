import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/auth';
import { resolveUserTenants } from '../../../lib/tenant';
import { syncUserOnLogin } from '../../../lib/admin';
import { getDb } from '../../../lib/db';

const TOKEN_ENDPOINT = 'https://replit.com/oidc/token';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');

  const storedState = request.cookies.get('oidc_state')?.value;
  const codeVerifier = request.cookies.get('oidc_verifier')?.value;
  const callbackUrl = request.cookies.get('oidc_callback')?.value;

  const domain = process.env.REPLIT_DOMAINS?.split(',')[0]?.trim();
  const publicBase = callbackUrl
    ? new URL(callbackUrl).origin
    : (domain ? `https://${domain}` : null);

  if (!code || !storedState || !codeVerifier || returnedState !== storedState) {
    return NextResponse.redirect(publicBase ? `${publicBase}/api/login` : '/api/login');
  }

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
    return NextResponse.redirect(publicBase ? `${publicBase}/api/login` : '/api/login');
  }

  let claims = {};
  if (tokenData.id_token) {
    try {
      const payload = tokenData.id_token.split('.')[1];
      claims = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    } catch (e) {
      console.error('[callback] id_token decode failed:', e.message);
    }
  }

  const userEmail = claims.email ?? null;
  const userSub = claims.sub ?? null;
  console.log('[callback] login — sub:', userSub, 'email:', userEmail);

  // Email whitelist check
  const allowedRaw = process.env.ALLOWED_EMAILS ?? '';
  const allowedList = allowedRaw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  if (allowedList.length > 0 && (!userEmail || !allowedList.includes(userEmail.toLowerCase()))) {
    console.log('[callback] access denied:', userEmail);
    const denyResponse = NextResponse.redirect(publicBase ? `${publicBase}/toegang-geweigerd` : '/toegang-geweigerd');
    denyResponse.cookies.set('oidc_state', '', { maxAge: 0, path: '/' });
    denyResponse.cookies.set('oidc_verifier', '', { maxAge: 0, path: '/' });
    denyResponse.cookies.set('oidc_callback', '', { maxAge: 0, path: '/' });
    return denyResponse;
  }

  // --- User provisioning: sync to local users table ---
  const db = getDb();
  let localUser = null;
  try {
    localUser = await syncUserOnLogin(db, claims);
  } catch (e) {
    console.error('[callback] user sync failed:', e.message);
  }

  // Resolve tenant memberships
  let tenants = [];
  let tenantId = null;
  try {
    tenants = await resolveUserTenants(userSub, userEmail);
    if (tenants.length === 1) tenantId = tenants[0].id;
  } catch (e) {
    console.error('[callback] tenant resolution failed:', e.message);
  }

  const session = await getIronSession(cookies(), sessionOptions);
  session.user = {
    id: userSub,
    email: userEmail,
    firstName: claims.first_name ?? claims.given_name ?? null,
    lastName: claims.last_name ?? claims.family_name ?? null,
    profileImageUrl: claims.profile_image_url ?? claims.picture ?? null,
  };
  session.userId = localUser?.id ?? null;
  session.isSuperAdmin = localUser?.is_super_admin ?? false;
  session.tenants = tenants;
  session.tenantId = tenantId;
  await session.save();

  const homeDest = publicBase
    ? (tenantId ? `${publicBase}/` : `${publicBase}/tenant-select`)
    : (tenantId ? '/' : '/tenant-select');

  const response = NextResponse.redirect(homeDest);
  response.cookies.set('oidc_state', '', { maxAge: 0, path: '/' });
  response.cookies.set('oidc_verifier', '', { maxAge: 0, path: '/' });
  response.cookies.set('oidc_callback', '', { maxAge: 0, path: '/' });
  return response;
}
