"use client"
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em' }}>
        {label}{required && <span style={{ color: '#e8b84b' }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8,
          color: 'white',
          padding: '0.6rem 0.85rem',
          fontSize: '0.9rem',
          outline: 'none',
          width: '100%',
        }}
      />
    </div>
  );
}

export default function IntakePage() {
  const { token } = useParams();

  const [status, setStatus] = useState('loading');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [voornaam, setVoornaam] = useState('');
  const [achternaam, setAchternaam] = useState('');
  const [straat, setStraat] = useState('');
  const [postcode, setPostcode] = useState('');
  const [woonplaats, setWoonplaats] = useState('');
  const [geboortedatum, setGeboortedatum] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [email, setEmail] = useState('');
  const [documentnummer, setDocumentnummer] = useState('');
  const [rijbewijsAfgiftedatum, setRijbewijsAfgiftedatum] = useState('');

  useEffect(() => {
    fetch(`/api/intake/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setStatus('not_found'); return; }
        if (d.status === 'submitted') { setStatus('already_submitted'); return; }
        setStatus('open');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/intake/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voornaam, achternaam, straat, postcode, woonplaats,
          geboortedatum, telefoon, email, documentnummer, rijbewijsAfgiftedatum,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Er is iets misgegaan.');
      } else {
        setSaved(true);
      }
    } catch {
      setError('Netwerkfout. Probeer het opnieuw.');
    }
    setSubmitting(false);
  };

  const card = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: '2rem',
    maxWidth: 520,
    width: '100%',
    margin: '0 auto',
  };

  const page = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1208 50%, #0f0f0f 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    fontFamily: 'system-ui, sans-serif',
  };

  if (status === 'loading') return (
    <div style={page}>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>Laden…</div>
    </div>
  );

  if (status === 'not_found' || status === 'error') return (
    <div style={page}>
      <div style={card}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>Link niet geldig</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>
            Deze link bestaat niet of is verlopen. Neem contact op met JB Autoverhuur.
          </p>
        </div>
      </div>
    </div>
  );

  if (status === 'already_submitted') return (
    <div style={page}>
      <div style={card}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>Al ingevuld</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>
            Uw gegevens zijn al ontvangen. U hoeft niets meer te doen.
          </p>
        </div>
      </div>
    </div>
  );

  if (saved) return (
    <div style={page}>
      <div style={card}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ color: 'white', fontWeight: 700, marginBottom: '0.5rem' }}>Bedankt!</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Uw gegevens zijn ontvangen door JB Autoverhuur.<br />
            U hoeft niets meer te doen — wij regelen de rest.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={page}>
      <div style={{ ...card, maxWidth: 560 }}>
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(232,184,75,0.12)',
            border: '1px solid rgba(232,184,75,0.25)',
            borderRadius: 20, padding: '0.3rem 0.9rem',
            fontSize: '0.75rem', color: '#e8b84b', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>🚗 JB Autoverhuur</div>
          <h1 style={{ color: 'white', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.4rem' }}>
            Vul uw gegevens in
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            Vul onderstaand formulier in zodat wij uw huurcontract kunnen opmaken.
            Dit duurt minder dan 2 minuten.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Voornaam" value={voornaam} onChange={setVoornaam} required />
            <Field label="Achternaam" value={achternaam} onChange={setAchternaam} required />
          </div>
          <Field label="Straatnaam + huisnummer" value={straat} onChange={setStraat} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
            <Field label="Postcode" value={postcode} onChange={setPostcode} required />
            <Field label="Woonplaats" value={woonplaats} onChange={setWoonplaats} required />
          </div>
          <Field label="Geboortedatum" value={geboortedatum} onChange={setGeboortedatum} type="date" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Telefoonnummer" value={telefoon} onChange={setTelefoon} type="tel" required />
            <Field label="E-mailadres" value={email} onChange={setEmail} type="email" />
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '1rem',
            marginTop: '0.25rem',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
              Identiteitsbewijs / rijbewijs
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Field label="Documentnummer (ID / paspoort)" value={documentnummer} onChange={setDocumentnummer} required />
              <Field label="Rijbewijs afgiftedatum" value={rijbewijsAfgiftedatum} onChange={setRijbewijsAfgiftedatum} type="date" />
            </div>
          </div>

          {error && (
            <p style={{ color: '#ff6b6b', fontSize: '0.85rem', background: 'rgba(255,50,50,0.08)', padding: '0.6rem 0.9rem', borderRadius: 8, border: '1px solid rgba(255,50,50,0.2)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '0.5rem',
              background: submitting ? 'rgba(232,184,75,0.3)' : 'linear-gradient(135deg, #e8b84b, #c9962e)',
              color: submitting ? 'rgba(255,255,255,0.4)' : '#1a0f00',
              border: 'none',
              borderRadius: 10,
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            {submitting ? 'Versturen…' : 'Gegevens versturen →'}
          </button>
        </form>
      </div>
    </div>
  );
}
