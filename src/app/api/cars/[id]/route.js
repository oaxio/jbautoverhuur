import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { getSessionTenantId } from '../../../../lib/tenant';

export async function PUT(request, { params }) {
  try {
    const tenantId = await getSessionTenantId(cookies());
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const { autogegevens, kenteken, kleur, brandstof } = await request.json();
    const result = await db.query(
      'UPDATE cars SET autogegevens=$1, kenteken=$2, kleur=$3, brandstof=$4 WHERE id=$5 AND tenant_id=$6 RETURNING *',
      [autogegevens, kenteken, kleur || '', brandstof || '', params.id, tenantId]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    console.error('[cars PUT]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const tenantId = await getSessionTenantId(cookies());
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const result = await db.query('DELETE FROM cars WHERE id=$1 AND tenant_id=$2 RETURNING id', [params.id, tenantId]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[cars DELETE]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
