import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../../../lib/db';
import { requireSuperAdmin } from '../../../../../lib/admin';

export async function GET(request, { params }) {
  try {
    await requireSuperAdmin(cookies());
    const db = getDb();
    const result = await db.query(`
      SELECT t.*,
        json_agg(json_build_object(
          'id', tu.id, 'user_id', tu.user_id, 'user_sub', tu.user_sub,
          'user_email', tu.user_email, 'role', tu.role, 'created_at', tu.created_at,
          'name', u.name
        )) FILTER (WHERE tu.id IS NOT NULL) AS members
      FROM tenants t
      LEFT JOIN tenant_users tu ON tu.tenant_id = t.id
      LEFT JOIN users u ON u.id = tu.user_id
      WHERE t.id = $1
      GROUP BY t.id
    `, [params.id]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await requireSuperAdmin(cookies());
    const db = getDb();
    const { name, slug, status, primary_color, bg_color, bg_image_url, logo_url, custom_domain, billing_plan, features } = await request.json();

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: 'Naam en slug zijn verplicht' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const conflict = await db.query('SELECT id FROM tenants WHERE slug=$1 AND id!=$2', [cleanSlug, params.id]);
    if (conflict.rows.length > 0) return NextResponse.json({ error: 'Slug al in gebruik' }, { status: 409 });

    const result = await db.query(`
      UPDATE tenants SET name=$1, slug=$2, status=$3, primary_color=$4, bg_color=$5,
        bg_image_url=$6, logo_url=$7, custom_domain=$8, billing_plan=$9, features=$10, updated_at=NOW()
      WHERE id=$11 RETURNING *
    `, [name.trim(), cleanSlug, status || 'active', primary_color || '#e8b84b',
        bg_color || '#0a0a14', bg_image_url || null, logo_url || null, custom_domain || null,
        billing_plan || 'free', features ? JSON.stringify(features) : '{}', params.id]);

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
    const result = await db.query('DELETE FROM tenants WHERE id=$1 RETURNING id', [params.id]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
