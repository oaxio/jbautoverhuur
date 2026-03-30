"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TextField } from '@mui/material';

const BRANDSTOF_OPTIES = ['Benzine', 'Diesel', 'Elektrisch', 'Hybride', 'LPG'];

function CarForm({ initial, onSave, onCancel }) {
  const [autogegevens, setAutogegevens] = useState(initial?.autogegevens || '');
  const [kenteken, setKenteken] = useState(initial?.kenteken || '');
  const [kleur, setKleur] = useState(initial?.kleur || '');
  const [brandstof, setBrandstof] = useState(initial?.brandstof || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ autogegevens, kenteken, kleur, brandstof });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem 1.5rem', marginBottom: '1.25rem' }}>
        <TextField variant="standard" label="Autogegevens (merk/model)" value={autogegevens} onChange={e => setAutogegevens(e.target.value)} required fullWidth />
        <TextField variant="standard" label="Kenteken" value={kenteken} onChange={e => setKenteken(e.target.value.toUpperCase())} required fullWidth inputProps={{ style: { textTransform: 'uppercase' } }} />
        <TextField variant="standard" label="Kleur" value={kleur} onChange={e => setKleur(e.target.value)} fullWidth />
        <TextField
          variant="standard"
          label="Brandstof"
          value={brandstof}
          onChange={e => setBrandstof(e.target.value)}
          fullWidth
          select
          SelectProps={{ native: true }}
        >
          <option value=""></option>
          {BRANDSTOF_OPTIES.map(o => <option key={o} value={o}>{o}</option>)}
        </TextField>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="submit" style={{
          background: 'linear-gradient(135deg, #e8b84b, #d4a033)',
          color: '#000', border: 'none', borderRadius: 8,
          padding: '0.6rem 1.5rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
        }}>
          {initial ? 'Opslaan' : 'Auto toevoegen'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)', borderRadius: 8,
            padding: '0.6rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer',
          }}>
            Annuleren
          </button>
        )}
      </div>
    </form>
  );
}

export default function AutosPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const loadCars = async () => {
    const res = await fetch('/api/cars');
    if (res.ok) setCars(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadCars(); }, []);

  const handleAdd = async (data) => {
    const res = await fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) { setShowForm(false); await loadCars(); }
  };

  const handleEdit = async (id, data) => {
    const res = await fetch(`/api/cars/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) { setEditingId(null); await loadCars(); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Auto verwijderen?')) return;
    await fetch(`/api/cars/${id}`, { method: 'DELETE' });
    await loadCars();
  };

  return (
    <main style={{ position: 'relative', zIndex: 1, padding: '5.5rem 1rem 3rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.75rem' }}>
            ← Terug
          </Link>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', letterSpacing: '-0.01em', marginBottom: '0.3rem' }}>
            Voertuigbeheer
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Sla voertuiggegevens op zodat je ze snel kunt laden bij een nieuw contract.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showForm ? '1.5rem' : 0 }}>
            <div className="section-header" style={{ margin: 0 }}>🚗 Voertuigen</div>
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{
                background: 'linear-gradient(135deg, #e8b84b, #d4a033)',
                color: '#000', border: 'none', borderRadius: 8,
                padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}>
                + Toevoegen
              </button>
            )}
          </div>

          {showForm && (
            <CarForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Laden...</div>
        ) : cars.length === 0 ? (
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>
            Nog geen voertuigen opgeslagen. Klik op "+ Toevoegen" om te beginnen.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cars.map(car => (
              <div key={car.id} className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
                {editingId === car.id ? (
                  <CarForm
                    initial={car}
                    onSave={(data) => handleEdit(car.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>
                        {car.autogegevens}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>🔑 {car.kenteken}</span>
                        {car.kleur && <span>🎨 {car.kleur}</span>}
                        {car.brandstof && <span>⛽ {car.brandstof}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button onClick={() => setEditingId(car.id)} style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.6)', borderRadius: 7,
                        padding: '0.35rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer',
                      }}>
                        Bewerken
                      </button>
                      <button onClick={() => handleDelete(car.id)} style={{
                        background: 'rgba(220,50,50,0.08)', border: '1px solid rgba(220,50,50,0.2)',
                        color: 'rgba(255,100,100,0.8)', borderRadius: 7,
                        padding: '0.35rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer',
                      }}>
                        Verwijderen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
