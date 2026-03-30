import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../../lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../../lib/auth';

async function getSession() {
  return getIronSession(cookies(), sessionOptions);
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ error: 'Geen actieve tenant' }, { status: 400 });

    const db = getDb();
    const result = await db.query(
      `SELECT id, name, primary_color, bg_color, logo_url FROM tenants WHERE id = $1`,
      [tenantId]
    );
    if (!result.rows[0]) return NextResponse.json({ error: 'Tenant niet gevonden' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    console.error('[tenant settings GET]', e);
    return NextResponse.json({ error: 'Serverfout' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ error: 'Geen actieve tenant' }, { status: 400 });

    const { primary_color, bg_color, logo_url } = await request.json();

    const db = getDb();
    const result = await db.query(
      `UPDATE tenants
       SET primary_color = COALESCE($1, primary_color),
           bg_color      = COALESCE($2, bg_color),
           logo_url      = $3,
           updated_at    = NOW()
       WHERE id = $4
       RETURNING id, name, primary_color, bg_color, logo_url`,
      [primary_color || null, bg_color || null, logo_url || null, tenantId]
    );
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    console.error('[tenant settings PUT]', e);
    return NextResponse.json({ error: 'Serverfout' }, { status: 500 });
  }
}
