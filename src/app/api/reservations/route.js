import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { cookies } from 'next/headers';
import { getSessionTenantId } from '../../../lib/tenant';

export async function GET() {
  try {
    const tenantId = await getSessionTenantId(cookies());
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const result = await db.query(`
      SELECT r.*, c.autogegevens, c.kenteken, c.kleur
      FROM reservations r
      JOIN cars c ON c.id = r.car_id AND c.tenant_id = r.tenant_id
      WHERE r.tenant_id = $1
      ORDER BY r.start_date ASC
    `, [tenantId]);
    return NextResponse.json(result.rows);
  } catch (e) {
    console.error('[reservations GET]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const tenantId = await getSessionTenantId(cookies());
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const { car_id, first_name, last_name, start_date, end_date, notes, phone, price_per_day } = await request.json();
    if (!car_id || !first_name || !last_name || !start_date || !end_date) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 });
    }
    // Verify car belongs to same tenant
    const carCheck = await db.query('SELECT id FROM cars WHERE id=$1 AND tenant_id=$2', [car_id, tenantId]);
    if (carCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Voertuig niet gevonden' }, { status: 404 });
    }
    const customer_name = `${first_name} ${last_name}`;
    const result = await db.query(
      `INSERT INTO reservations (tenant_id, car_id, customer_name, first_name, last_name, start_date, end_date, notes, phone, price_per_day)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [tenantId, car_id, customer_name, first_name, last_name, start_date, end_date, notes || '', phone || '', price_per_day || 0]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (e) {
    console.error('[reservations POST]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
