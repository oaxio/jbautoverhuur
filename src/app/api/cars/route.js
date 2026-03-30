import { NextResponse } from 'next/server';
import { getDb, initDb } from '../../../lib/db';
import { cookies } from 'next/headers';
import { getSessionTenantId } from '../../../lib/tenant';

export async function GET() {
  try {
    const tenantId = await getSessionTenantId(cookies());
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await initDb();
    const db = getDb();
    const result = await db.query(
      'SELECT * FROM cars WHERE tenant_id=$1 ORDER BY autogegevens ASC',
      [tenantId]
    );
    return NextResponse.json(result.rows);
  } catch (e) {
    console.error('[cars GET]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tenantId = await getSessionTenantId(cookies());
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await initDb();
    const db = getDb();
    const { autogegevens, kenteken, kleur, brandstof } = await request.json();
    if (!autogegevens || !kenteken) {
      return NextResponse.json({ error: 'autogegevens en kenteken zijn verplicht' }, { status: 400 });
    }
    const result = await db.query(
      'INSERT INTO cars (tenant_id, autogegevens, kenteken, kleur, brandstof) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tenantId, autogegevens, kenteken, kleur || '', brandstof || '']
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (e) {
    console.error('[cars POST]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
