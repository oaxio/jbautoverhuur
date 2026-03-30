import { NextResponse } from 'next/server';
import { getTenantByDomain } from '../../../../lib/tenant';

const DEV_SUFFIXES = ['.replit.dev', '.repl.co', '.worf.replit.dev'];

function isDevHost(h) {
  return h === 'localhost' || DEV_SUFFIXES.some(s => h.endsWith(s));
}

function normalizeHost(raw) {
  if (!raw) return '';
  return raw.toLowerCase().trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .split(':')[0];
}

export async function GET(request) {
  try {
    // Collect all candidate host headers for debugging + reliability
    const candidates = [
      request.headers.get('x-forwarded-host'),
      request.headers.get('host'),
      request.headers.get('x-real-host'),
      request.headers.get('x-original-host'),
    ].filter(Boolean);

    const rawHost = candidates[0] ?? '';
    const host = normalizeHost(rawHost);

    console.log('[by-domain] candidates:', candidates, '→ resolved:', host);

    if (!host) return NextResponse.json(null);

    if (process.env.NODE_ENV === 'development' || isDevHost(host)) {
      return NextResponse.json({ dev: true, _host: host });
    }

    const tenant = await getTenantByDomain(rawHost);

    if (!tenant) {
      console.log('[by-domain] no tenant found for host:', host);
      return NextResponse.json({ _host: host }); // returns null-like but with debug info
    }

    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      primary_color: tenant.primary_color,
      logo_url: tenant.logo_url,
      _host: host,
    });
  } catch (e) {
    console.error('[by-domain]', e);
    return NextResponse.json(null);
  }
}
