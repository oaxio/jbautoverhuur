import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../../../lib/db';
import { requireSuperAdmin } from '../../../../../lib/admin';

export async function GET(request, { params }) {
  try {
    await requireSuperAdmin(cookies());
    const db = getDb();
    const user = await db.query(`
      SELECT u.*,
        COALESCE(
          json_agg(json_build_object(
            'membership_id', tu.id,
            'tenant_id', t.id,
            'tenant_name', t.name,
            'role', tu.role,
            'created_at', tu.created_at
          )) FILTER (WHERE tu.id IS NOT NULL),
          '[]'
        ) AS tenants
      FROM users u
      LEFT JOIN tenant_users tu ON tu.user_id = u.id
      LEFT JOIN tenants t ON t.id = tu.tenant_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [params.id]);
    if (user.rows.length === 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    return NextResponse.json(user.rows[0]);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await requireSuperAdmin(cookies());
    const db = getDb();
    const { is_super_admin } = await request.json();

    // Prevent self-demotion
    if (session.userId === Number(params.id) && is_super_admin === false) {
      return NextResponse.json({ error: 'Je kunt jezelf niet degraderen' }, { status: 400 });
    }

    const result = await db.query(
      'UPDATE users SET is_super_admin=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [Boolean(is_super_admin), params.id]
    );
    if (result.rows.length === 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
