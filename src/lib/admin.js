import { getIronSession } from 'iron-session';
import { sessionOptions } from './auth';
import { NextResponse } from 'next/server';

/**
 * Asserts the current session belongs to an authenticated super admin.
 * Throws a NextResponse 403 if not. Use in all /api/admin/* routes.
 */
export async function requireSuperAdmin(cookieStore) {
  const session = await getIronSession(cookieStore, sessionOptions);
  if (!session.user) {
    throw NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  if (!session.isSuperAdmin) {
    throw NextResponse.json({ error: 'Geen super admin rechten' }, { status: 403 });
  }
  return session;
}

/**
 * Synchronises a Replit Auth user into the local `users` table.
 * - Creates user if not exists
 * - Updates name/email/image on every login
 * - Promotes to super admin if email is in SUPER_ADMIN_EMAILS
 * - Backfills user_id on any existing tenant_users rows
 * Returns the local user row.
 */
export async function syncUserOnLogin(db, claims) {
  const sub = claims.sub ?? null;
  const email = claims.email ?? null;
  const name = [claims.first_name ?? claims.given_name, claims.last_name ?? claims.family_name]
    .filter(Boolean).join(' ') || claims.name || null;
  const profileImageUrl = claims.profile_image_url ?? claims.picture ?? null;

  const superAdminRaw = process.env.SUPER_ADMIN_EMAILS ?? '';
  const superAdminList = superAdminRaw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const isSuperAdmin = email ? superAdminList.includes(email.toLowerCase()) : false;

  const result = await db.query(`
    INSERT INTO users (replit_sub, email, name, profile_image_url, is_super_admin, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (replit_sub) DO UPDATE SET
      email             = EXCLUDED.email,
      name              = EXCLUDED.name,
      profile_image_url = EXCLUDED.profile_image_url,
      is_super_admin    = CASE WHEN $5 THEN TRUE ELSE users.is_super_admin END,
      updated_at        = NOW()
    RETURNING *
  `, [sub, email, name, profileImageUrl, isSuperAdmin]);

  const user = result.rows[0];

  // Backfill user_id on tenant_users rows that were created before users table existed
  await db.query(
    `UPDATE tenant_users SET user_id = $1 WHERE user_sub = $2 AND user_id IS NULL`,
    [user.id, sub]
  );

  return user;
}
