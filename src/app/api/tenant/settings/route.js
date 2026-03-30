import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '../../../../lib/db';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../../../lib/auth';

async function getSession() {
  return getIronSession(cookies(), sessionOptions);
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ error: 'Geen actieve tenant' }, { status: 400 });

    const db = getDb();
    const result = await db.query(
      `SELECT id, name, primary_color, bg_color, bg_image_url, logo_url,
              contract_terms, contract_bullets,
              bedrijf_adres, bedrijf_telefoon, bedrijf_email, bedrijf_website, bedrijf_kvk
       FROM tenants WHERE id = $1`,
      [tenantId]
    );
    if (!result.rows[0]) return NextResponse.json({ error: 'Tenant niet gevonden' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (e) {
    console.error('[tenant settings GET]', e);
    return NextResponse.json({ error: 'Serverfout' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    const tenantId = session.tenantId;
    if (!tenantId) return NextResponse.json({ error: 'Geen actieve tenant' }, { status: 400 });

    const {
      primary_color, bg_color, bg_image_url, logo_url,
      contract_terms, contract_bullets,
      bedrijf_adres, bedrijf_telefoon, bedrijf_email, bedrijf_website, bedrijf_kvk,
    } = await request.json();

    const db = getDb();
    const result = await db.query(
      `UPDATE tenants
       SET primary_color     = COALESCE($1, primary_color),
           bg_color          = COALESCE($2, bg_color),
           bg_image_url      = $3,
           logo_url          = $4,
           contract_terms    = COALESCE($5, contract_terms),
           contract_bullets  = COALESCE($6, contract_bullets),
           bedrijf_adres     = COALESCE($8, bedrijf_adres),
           bedrijf_telefoon  = COALESCE($9, bedrijf_telefoon),
           bedrijf_email     = COALESCE($10, bedrijf_email),
           bedrijf_website   = COALESCE($11, bedrijf_website),
           bedrijf_kvk       = COALESCE($12, bedrijf_kvk),
           updated_at        = NOW()
       WHERE id = $7
       RETURNING id, name, primary_color, bg_color, bg_image_url, logo_url,
                 contract_terms, contract_bullets,
                 bedrijf_adres, bedrijf_telefoon, bedrijf_email, bedrijf_website, bedrijf_kvk`,
      [
        primary_color || null,
        bg_color || null,
        bg_image_url ?? null,
        logo_url ?? null,
        contract_terms !== undefined ? contract_terms : null,
        contract_bullets !== undefined ? contract_bullets : null,
        tenantId,
        bedrijf_adres !== undefined ? bedrijf_adres : null,
        bedrijf_telefoon !== undefined ? bedrijf_telefoon : null,
        bedrijf_email !== undefined ? bedrijf_email : null,
        bedrijf_website !== undefined ? bedrijf_website : null,
        bedrijf_kvk !== undefined ? bedrijf_kvk : null,
      ]
    );

    const updated = result.rows[0];

    if (session.tenants) {
      session.tenants = session.tenants.map(t =>
        t.id === tenantId
          ? { ...t, primary_color: updated.primary_color, bg_color: updated.bg_color, bg_image_url: updated.bg_image_url, logo_url: updated.logo_url }
          : t
      );
      await session.save();
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error('[tenant settings PUT]', e);
    return NextResponse.json({ error: 'Serverfout' }, { status: 500 });
  }
}
