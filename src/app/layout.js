"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/header'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [user, setUser] = useState(undefined);
  const [loginUrl, setLoginUrl] = useState('');
  const [domainTenant, setDomainTenant] = useState(null);

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
      .then(data => setDomainTenant(data))
      .catch(() => {});
  }, []);

  const isLoading = user === undefined;
  const isAuthenticated = !!user;
  const hasTenant = !!user?.tenantId;

  const isPublicPage = pathname === '/toegang-geweigerd' || pathname.startsWith('/intake/');
  const isTenantSelect = pathname === '/tenant-select';
  const isAdminPage = pathname.startsWith('/admin');

  // Redirect to tenant-select if authenticated but no tenant chosen (and not already there)
  useEffect(() => {
    if (isAuthenticated && !hasTenant && !isTenantSelect && !isPublicPage && !isAdminPage) {
      window.location.href = '/tenant-select';
    }
  }, [isAuthenticated, hasTenant, isTenantSelect, isPublicPage, isAdminPage]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header user={user} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {isPublicPage || isTenantSelect || isAdminPage ? children : isLoading ? (
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '3px solid rgba(232,184,75,0.2)',
                borderTopColor: '#e8b84b',
                animation: 'spin 0.7s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : !isAuthenticated ? (
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}>
              <div className="glass-card" style={{
                width: '100%',
                maxWidth: '380px',
                padding: '2.5rem 2rem',
                textAlign: 'center',
              }}>
                {domainTenant ? (
                  // Tenant-branded login
                  <div style={{ marginBottom: '1.75rem' }}>
                    {domainTenant.logo_url ? (
                      <img
                        src={domainTenant.logo_url}
                        alt={domainTenant.name}
                        style={{ height: 52, maxWidth: 200, objectFit: 'contain', margin: '0 auto 1rem', display: 'block' }}
                      />
                    ) : (
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: `${domainTenant.primary_color ?? '#e8b84b'}22`,
                        border: `1.5px solid ${domainTenant.primary_color ?? '#e8b84b'}55`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '1.5rem',
                        color: domainTenant.primary_color ?? '#e8b84b',
                        fontWeight: 800,
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
                  // Generic login — no tenant branding
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      fontSize: '1.4rem',
                    }}>
                      🔐
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', margin: 0 }}>
                      Inloggen om verder te gaan
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (loginUrl) window.location.href = loginUrl;
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: domainTenant?.primary_color
                      ? `linear-gradient(135deg, ${domainTenant.primary_color}, ${domainTenant.primary_color}bb)`
                      : 'linear-gradient(135deg, #e8b84b, #d4a033)',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    padding: '0.8rem 2rem',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    boxShadow: `0 4px 20px ${domainTenant?.primary_color ?? '#e8b84b'}44`,
                  }}
                >
                  Inloggen →
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </body>
    </html>
  )
}
