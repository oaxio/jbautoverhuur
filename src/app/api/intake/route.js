import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export async function POST() {
  try {
    const db = getDb();
    const result = await db.query(
      'INSERT INTO intake_submissions (status) VALUES ($1) RETURNING token',
      ['pending']
    );
    const token = result.rows[0].token;
    return NextResponse.json({ token }, { status: 201 });
  } catch (e) {
    console.error('[intake POST]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
