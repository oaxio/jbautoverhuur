"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/header'
import { useState, useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const storedPin = localStorage.getItem('pin');
    if (storedPin) {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinChange = (event) => {
    const value = event.target.value;
    setPin(value);

    if (value === '190505') {
      localStorage.setItem('pin', value);
      setIsAuthenticated(true);
    } else if (value.length === 6) {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 600);
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
                  maxWidth: '360px',
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
                  fontSize: '1.1rem',
                  marginBottom: '0.35rem',
                  letterSpacing: '0.02em',
                }}>
                  Beveiligde toegang
                </h2>
                <p style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.82rem',
                  marginBottom: '2rem',
                  letterSpacing: '0.01em',
                }}>
                  Voer uw 6-cijferige pincode in
                </p>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  padding: '0.75rem 1rem',
                }}>
                  <input
                    type="password"
                    value={pin}
                    onChange={handlePinChange}
                    maxLength="6"
                    autoFocus
                    placeholder="••••••"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#e8b84b',
                      fontSize: '2rem',
                      letterSpacing: '0.8rem',
                      width: '100%',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
                {shake && (
                  <p style={{ color: '#e05c5c', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                    Ongeldige pincode
                  </p>
                )}
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
        `}</style>
      </body>
    </html>
  )
}
