import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { getSessionTenantId } from '../../../../lib/tenant';

// Public: customer reads their own intake form (no auth required)
export async function GET(request, { params }) {
  try {
    const db = getDb();
    const result = await db.query(
      `SELECT s.token, s.status, s.data, s.created_at,
              t.name AS tenant_name, t.primary_color AS tenant_color, t.logo_url AS tenant_logo
       FROM intake_submissions s
       LEFT JOIN tenants t ON t.id = s.tenant_id
       WHERE s.token=$1`,
      [params.token]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }

    // If requested by an authenticated staff member, verify tenant ownership
    const tenantId = await getSessionTenantId(cookies()).catch(() => null);
    if (tenantId) {
      const tenantCheck = await db.query(
        'SELECT id FROM intake_submissions WHERE token=$1 AND tenant_id=$2',
        [params.token, tenantId]
      );
      if (tenantCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Geen toegang' }, { status: 403 });
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (e) {
    console.error('[intake GET]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// Public: customer submits their data (no auth required — token is the credential)
export async function POST(request, { params }) {
  try {
    const db = getDb();
    const data = await request.json();
    const result = await db.query(
      `UPDATE intake_submissions
       SET status='submitted', data=$1
       WHERE token=$2 AND status='pending'
       RETURNING token`,
      [JSON.stringify(data), params.token]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Niet gevonden of al ingevuld' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[intake POST token]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
