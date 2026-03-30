import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export async function GET() {
  const session = await getIronSession(cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!session.tenantId) {
    return NextResponse.json({ tenants: session.tenants ?? [], tenantId: null });
  }

  const db = getDb();
  const result = await db.query('SELECT id, name, slug, primary_color, logo_url, features, billing_plan FROM tenants WHERE id=$1', [session.tenantId]);
  if (result.rows.length === 0) return NextResponse.json({ error: 'Tenant niet gevonden' }, { status: 404 });
  return NextResponse.json({ tenant: result.rows[0], tenants: session.tenants ?? [] });
}

export async function POST(request) {
  const session = await getIronSession(cookies(), sessionOptions);
  if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { tenantId } = await request.json();
  const allowed = (session.tenants ?? []).map(t => t.id);
  if (!allowed.includes(Number(tenantId))) {
    return NextResponse.json({ error: 'Geen toegang tot deze tenant' }, { status: 403 });
  }

  session.tenantId = Number(tenantId);
  await session.save();
  return NextResponse.json({ ok: true });
}
