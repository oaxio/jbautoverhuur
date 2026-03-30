import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const db = getDb();
    const { autogegevens, kenteken, kleur, brandstof } = await request.json();
    const result = await db.query(
      'UPDATE cars SET autogegevens=$1, kenteken=$2, kleur=$3, brandstof=$4 WHERE id=$5 RETURNING *',
      [autogegevens, kenteken, kleur || '', brandstof || '', params.id]
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
    const db = getDb();
    await db.query('DELETE FROM cars WHERE id=$1', [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[cars DELETE]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
