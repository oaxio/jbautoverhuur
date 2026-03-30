import { getIronSession } from 'iron-session';
import { sessionOptions } from './auth';
import { getDb } from './db';

/**
 * Returns the tenantId from the current session, or null if not set.
 * Always reads from the server-side session — never from user input.
 */
export async function getSessionTenantId(cookieStore) {
  const session = await getIronSession(cookieStore, sessionOptions);
  if (!session.user) return null;
  return session.tenantId ?? null;
}

/**
 * Returns the tenantId or throws a Response-compatible error object.
 * Use in API routes that require authentication + tenant context.
 */
export async function requireTenantId(cookieStore) {
  const tenantId = await getSessionTenantId(cookieStore);
  if (!tenantId) {
    const err = new Error('Unauthorized: no tenant in session');
    err.status = 401;
    throw err;
  }
  return tenantId;
}

/**
 * Resolves tenant memberships for a user after login.
 * - If the user has no memberships and there is only 1 tenant → auto-provision
 *   them as a member (backward-compatible with existing single-tenant setup).
 * - Returns the list of tenants the user belongs to.
 */
export async function resolveUserTenants(userSub, userEmail) {
  const db = getDb();

  let result = await db.query(
    `SELECT t.id, t.name, t.slug, t.primary_color, t.logo_url, tu.role
     FROM tenant_users tu
     JOIN tenants t ON t.id = tu.tenant_id
     WHERE tu.user_sub = $1 AND t.status = 'active'
     ORDER BY t.name`,
    [userSub]
  );

  if (result.rows.length === 0) {
    const tenantCount = await db.query(`SELECT COUNT(*) FROM tenants WHERE status='active'`);
    if (parseInt(tenantCount.rows[0].count, 10) === 1) {
      const defaultTenant = await db.query(`SELECT id FROM tenants WHERE status='active' LIMIT 1`);
      if (defaultTenant.rows.length > 0) {
        const tenantId = defaultTenant.rows[0].id;
        await db.query(
          `INSERT INTO tenant_users (tenant_id, user_sub, user_email, role)
           VALUES ($1, $2, $3, 'member')
           ON CONFLICT (tenant_id, user_sub) DO NOTHING`,
          [tenantId, userSub, userEmail]
        );
        result = await db.query(
          `SELECT t.id, t.name, t.slug, t.primary_color, t.logo_url, tu.role
           FROM tenant_users tu
           JOIN tenants t ON t.id = tu.tenant_id
           WHERE tu.user_sub = $1 AND t.status = 'active'`,
          [userSub]
        );
      }
    }
  }

  return result.rows;
}
