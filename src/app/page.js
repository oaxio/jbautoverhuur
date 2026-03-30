"use client"
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/createContract', icon: '📄', label: 'Contract maken', sub: 'Nieuw verhuurcontract genereren' },
  { href: '/planning', icon: '📅', label: 'Planning', sub: 'Verhuringen beheren en inzien' },
  { href: '/autos', icon: '🚗', label: 'Voertuigbeheer', sub: 'Voertuigen toevoegen en wijzigen' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Goedemorgen';
  if (h < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

function todayLabel() {
  return new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Home() {
  const [stats, setStats] = useState({ cars: null, today: null, week: null });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    Promise.all([
      fetch('/api/cars').then(r => r.ok ? r.json() : []),
      fetch('/api/reservations').then(r => r.ok ? r.json() : []),
    ]).then(([cars, reservations]) => {
      const todayCount = reservations.filter(r => {
        const s = r.start_date?.split('T')[0];
        const e = r.end_date?.split('T')[0];
        return s <= today && today <= e;
      }).length;
      const weekCount = reservations.filter(r => {
        const s = r.start_date?.split('T')[0];
        return s >= today && s <= weekEndStr;
      }).length;
      setStats({ cars: cars.length, today: todayCount, week: weekCount });
    }).catch(() => {});
  }, []);

  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1.25rem 2rem',
      }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#e8b84b', fontWeight: 700, marginBottom: '0.3rem' }}>
              {todayLabel()}
            </p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.01em', marginBottom: '0', lineHeight: 1.2 }}>
              {greeting()}
            </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {[
              { label: "Auto's", value: stats.cars, icon: '🚗' },
              { label: 'Vandaag actief', value: stats.today, icon: '📍' },
              { label: 'Komende 7 dagen', value: stats.week, icon: '📆' },
            ].map(s => (
              <div key={s.label} className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{s.icon}</div>
                <div style={{ fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                  {s.value === null ? '—' : s.value}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem', lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {NAV_ITEMS.map(item => (
              <a key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  className="glass-card"
                  style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'border-color 0.2s, transform 0.15s', cursor: 'pointer' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(232,184,75,0.45)';
                    e.currentTarget.style.transform = 'translateX(3px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.78rem', marginTop: '0.1rem' }}>{item.sub}</div>
                  </div>
                  <div style={{ color: 'rgba(232,184,75,0.7)', fontSize: '1rem', flexShrink: 0 }}>›</div>
                </div>
              </a>
            ))}

            <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.38, cursor: 'not-allowed' }} className="glass-card">
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
              }}>
                🧾
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Factuur maken</div>
                <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.78rem', marginTop: '0.1rem' }}>Binnenkort beschikbaar</div>
              </div>
              <div style={{
                fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600,
                background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.55rem',
                borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap',
              }}>
                Binnenkort
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
