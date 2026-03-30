"use client"
import { useEffect, useState } from 'react';

export default function TenantSelectPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(null);

  useEffect(() => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { window.location.href = '/api/login'; return; }
        if (data.tenantId) { window.location.href = '/'; return; }
        setTenants(data.tenants ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const select = async (tenantId) => {
    setSelecting(tenantId);
    await fetch('/api/tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
      credentials: 'include',
    });
    window.location.href = '/';
  };

  const page = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
  };

  if (loading) return (
    <div style={page}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(232,184,75,0.2)', borderTopColor: '#e8b84b', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (tenants.length === 0) return (
    <div style={page}>
      <div className="glass-card" style={{ maxWidth: 400, width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚫</div>
        <h2 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>Geen toegang</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          Uw account heeft geen toegang tot een verhuuromgeving.<br />Neem contact op met de beheerder.
        </p>
        <a href="/api/logout" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#e8b84b', fontSize: '0.85rem' }}>Uitloggen</a>
      </div>
    </div>
  );

  return (
    <div style={page}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#e8b84b', fontWeight: 700, marginBottom: '0.5rem' }}>
            Omgeving selecteren
          </p>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.6rem' }}>
            Kies uw bedrijf
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {tenants.map(t => (
            <button
              key={t.id}
              onClick={() => select(t.id)}
              disabled={selecting !== null}
              className="glass-card"
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.1rem 1.25rem', width: '100%', textAlign: 'left',
                cursor: selecting ? 'not-allowed' : 'pointer',
                border: `1px solid ${selecting === t.id ? 'rgba(232,184,75,0.5)' : 'rgba(255,255,255,0.12)'}`,
                opacity: selecting && selecting !== t.id ? 0.5 : 1,
                transition: 'border-color 0.2s',
                background: 'none',
              }}
              onMouseEnter={e => { if (!selecting) e.currentTarget.style.borderColor = 'rgba(232,184,75,0.4)'; }}
              onMouseLeave={e => { if (!selecting) e.currentTarget.style.borderColor = selecting === t.id ? 'rgba(232,184,75,0.5)' : 'rgba(255,255,255,0.12)'; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
              }}>
                🚗
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{t.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '0.1rem' }}>{t.slug}</div>
              </div>
              <div style={{ color: selecting === t.id ? '#e8b84b' : 'rgba(255,255,255,0.3)', fontSize: '1.1rem' }}>
                {selecting === t.id ? '…' : '›'}
              </div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/api/logout" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem' }}>Uitloggen</a>
        </div>
      </div>
    </div>
  );
}
