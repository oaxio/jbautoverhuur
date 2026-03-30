import { getIronSession } from 'iron-session';
import { sessionOptions } from './auth';
import { getDb } from './db';

/**
 * Looks up a tenant by its custom_domain.
 * Used for domain-based automatic tenant selection.
 */
export async function getTenantByDomain(host) {
  if (!host) return null;
  // Strip port if present
  const cleanHost = host.split(':')[0].toLowerCase().trim();
  // Ignore Replit's own domains
  if (cleanHost.endsWith('.replit.dev') || cleanHost.endsWith('.repl.co') || cleanHost === 'localhost') return null;
  const db = getDb();
  const result = await db.query(
    `SELECT id, name, slug, primary_color, logo_url, custom_domain
     FROM tenants
     WHERE LOWER(custom_domain) = $1 AND status = 'active'
     LIMIT 1`,
    [cleanHost]
  );
  return result.rows[0] ?? null;
}

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
 * Returns only tenants the user has been explicitly added to.
 * No auto-provisioning — access must be granted by an admin.
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

  return result.rows;
}
