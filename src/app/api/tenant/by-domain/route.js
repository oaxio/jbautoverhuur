import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

const DEV_SUFFIXES = ['.replit.dev', '.repl.co', '.worf.replit.dev'];

function isDevHost(h) {
  return h === 'localhost' || DEV_SUFFIXES.some(s => h.endsWith(s));
}

function normalizeHost(raw) {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .split(':')[0];
}

export async function GET(request) {
  const rawXFH  = request.headers.get('x-forwarded-host') ?? '';
  const rawHost = request.headers.get('host') ?? '';
  const chosen  = rawXFH || rawHost;
  const host    = normalizeHost(chosen);

  console.log('[by-domain] x-forwarded-host:', rawXFH, '| host:', rawHost, '| resolved:', host);

  if (!host) return NextResponse.json(null);

  if (process.env.NODE_ENV === 'development' || isDevHost(host)) {
    return NextResponse.json({ dev: true, _host: host });
  }

  try {
    const db = getDb();
    const result = await db.query(
      `SELECT id, name, primary_color, logo_url, custom_domain
       FROM tenants
       WHERE LOWER(REPLACE(REPLACE(custom_domain, 'https://', ''), 'http://', '')) = $1
         AND status = 'active'
       LIMIT 1`,
      [host]
    );

    const tenant = result.rows[0] ?? null;
    console.log('[by-domain] lookup result for', host, ':', tenant ? tenant.name : 'NOT FOUND');

    if (!tenant) {
      return NextResponse.json({ notFound: true, _host: host });
    }

    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      primary_color: tenant.primary_color,
      logo_url: tenant.logo_url,
      bg_color: tenant.bg_color,
      _host: host,
    });
  } catch (e) {
    console.error('[by-domain] DB error:', e.message);
    return NextResponse.json({ error: e.message, _host: host });
  }
}
