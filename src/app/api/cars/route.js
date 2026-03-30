import { NextResponse } from 'next/server';
import { getDb, initDb } from '../../../lib/db';

export async function GET() {
  try {
    await initDb();
    const db = getDb();
    const result = await db.query('SELECT * FROM cars ORDER BY autogegevens ASC');
    return NextResponse.json(result.rows);
  } catch (e) {
    console.error('[cars GET]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();
    const db = getDb();
    const { autogegevens, kenteken, kleur, brandstof } = await request.json();
    if (!autogegevens || !kenteken) {
      return NextResponse.json({ error: 'autogegevens en kenteken zijn verplicht' }, { status: 400 });
    }
    const result = await db.query(
      'INSERT INTO cars (autogegevens, kenteken, kleur, brandstof) VALUES ($1, $2, $3, $4) RETURNING *',
      [autogegevens, kenteken, kleur || '', brandstof || '']
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (e) {
    console.error('[cars POST]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
