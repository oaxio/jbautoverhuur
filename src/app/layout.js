"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/header'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

function NoAccessScreen({ title, message, onLogout }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '380px', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚫</div>
        <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.55, marginBottom: '1.75rem' }}>
          {message}
        </p>
        <button
          onClick={onLogout}
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.82rem',
            padding: '0.55rem 1.25rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Uitloggen
        </button>
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(undefined);
  const [loginUrl, setLoginUrl] = useState('');
  const [domainTenant, setDomainTenant] = useState(undefined); // undefined = still loading

  useEffect(() => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null));

    fetch('/api/auth/config')
      .then(res => res.json())
      .then(data => setLoginUrl(data.loginUrl))
      .catch(() => setLoginUrl('/api/login'));

    fetch('/api/tenant/by-domain')
      .then(res => res.json())
      .then(data => setDomainTenant(data ?? null))
      .catch(() => setDomainTenant(null));
  }, []);

  const isPublicPage = pathname === '/toegang-geweigerd' || pathname.startsWith('/intake/');
  const isAdminPage = pathname.startsWith('/admin');
  const isTenantSelect = pathname === '/tenant-select';

  // Still waiting for auth or domain check
  const isLoading = user === undefined || domainTenant === undefined;
  const isAuthenticated = !!user;

  const tenants = user?.tenants ?? [];
  const hasTenants = tenants.length > 0;
  const hasTenant = !!user?.tenantId;

  // Is the user a member of the domain's tenant?
  const isDevMode = domainTenant?.dev === true; // Replit dev URL or localhost
  const isLockedToDomain = !isDevMode && domainTenant !== null; // null = unknown/prod domain, object with id = custom domain
  const isMemberOfDomainTenant = isLockedToDomain
    ? tenants.some(t => t.id === domainTenant?.id)
    : true; // Dev mode or generic URL — no domain restriction

  // Determine which blocking case applies (only for authenticated users)
  const noTenantAccess = isAuthenticated && !hasTenants; // logged in but no memberships at all
  const domainAccessDenied = isAuthenticated && isLockedToDomain && !isMemberOfDomainTenant; // wrong domain

  // Redirect to tenant-select only when: auth, has tenants, no active tenant chosen, generic URL, not already there
  useEffect(() => {
    if (
      isAuthenticated &&
      hasTenants &&
      !hasTenant &&
      !isLockedToDomain &&
      !isTenantSelect &&
      !isPublicPage &&
      !isAdminPage
    ) {
      window.location.href = '/tenant-select';
    }
  }, [isAuthenticated, hasTenants, hasTenant, isLockedToDomain, isTenantSelect, isPublicPage, isAdminPage]);

  const domainColor = domainTenant?.primary_color ?? '#e8b84b';

  const loginScreen = (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '380px', padding: '2.5rem 2rem', textAlign: 'center' }}>
        {domainTenant ? (
          <div style={{ marginBottom: '1.75rem' }}>
            {domainTenant.logo_url ? (
              <img
                src={domainTenant.logo_url}
                alt={domainTenant.name}
                style={{ height: 52, maxWidth: 200, objectFit: 'contain', margin: '0 auto 1rem', display: 'block' }}
              />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `${domainColor}22`, border: `1.5px solid ${domainColor}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', color: domainColor, fontWeight: 800, fontSize: '1.4rem',
              }}>
                {domainTenant.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.3rem' }}>
              {domainTenant.name}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', margin: 0 }}>
              Inloggen om verder te gaan
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', fontSize: '1.4rem',
            }}>🔐</div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', margin: 0 }}>
              Inloggen om verder te gaan
            </p>
          </div>
        )}
        <button
          onClick={() => { if (loginUrl) window.location.href = loginUrl; }}
          style={{
            display: 'block', width: '100%',
            background: `linear-gradient(135deg, ${domainColor}, ${domainColor}bb)`,
            color: '#000', fontWeight: 700, fontSize: '0.95rem',
            padding: '0.8rem 2rem', borderRadius: 10, border: 'none',
            cursor: 'pointer', letterSpacing: '0.02em',
            boxShadow: `0 4px 20px ${domainColor}44`,
          }}
        >
          Inloggen →
        </button>
      </div>
    </div>
  );

  const spinner = (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(232,184,75,0.2)', borderTopColor: '#e8b84b',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  let content;

  if (isPublicPage || isAdminPage) {
    // Always accessible — public intake pages, admin panel
    content = children;
  } else if (isLoading) {
    content = spinner;
  } else if (!isLockedToDomain) {
    // Not on a registered custom domain — no access at all
    content = (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '380px', padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Niet beschikbaar
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.55, margin: 0 }}>
            Toegang is alleen mogelijk via jouw eigen domein.
          </p>
        </div>
      </div>
    );
  } else if (!isAuthenticated) {
    content = loginScreen;
  } else if (noTenantAccess) {
    // Logged in but has no tenant memberships at all
    content = (
      <NoAccessScreen
        title="Geen toegang"
        message="Je account heeft nog geen toegang tot dit systeem. Neem contact op met de beheerder."
        onLogout={() => { window.location.href = '/api/logout'; }}
      />
    );
  } else if (domainAccessDenied) {
    // Logged in via a custom domain but not a member of that tenant
    content = (
      <NoAccessScreen
        title={`Geen toegang tot ${domainTenant?.name ?? 'dit portaal'}`}
        message="Je account is niet gekoppeld aan dit portaal. Neem contact op met de beheerder van dit bedrijf."
        onLogout={() => { window.location.href = '/api/logout'; }}
      />
    );
  } else if (isTenantSelect) {
    content = children;
  } else {
    content = children;
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header user={user} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {content}
        </div>
      </body>
    </html>
  );
}
