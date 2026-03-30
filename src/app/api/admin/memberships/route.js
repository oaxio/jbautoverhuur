import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../../lib/db';
import { requireSuperAdmin } from '../../../../lib/admin';

export async function GET() {
  try {
    await requireSuperAdmin(cookies());
    const db = getDb();
    const result = await db.query(`
      SELECT tu.*, t.name AS tenant_name, t.slug AS tenant_slug,
             u.name AS user_name, u.email AS user_email_resolved, u.profile_image_url
      FROM tenant_users tu
      JOIN tenants t ON t.id = tu.tenant_id
      LEFT JOIN users u ON u.id = tu.user_id
      ORDER BY tu.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await requireSuperAdmin(cookies());
    const db = getDb();
    const { user_id, tenant_id, role } = await request.json();

    if (!user_id || !tenant_id) {
      return NextResponse.json({ error: 'user_id en tenant_id zijn verplicht' }, { status: 400 });
    }

    const validRoles = ['member', 'staff', 'tenant_admin', 'viewer'];
    const safeRole = validRoles.includes(role) ? role : 'member';

    // Fetch user details for user_sub/email backfill
    const userRow = await db.query('SELECT replit_sub, email FROM users WHERE id=$1', [user_id]);
    if (userRow.rows.length === 0) return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    const { replit_sub, email } = userRow.rows[0];

    const tenantRow = await db.query('SELECT id FROM tenants WHERE id=$1', [tenant_id]);
    if (tenantRow.rows.length === 0) return NextResponse.json({ error: 'Tenant niet gevonden' }, { status: 404 });

    const result = await db.query(`
      INSERT INTO tenant_users (tenant_id, user_id, user_sub, user_email, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (tenant_id, user_sub) DO UPDATE SET role=$5, user_id=$2, updated_at=NOW()
      RETURNING *
    `, [tenant_id, user_id, replit_sub, email, safeRole]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[admin memberships POST]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
