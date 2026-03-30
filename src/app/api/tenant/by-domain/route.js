import { NextResponse } from 'next/server';
import { getTenantByDomain } from '../../../../lib/tenant';

// Public endpoint — no auth required
// Returns minimal tenant branding for the current domain (for login screen)
const DEV_HOSTS = ['.replit.dev', '.repl.co', '.worf.replit.dev', 'localhost'];

function isDevHost(host) {
  const h = host.split(':')[0].toLowerCase();
  return h === 'localhost' || DEV_HOSTS.some(suffix => h.endsWith(suffix));
}

export async function GET(request) {
  try {
    const host =
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      '';

    // In development (Replit dev URL or localhost) skip domain restriction entirely
    if (isDevHost(host)) {
      return NextResponse.json({ dev: true });
    }

    const tenant = await getTenantByDomain(host);
    if (!tenant) {
      return NextResponse.json(null);
    }
    // Only expose safe, public fields
    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      primary_color: tenant.primary_color,
      logo_url: tenant.logo_url,
    });
  } catch (e) {
    console.error('[tenant/by-domain]', e);
    return NextResponse.json(null);
  }
}
