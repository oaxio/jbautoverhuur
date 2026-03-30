"use client"
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import SignatureCanvas from 'react-signature-canvas';

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
  const sigRef = useRef(null);

  const [status, setStatus] = useState('loading');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [akkoord, setAkkoord] = useState(false);
  const [sigEmpty, setSigEmpty] = useState(true);

  const [tenantName, setTenantName] = useState('');
  const [tenantColor, setTenantColor] = useState('#e8b84b');
  const [tenantLogo, setTenantLogo] = useState('');

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
        if (d.tenant_name) setTenantName(d.tenant_name);
        if (d.tenant_color) setTenantColor(d.tenant_color);
        if (d.tenant_logo) setTenantLogo(d.tenant_logo);
        if (d.status === 'submitted') { setStatus('already_submitted'); return; }
        setStatus('open');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!akkoord) { setError('U dient akkoord te gaan met de algemene voorwaarden.'); return; }
    if (sigRef.current?.isEmpty()) { setError('Zet uw handtekening om verder te gaan.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const handtekeningKlant = sigRef.current.toDataURL('image/png');
      const res = await fetch(`/api/intake/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voornaam, achternaam, straat, postcode, woonplaats,
          geboortedatum, telefoon, email, documentnummer, rijbewijsAfgiftedatum,
          akkoord: true, handtekeningKlant,
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
    padding: '5rem 1rem 2rem',
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
            Deze link bestaat niet of is verlopen.{tenantName ? ` Neem contact op met ${tenantName}.` : ''}
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
            Uw gegevens en handtekening zijn ontvangen{tenantName ? ` door ${tenantName}` : ''}.<br />
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
            background: `${tenantColor}18`,
            border: `1px solid ${tenantColor}40`,
            borderRadius: 20, padding: '0.3rem 0.9rem',
            fontSize: '0.75rem', color: tenantColor, fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            {tenantLogo
              ? <img src={tenantLogo} alt="" style={{ height: 16, objectFit: 'contain', borderRadius: 2 }} />
              : '🚗'}
            {tenantName || 'Autoverhuur'}
          </div>
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
            <Field label="E-mailadres" value={email} onChange={setEmail} type="email" required />
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
              <Field label="Rijbewijs afgiftedatum" value={rijbewijsAfgiftedatum} onChange={setRijbewijsAfgiftedatum} type="date" required />
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '1rem',
            marginTop: '0.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>
                Akkoordverklaring
              </p>
              <div
                onClick={() => setAkkoord(v => !v)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  cursor: 'pointer', userSelect: 'none',
                  background: akkoord ? `${tenantColor}12` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${akkoord ? `${tenantColor}50` : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 10, padding: '0.85rem 1rem',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  background: akkoord ? tenantColor : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${akkoord ? tenantColor : 'rgba(255,255,255,0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {akkoord && <span style={{ color: '#1a0f00', fontSize: '0.75rem', fontWeight: 900 }}>✓</span>}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.83rem', lineHeight: 1.55, margin: 0 }}>
                  Ik verklaar dat de bovenstaande gegevens correct zijn en ga akkoord met de{' '}
                  <strong style={{ color: 'rgba(255,255,255,0.85)' }}>algemene voorwaarden</strong>{' '}
                  {tenantName ? `van ${tenantName}. ` : ''}Door te ondertekenen bevestig ik dat ik het voertuig in goede staat heb ontvangen en mij houd aan de gemaakte afspraken.
                </p>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>
                Handtekening <span style={{ color: '#e8b84b' }}>*</span>
              </p>
              <div style={{
                borderRadius: 10,
                border: `1px solid ${sigEmpty ? 'rgba(255,255,255,0.15)' : `${tenantColor}60`}`,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.96)',
                position: 'relative',
              }}>
                <SignatureCanvas
                  ref={sigRef}
                  penColor="#111"
                  canvasProps={{ style: { width: '100%', height: 150, display: 'block', touchAction: 'none' } }}
                  onEnd={() => setSigEmpty(sigRef.current?.isEmpty() ?? true)}
                />
                {sigEmpty && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                    color: 'rgba(0,0,0,0.2)', fontSize: '0.82rem', fontStyle: 'italic',
                  }}>
                    Teken hier uw handtekening
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => { sigRef.current?.clear(); setSigEmpty(true); }}
                style={{
                  marginTop: '0.4rem',
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem',
                  cursor: 'pointer', padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Opnieuw tekenen
              </button>
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
              background: submitting ? `${tenantColor}50` : `linear-gradient(135deg, ${tenantColor}, ${tenantColor}bb)`,
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
            {submitting ? 'Versturen…' : 'Gegevens en handtekening versturen →'}
          </button>
        </form>
      </div>
    </div>
  );
}
