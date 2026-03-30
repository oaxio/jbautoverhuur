import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../../lib/db';
import { requireSuperAdmin } from '../../../../lib/admin';

export async function GET() {
  try {
    await requireSuperAdmin(cookies());
    const db = getDb();
    const result = await db.query(`
      SELECT
        u.*,
        COALESCE(
          json_agg(json_build_object(
            'membership_id', tu.id,
            'tenant_id', t.id,
            'tenant_name', t.name,
            'tenant_slug', t.slug,
            'role', tu.role
          )) FILTER (WHERE tu.id IS NOT NULL),
          '[]'
        ) AS tenants
      FROM users u
      LEFT JOIN tenant_users tu ON tu.user_id = u.id
      LEFT JOIN tenants t ON t.id = tu.tenant_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[admin users GET]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
