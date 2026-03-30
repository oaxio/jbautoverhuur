import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { cookies } from 'next/headers';
import { getSessionTenantId } from '../../../lib/tenant';

export async function POST() {
  try {
    const tenantId = await getSessionTenantId(cookies());
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const result = await db.query(
      'INSERT INTO intake_submissions (tenant_id, status) VALUES ($1, $2) RETURNING token',
      [tenantId, 'pending']
    );
    const token = result.rows[0].token;
    return NextResponse.json({ token }, { status: 201 });
  } catch (e) {
    console.error('[intake POST]', e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
