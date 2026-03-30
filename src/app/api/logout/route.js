import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/auth';

export async function GET() {
  // Destroy the local session cookie — no need to hit Replit's OIDC end-session
  const session = await getIronSession(cookies(), sessionOptions);
  session.destroy();
  await session.save();

  const domain = process.env.REPLIT_DOMAINS?.split(',')[0]?.trim();
  const dest = domain ? `https://${domain}/` : '/';
  return NextResponse.redirect(dest);
}
