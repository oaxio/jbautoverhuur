"use client"

export default function Header() {
  return (
    <header className="fixed top-0 z-30 w-full" style={{
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 no-underline">
          <span style={{
            background: 'linear-gradient(135deg, #e8b84b, #f5d27a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: '1.1rem',
            letterSpacing: '0.02em',
          }}>
            JB
          </span>
          <span style={{
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 500,
            fontSize: '1rem',
            letterSpacing: '0.04em',
          }}>
            Autoverhuur
          </span>
        </a>
        <div style={{
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          Contract Systeem
        </div>
      </div>
    </header>
  )
}
