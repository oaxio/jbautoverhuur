import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../../../lib/db';
import { requireSuperAdmin } from '../../../../../lib/admin';

export async function PATCH(request, { params }) {
  try {
    await requireSuperAdmin(cookies());
    const db = getDb();
    const { role } = await request.json();
    const validRoles = ['member', 'staff', 'tenant_admin', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Ongeldige rol' }, { status: 400 });
    }
    const result = await db.query(
      'UPDATE tenant_users SET role=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [role, params.id]
    );
    if (result.rows.length === 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireSuperAdmin(cookies());
    const db = getDb();
    const result = await db.query('DELETE FROM tenant_users WHERE id=$1 RETURNING id', [params.id]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
