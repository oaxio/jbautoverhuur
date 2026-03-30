"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/header'
import { useState, useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

const VALID_EMAIL = 'admin@jbautoverhuur.nl'
const VALID_PASSWORD = '190505'

export default function RootLayout({ children }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('jb-auth');
    if (stored === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === VALID_PASSWORD) {
      localStorage.setItem('jb-auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Onjuist wachtwoord. Probeer opnieuw.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {!isAuthenticated ? (
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}>
              <div
                className="glass-card"
                style={{
                  width: '100%',
                  maxWidth: '380px',
                  padding: '2.5rem 2rem',
                  textAlign: 'center',
                  animation: shake ? 'shake 0.5s ease' : 'none',
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(232,184,75,0.15)',
                  border: '1.5px solid rgba(232,184,75,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '1.5rem',
                }}>
                  🔐
                </div>
                <h2 style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  marginBottom: '0.35rem',
                }}>
                  JB Autoverhuur
                </h2>
                <p style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.82rem',
                  marginBottom: '1.75rem',
                }}>
                  Log in om toegang te krijgen
                </p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="naam@voorbeeld.nl"
                      required
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        padding: '0.65rem 0.85rem',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                      Wachtwoord
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        padding: '0.65rem 0.85rem',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {error && (
                    <p style={{ color: '#e05c5c', fontSize: '0.8rem', margin: 0 }}>{error}</p>
                  )}

                  <button
                    type="submit"
                    style={{
                      marginTop: '0.25rem',
                      background: 'linear-gradient(135deg, #e8b84b, #d4a033)',
                      color: '#000',
                      border: 'none',
                      borderRadius: 10,
                      padding: '0.75rem',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      letterSpacing: '0.02em',
                      boxShadow: '0 4px 20px rgba(232,184,75,0.25)',
                    }}
                  >
                    Inloggen
                  </button>
                </form>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
          }
          input::placeholder { color: rgba(255,255,255,0.2); }
          input:focus { border-color: rgba(232,184,75,0.5) !important; }
        `}</style>
      </body>
    </html>
  )
}
