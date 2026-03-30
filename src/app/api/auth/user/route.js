import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../../lib/auth';

export async function GET() {
  const session = await getIronSession(cookies(), sessionOptions);

  if (!session.user) {
    return NextResponse.json(null, { status: 401 });
  }

  return NextResponse.json({
    ...session.user,
    tenantId: session.tenantId ?? null,
    tenants: session.tenants ?? [],
  });
}
