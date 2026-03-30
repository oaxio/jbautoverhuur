import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export async function GET() {
  try {
    const db = getDb();
    const result = await db.query(`
      SELECT r.*, c.autogegevens, c.kenteken, c.kleur
      FROM reservations r
      JOIN cars c ON c.id = r.car_id
      ORDER BY r.start_date ASC
    `);
    return NextResponse.json(result.rows);
  } catch (e) {
    console.error('[reservations GET]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const { car_id, customer_name, start_date, end_date, notes, phone } = await request.json();
    if (!car_id || !customer_name || !start_date || !end_date) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 });
    }
    const result = await db.query(
      `INSERT INTO reservations (car_id, customer_name, start_date, end_date, notes, phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [car_id, customer_name, start_date, end_date, notes || '', phone || '']
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (e) {
    console.error('[reservations POST]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
