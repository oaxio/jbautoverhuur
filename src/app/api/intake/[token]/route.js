import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const db = getDb();
    const result = await db.query(
      'SELECT token, status, data, created_at FROM intake_submissions WHERE token=$1',
      [params.token]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    console.error('[intake GET]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const db = getDb();
    const data = await request.json();
    const result = await db.query(
      `UPDATE intake_submissions
       SET status='submitted', data=$1
       WHERE token=$2 AND status='pending'
       RETURNING token`,
      [JSON.stringify(data), params.token]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Niet gevonden of al ingevuld' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[intake POST token]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
