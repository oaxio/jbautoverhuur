import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const db = getDb();
    const { car_id, customer_name, start_date, end_date, notes } = await request.json();
    const result = await db.query(
      `UPDATE reservations SET car_id=$1, customer_name=$2, start_date=$3, end_date=$4, notes=$5
       WHERE id=$6 RETURNING *`,
      [car_id, customer_name, start_date, end_date, notes || '', params.id]
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
