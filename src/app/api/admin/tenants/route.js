import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../../lib/db';
import { requireSuperAdmin } from '../../../../lib/admin';

export async function GET() {
  try {
    await requireSuperAdmin(cookies());
    const db = getDb();
    const result = await db.query(`
      SELECT t.*,
        (SELECT COUNT(*) FROM tenant_users tu WHERE tu.tenant_id = t.id) AS member_count
      FROM tenants t
      ORDER BY t.created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[admin tenants GET]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await requireSuperAdmin(cookies());
    const db = getDb();
    const { name, slug, status, primary_color, bg_color, logo_url, custom_domain, billing_plan, features } = await request.json();

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: 'Naam en slug zijn verplicht' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const exists = await db.query('SELECT id FROM tenants WHERE slug = $1', [cleanSlug]);
    if (exists.rows.length > 0) {
      return NextResponse.json({ error: 'Slug is al in gebruik' }, { status: 409 });
    }

    const result = await db.query(`
      INSERT INTO tenants (name, slug, status, primary_color, bg_color, logo_url, custom_domain, billing_plan, features)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      name.trim(),
      cleanSlug,
      status || 'active',
      primary_color || '#e8b84b',
      bg_color || '#0a0a14',
      logo_url || null,
      custom_domain || null,
      billing_plan || 'free',
      features ? JSON.stringify(features) : '{}',
    ]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error('[admin tenants POST]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
