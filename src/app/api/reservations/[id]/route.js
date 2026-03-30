import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const db = getDb();
    const { car_id, first_name, last_name, start_date, end_date, notes, phone, price_per_day } = await request.json();
    const customer_name = `${first_name} ${last_name}`;
    const result = await db.query(
      `UPDATE reservations SET car_id=$1, customer_name=$2, first_name=$3, last_name=$4, start_date=$5, end_date=$6, notes=$7, phone=$8, price_per_day=$9
       WHERE id=$10 RETURNING *`,
      [car_id, customer_name, first_name, last_name, start_date, end_date, notes || '', phone || '', price_per_day || 0, params.id]
    );
    if (result.rows.length === 0) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    console.error('[reservations PUT]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const db = getDb();
    await db.query('DELETE FROM reservations WHERE id=$1', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[reservations DELETE]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
