"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/header'
import { useState, useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const isLoading = user === undefined;
  const isAuthenticated = !!user;

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header user={user} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {isLoading ? (
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
                  marginBottom: '0.4rem',
                }}>
                  JB Autoverhuur
                </h2>
                <p style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.85rem',
                  marginBottom: '2rem',
                  lineHeight: 1.5,
                }}>
                  Log in om toegang te krijgen tot het contract systeem.
                </p>
                <button
                  onClick={() => {
                    // Break out of any iframe so OAuth redirect works in all browsers
                    const target = window.top || window;
                    target.location.href = '/api/login';
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    background: 'linear-gradient(135deg, #e8b84b, #d4a033)',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    padding: '0.8rem 2rem',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    boxShadow: '0 4px 20px rgba(232,184,75,0.3)',
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
