"use client"
import { useState, useEffect } from 'react';

const GOLD = '#e8b84b';

function InputField({ label, value, onChange, placeholder, hint, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${focused ? 'rgba(232,184,75,0.4)' : 'rgba(255,255,255,0.14)'}`,
          borderRadius: 10, color: 'white',
          padding: '0.65rem 0.9rem', fontSize: '0.88rem',
          outline: 'none', width: '100%', boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {hint && <p style={{ margin: 0, fontSize: '0.77rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function ColorPicker({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(e.target.value)}
          style={{ width: 42, height: 42, borderRadius: 8, border: '1px solid rgba(255,255,255,0.14)', background: 'none', cursor: 'pointer', padding: 3, flexShrink: 0 }}
        />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder="#rrggbb"
          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, color: 'white', padding: '0.6rem 0.9rem', fontSize: '0.95rem', outline: 'none', minWidth: 0, fontFamily: 'monospace' }}
        />
        <div style={{ width: 42, height: 42, borderRadius: 8, background: value || '#000', border: '1px solid rgba(255,255,255,0.18)', flexShrink: 0, boxShadow: `0 0 12px ${value || '#000'}44` }} />
      </div>
    </div>
  );
}

function TextAreaField({ label, hint, value, onChange, rows = 6, placeholder = '' }) {
  const lines = (value || '').split('\n').length;
  const chars = (value || '').length;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </label>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
          {lines} regel{lines !== 1 ? 's' : ''} · {chars} tekens
        </span>
      </div>
      {hint && <p style={{ margin: 0, fontSize: '0.77rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.5 }}>{hint}</p>}
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        style={{
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          color: 'rgba(255,255,255,0.88)',
          padding: '0.85rem 1rem',
          fontSize: '0.83rem',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", monospace',
          lineHeight: 1.6,
          width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(232,184,75,0.4)'; }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
      />
    </div>
  );
}

const TABS = [
  { id: 'huisstijl',        label: 'Huisstijl',         icon: '🎨' },
  { id: 'bedrijfsgegevens', label: 'Bedrijfsgegevens',  icon: '🏢' },
  { id: 'contractteksten',  label: 'Contractteksten',   icon: '📄' },
];

export default function InstellingenPage() {
  const [tab, setTab] = useState('huisstijl');
  const [form, setForm] = useState({
    primary_color: '#e8b84b',
    bg_color: '#0a0a14',
    bg_image_url: '',
    logo_url: '',
    contract_bullets: '',
    contract_terms: '',
    bedrijf_adres: '',
    bedrijf_telefoon: '',
    bedrijf_email: '',
    bedrijf_website: '',
    bedrijf_kvk: '',
  });
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/tenant/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        const vals = {
          primary_color:    data.primary_color    || '#e8b84b',
          bg_color:         data.bg_color         || '#0a0a14',
          bg_image_url:     data.bg_image_url     || '',
          logo_url:         data.logo_url         || '',
          contract_bullets: data.contract_bullets || '',
          contract_terms:   data.contract_terms   || '',
          bedrijf_adres:    data.bedrijf_adres    || '',
          bedrijf_telefoon: data.bedrijf_telefoon || '',
          bedrijf_email:    data.bedrijf_email    || '',
          bedrijf_website:  data.bedrijf_website  || '',
          bedrijf_kvk:      data.bedrijf_kvk      || '',
        };
        setForm(vals);
        setOriginal(vals);
      })
      .catch(() => setError('Kon instellingen niet laden'))
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/tenant/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Opslaan mislukt');
      setOriginal(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const isDirty = original && Object.keys(form).some(k => form[k] !== original[k]);
  const primaryColor = form.primary_color || GOLD;
  const bgColor = form.bg_color || '#0a0a14';

  const SaveBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.25rem' }}>
      <button
        onClick={save}
        disabled={saving || !isDirty}
        style={{
          background: isDirty ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)` : 'rgba(255,255,255,0.08)',
          color: isDirty ? '#000' : 'rgba(255,255,255,0.3)',
          fontWeight: 700, fontSize: '0.9rem',
          padding: '0.65rem 1.75rem', borderRadius: 10, border: 'none',
          cursor: isDirty && !saving ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        {saving ? 'Opslaan…' : 'Opslaan'}
      </button>
      {saved && <span style={{ color: '#50c878', fontSize: '0.85rem', fontWeight: 600 }}>✓ Opgeslagen</span>}
      {error && <span style={{ color: '#ff7070', fontSize: '0.83rem' }}>{error}</span>}
      {isDirty && !saving && (
        <button
          onClick={() => { setForm(original); setError(''); }}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.83rem', cursor: 'pointer', padding: '0.4rem 0.75rem' }}
        >
          Annuleren
        </button>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '5rem 1rem 3rem' }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>

        {/* Pagina-titel */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 0.3rem' }}>
            Instellingen
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem', margin: 0 }}>
            Pas de huisstijl, bedrijfsgegevens en contractteksten aan
          </p>
        </div>

        {/* Tab-balk */}
        <div style={{
          display: 'flex', gap: '0.25rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 14, padding: '0.3rem',
          marginBottom: '1.5rem',
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                background: tab === t.id
                  ? `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}11)`
                  : 'transparent',
                border: tab === t.id
                  ? `1px solid ${primaryColor}44`
                  : '1px solid transparent',
                borderRadius: 10,
                color: tab === t.id ? primaryColor : 'rgba(255,255,255,0.4)',
                fontWeight: tab === t.id ? 700 : 500,
                fontSize: '0.875rem',
                padding: '0.6rem 0.5rem',
                cursor: 'pointer',
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${primaryColor}33`, borderTopColor: primaryColor, animation: 'spin 0.7s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* ── TAB: Huisstijl ── */}
            {tab === 'huisstijl' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Live preview */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <p className="section-header" style={{ marginBottom: '1rem' }}>Voorbeeld</p>
                  <div style={{
                    borderRadius: 12, overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundImage: form.bg_image_url
                      ? `linear-gradient(135deg, ${bgColor}d4 0%, ${bgColor}e8 100%), url(${form.bg_image_url})`
                      : `linear-gradient(135deg, ${bgColor}d4 0%, ${bgColor}e8 100%)`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
                  }}>
                    {form.logo_url ? (
                      <img src={form.logo_url} alt="logo" style={{ height: 40, maxWidth: 120, objectFit: 'contain', borderRadius: 4 }} onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${primaryColor}22`, border: `1.5px solid ${primaryColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor, fontWeight: 800, fontSize: '1rem' }}>
                        JB
                      </div>
                    )}
                    <div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Jouw portaal</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>Zo ziet de loginpagina eruit</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <div style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`, color: '#000', fontWeight: 700, fontSize: '0.78rem', padding: '0.4rem 1rem', borderRadius: 8 }}>
                        Inloggen →
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kleuren + logo */}
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                  <p className="section-header" style={{ marginBottom: 0 }}>Kleuren &amp; Logo</p>
                  <ColorPicker label="Accentkleur" value={form.primary_color} onChange={set('primary_color')} />
                  <ColorPicker label="Achtergrondkleur (overlay)" value={form.bg_color} onChange={set('bg_color')} />
                  <InputField
                    label="Achtergrondafbeelding URL"
                    value={form.bg_image_url}
                    onChange={set('bg_image_url')}
                    placeholder="https://jouwbedrijf.nl/background.jpg"
                    hint="Directe URL naar een afbeelding (JPG, PNG, WebP). Leeg laten voor de standaard achtergrond."
                  />
                  <InputField
                    label="Logo URL"
                    value={form.logo_url}
                    onChange={set('logo_url')}
                    placeholder="https://jouwbedrijf.nl/logo.png"
                    hint="Directe URL naar een PNG- of SVG-afbeelding. Verschijnt in de app-header, op het loginscherm en in elk huurcontract."
                  />
                  <SaveBar />
                </div>
              </div>
            )}

            {/* ── TAB: Bedrijfsgegevens ── */}
            {tab === 'bedrijfsgegevens' && (
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <p className="section-header" style={{ marginBottom: '0.25rem' }}>Bedrijfsgegevens</p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                    Worden weergegeven in de header van elk huurcontract.
                  </p>
                </div>
                {[
                  { key: 'bedrijf_adres',    label: 'Adres',         placeholder: 'Straatnaam 1, 1234 AB Stad' },
                  { key: 'bedrijf_telefoon', label: 'Telefoonnummer', placeholder: '+31 6 12345678' },
                  { key: 'bedrijf_email',    label: 'E-mailadres',   placeholder: 'info@jouwbedrijf.nl' },
                  { key: 'bedrijf_website',  label: 'Website',       placeholder: 'www.jouwbedrijf.nl' },
                  { key: 'bedrijf_kvk',      label: 'KVK-nummer',    placeholder: '12345678' },
                ].map(({ key, label, placeholder }) => (
                  <InputField key={key} label={label} value={form[key]} onChange={set(key)} placeholder={placeholder} />
                ))}
                <SaveBar />
              </div>
            )}

            {/* ── TAB: Contractteksten ── */}
            {tab === 'contractteksten' && (
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <p className="section-header" style={{ marginBottom: '0.25rem' }}>Contractteksten</p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                    Deze teksten worden opgenomen in elk gegenereerd huurcontract.
                  </p>
                </div>
                <TextAreaField
                  label="Bulletpoints (Voorwaarden — pagina 1)"
                  hint="Elke regel is een bulletpoint onderaan het contract. Leeg laten voor de ingebouwde standaardtekst."
                  rows={8}
                  value={form.contract_bullets}
                  onChange={set('contract_bullets')}
                  placeholder={`Eigen risico per gebeurtenis: EUR 5.000,-\nBorg: EUR 2.500,-\nExtra kilometers a EUR 1,- per km\nRoken verboden - bij constatering EUR 250,-\nTe laat inleveren: EUR 100,- per uur\nAuto vuil ingeleverd: EUR 25,- schoonmaakkosten`}
                />
                <TextAreaField
                  label="Algemene Voorwaarden (pagina 2 van het contract)"
                  hint="Volledige tekst van de algemene voorwaarden. Regels die beginnen met 'ARTIKEL' worden als kopje opgemaakt. Leeg laten om geen tweede pagina toe te voegen."
                  rows={22}
                  value={form.contract_terms}
                  onChange={set('contract_terms')}
                  placeholder={`ARTIKEL 1 TOEPASSELIJKHEID\nDeze Algemene Voorwaarden zijn van toepassing op alle overeenkomsten van huur en verhuur van voertuigen...\n\nARTIKEL 2 HET AANBOD\n1. Verhuurder brengt een aanbod schriftelijk of mondeling uit...\n\n...`}
                />
                <SaveBar />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
