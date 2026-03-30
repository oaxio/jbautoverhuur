"use client"
import Link from 'next/link';

function initials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function Header({ user, storedBranding = {} }) {
  const activeTenant = user?.tenants?.find(t => t.id === user?.tenantId) ?? null;
  // Use stored branding as fallback so header shows correct name/color immediately during page load
  const tenantName  = activeTenant?.name          ?? storedBranding.name          ?? null;
  const tenantColor = activeTenant?.primary_color ?? storedBranding.primary_color ?? '#e8b84b';
  const logoUrl     = activeTenant?.logo_url      ?? storedBranding.logo_url      ?? null;
  const hasMultipleTenants = (user?.tenants?.length ?? 0) > 1;

  return (
    <header className="fixed top-0 z-30 w-full" style={{
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2 no-underline" style={{ minWidth: 0 }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={tenantName ?? 'Logo'}
              style={{
                height: 28,
                maxWidth: 100,
                objectFit: 'contain',
                borderRadius: 4,
                flexShrink: 0,
              }}
            />
          ) : tenantName ? (
            <>
              <span style={{
                background: `linear-gradient(135deg, ${tenantColor}, ${tenantColor}cc)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: '1.05rem',
                letterSpacing: '0.02em',
                flexShrink: 0,
              }}>
                {initials(tenantName)}
              </span>
              <span style={{
                color: 'rgba(255,255,255,0.85)',
                fontWeight: 500,
                fontSize: '0.95rem',
                letterSpacing: '0.03em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {tenantName}
              </span>
            </>
          ) : (
            <span style={{
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}>
              Autoverhuur
            </span>
          )}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
          {user ? (
            <>
              {user?.isSuperAdmin && (
                <Link
                  href="/admin"
                  title="Admin paneel"
                  style={{
                    fontSize: '0.72rem',
                    color: '#e8b84b',
                    textDecoration: 'none',
                    background: 'rgba(232,184,75,0.1)',
                    border: '1px solid rgba(232,184,75,0.25)',
                    borderRadius: 6,
                    padding: '0.25rem 0.6rem',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⭐ Admin
                </Link>
              )}
              {user?.tenantId && (
                <Link
                  href="/instellingen"
                  title="Huisstijl instellingen"
                  style={{
                    fontSize: '0.72rem',
                    color: tenantColor,
                    textDecoration: 'none',
                    background: `${tenantColor}14`,
                    border: `1px solid ${tenantColor}35`,
                    borderRadius: 6,
                    padding: '0.25rem 0.6rem',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⚙ Instellingen
                </Link>
              )}
              {hasMultipleTenants && (
                <Link
                  href="/tenant-select"
                  title="Van bedrijf wisselen"
                  style={{
                    fontSize: '0.72rem',
                    color: tenantColor,
                    textDecoration: 'none',
                    background: `${tenantColor}18`,
                    border: `1px solid ${tenantColor}40`,
                    borderRadius: 6,
                    padding: '0.25rem 0.6rem',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⇄ Wissel
                </Link>
              )}
              {user.profileImageUrl && (
                <img
                  src={user.profileImageUrl}
                  alt="avatar"
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <span style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.82rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 'clamp(60px, 18vw, 160px)',
              }}>
                {user.firstName || user.email || ''}
              </span>
              <a
                href="/api/logout"
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.35)',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  padding: '0.3rem 0.7rem',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                Uitloggen
              </a>
            </>
          ) : null}
        </div>

      </div>
    </header>
  );
}
