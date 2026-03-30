"use client"

import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/header'

import { useState, useEffect } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {

  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the PIN is stored in localStorage
    const storedPin = localStorage.getItem('pin');
    if (storedPin) {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePinChange = (event) => {
    setPin(event.target.value);

    if (event.target.value === '190505') {
      // Save the PIN to localStorage
      localStorage.setItem('pin', pin);
      setIsAuthenticated(true);
    } else if (event.target.value.length === 6) {
      alert('Invalid PIN. Please try again.');
    }
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <div>
          {!isAuthenticated ? (
            <div className="mt-24 md:mt-32 text-white p-4 relative z-20">
              <h2>Pincode:</h2>
              <input
                type="password"
                value={pin}
                onChange={handlePinChange}
                maxLength="6"
              />
            </div>
          ) : (
            children
          )}
        </div>
      </body>
    </html>
  )
}
