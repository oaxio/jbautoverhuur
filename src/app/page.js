"use client"

export default function Home() {
  return (
    <main style={{ position: 'relative', zIndex: 1 }}>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 1.5rem 2rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{
            fontSize: '0.7rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#e8b84b',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}>
            JB Autoverhuur
          </p>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.01em',
            lineHeight: 1.15,
            marginBottom: '0.75rem',
          }}>
            Documentenbeheer
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.95rem',
            maxWidth: 380,
            margin: '0 auto',
          }}>
            Maak professionele verhuurcontracten en facturen in enkele seconden.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          width: '100%',
          maxWidth: 960,
        }}>
          <a href="/createContract" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{
              padding: '2rem',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(232,184,75,0.45)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'rgba(232,184,75,0.15)',
                border: '1px solid rgba(232,184,75,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                marginBottom: '1.25rem',
              }}>
                📄
              </div>
              <div style={{
                fontSize: '0.65rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#e8b84b',
                fontWeight: 700,
                marginBottom: '0.4rem',
              }}>
                Contract
              </div>
              <h2 style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '1.2rem',
                marginBottom: '0.5rem',
              }}>
                Contract maken
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                marginBottom: '1.5rem',
              }}>
                Genereer een verhuurcontract inclusief handtekening en schaderapport.
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#e8b84b',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}>
                Maken →
              </div>
            </div>
          </a>

          <a href="/planning" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{
              padding: '2rem',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(232,184,75,0.45)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(232,184,75,0.15)',
                border: '1px solid rgba(232,184,75,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', marginBottom: '1.25rem',
              }}>📅</div>
              <div style={{
                fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#e8b84b', fontWeight: 700, marginBottom: '0.4rem',
              }}>Verhuur</div>
              <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Planning
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Bekijk en beheer verhuringen per voertuig in een overzichtelijke tijdlijn.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                color: '#e8b84b', fontSize: '0.82rem', fontWeight: 600,
              }}>Bekijken →</div>
            </div>
          </a>

          <a href="/autos" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{
              padding: '2rem',
              transition: 'border-color 0.2s, transform 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(232,184,75,0.45)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(232,184,75,0.15)',
                border: '1px solid rgba(232,184,75,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', marginBottom: '1.25rem',
              }}>🚗</div>
              <div style={{
                fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: '#e8b84b', fontWeight: 700, marginBottom: '0.4rem',
              }}>Voertuigen</div>
              <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Voertuigbeheer
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Sla voertuiggegevens op en laad ze automatisch in bij een nieuw contract.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                color: '#e8b84b', fontSize: '0.82rem', fontWeight: 600,
              }}>Beheren →</div>
            </div>
          </a>

          <div className="glass-card" style={{
            padding: '2rem',
            opacity: 0.5,
            cursor: 'not-allowed',
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              marginBottom: '1.25rem',
            }}>
              🧾
            </div>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
              fontWeight: 700,
              marginBottom: '0.4rem',
            }}>
              Factuur
            </div>
            <h2 style={{
              color: 'white',
              fontWeight: 700,
              fontSize: '1.2rem',
              marginBottom: '0.5rem',
            }}>
              Factuur maken
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              marginBottom: '1.5rem',
            }}>
              Genereer een professionele factuur voor uw klant.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: 'rgba(255,255,255,0.06)',
              padding: '0.25rem 0.65rem',
              borderRadius: 99,
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
              Binnenkort beschikbaar
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
