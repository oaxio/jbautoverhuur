"use client"

export default function ToegangsGeweigerd() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(220,50,50,0.12)',
          border: '1.5px solid rgba(220,50,50,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '1.6rem',
        }}>
          🚫
        </div>
        <h2 style={{
          color: 'rgba(255,255,255,0.9)',
          fontWeight: 700,
          fontSize: '1.2rem',
          marginBottom: '0.5rem',
        }}>
          Toegang geweigerd
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}>
          Jouw account heeft geen toegang tot dit systeem. Neem contact op met de beheerder om toegang aan te vragen.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '0.65rem 1.5rem',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          ← Terug naar inlogpagina
        </a>
      </div>
    </div>
  );
}
