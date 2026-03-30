"use client"
import { useState, useEffect, useCallback } from 'react';

const COLORS = [
  '#e8b84b', '#4b9ee8', '#e84b6b', '#4be87a', '#b84be8',
  '#e8774b', '#4be8d4', '#e8e84b', '#4b4be8', '#e84bb8',
];

function getColor(index) { return COLORS[index % COLORS.length]; }

function fmtDateISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDateNL(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div style={{
        background: 'rgba(20,16,8,0.97)',
        border: '1px solid rgba(232,184,75,0.25)',
        borderRadius: 16, padding: '2rem',
        width: '100%', maxWidth: 460,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  color: 'white',
  padding: '0.6rem 0.85rem',
  fontSize: '0.9rem',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
};

export default function PlanningPage() {
  const [cars, setCars] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [viewStart, setViewStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ car_id: '', customer_name: '', start_date: '', end_date: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const [carsRes, resRes] = await Promise.all([
      fetch('/api/cars').then(r => r.json()),
      fetch('/api/reservations').then(r => r.json()),
    ]);
    setCars(Array.isArray(carsRes) ? carsRes : []);
    setReservations(Array.isArray(resRes) ? resRes : []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const daysInView = 35;
  const days = Array.from({ length: daysInView }, (_, i) => addDays(viewStart, i));
  const todayISO = fmtDateISO(new Date());

  const prevMonth = () => setViewStart(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); n.setDate(1); return n; });
  const nextMonth = () => setViewStart(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); n.setDate(1); return n; });

  const openAdd = (carId = '', startDate = '') => {
    setForm({ car_id: carId ? String(carId) : (cars[0] ? String(cars[0].id) : ''), customer_name: '', start_date: startDate, end_date: startDate, notes: '' });
    setModal({ type: 'add' });
  };

  const openEdit = (res) => {
    setForm({
      car_id: String(res.car_id),
      customer_name: res.customer_name,
      start_date: res.start_date?.split('T')[0] || res.start_date,
      end_date: res.end_date?.split('T')[0] || res.end_date,
      notes: res.notes || '',
    });
    setModal({ type: 'edit', id: res.id });
  };

  const saveReservation = async () => {
    setSaving(true);
    try {
      const url = modal.type === 'edit' ? `/api/reservations/${modal.id}` : '/api/reservations';
      const method = modal.type === 'edit' ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, car_id: parseInt(form.car_id) }),
      });
      if (res.ok) { setModal(null); load(); }
    } catch {}
    setSaving(false);
  };

  const deleteReservation = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/reservations/${modal.id}`, { method: 'DELETE' });
      setModal(null);
      load();
    } catch {}
    setDeleting(false);
  };

  const viewStartISO = fmtDateISO(viewStart);
  const viewEndISO = fmtDateISO(days[days.length - 1]);

  const monthLabel = viewStart.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });

  const DAY_W = 34;
  const ROW_H = 52;
  const LABEL_W = 160;

  return (
    <div style={{ minHeight: '100vh', padding: '6rem 1rem 3rem', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <a href="/" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'block', marginBottom: '0.4rem' }}>← Terug</a>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', marginBottom: '0.2rem' }}>Planning</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Overzicht van verhuringen per voertuig</p>
        </div>
        <button
          onClick={() => openAdd()}
          style={{
            background: 'linear-gradient(135deg, #e8b84b, #c9962e)',
            color: '#1a0f00', border: 'none', borderRadius: 10,
            padding: '0.7rem 1.4rem', fontWeight: 700, fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          + Reservering toevoegen
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <button onClick={prevMonth} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: 'white', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '1rem' }}>‹</button>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize', minWidth: 160, textAlign: 'center' }}>{monthLabel}</span>
          <button onClick={nextMonth} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: 'white', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '1rem' }}>›</button>
        </div>

        {cars.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '3rem 0', fontSize: '0.9rem' }}>
            Geen voertuigen gevonden. <a href="/autos" style={{ color: '#e8b84b', textDecoration: 'none' }}>Voeg eerst voertuigen toe →</a>
          </p>
        ) : (
          <div style={{ minWidth: LABEL_W + DAY_W * daysInView }}>
            <div style={{ display: 'flex', marginLeft: LABEL_W }}>
              {days.map((d, i) => {
                const iso = fmtDateISO(d);
                const isToday = iso === todayISO;
                const isFirst = d.getDate() === 1;
                return (
                  <div key={i} style={{
                    width: DAY_W, flexShrink: 0, textAlign: 'center',
                    fontSize: '0.65rem',
                    color: isToday ? '#e8b84b' : d.getMonth() === viewStart.getMonth() ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                    fontWeight: isToday ? 700 : isFirst ? 600 : 400,
                    paddingBottom: '0.4rem',
                    borderLeft: isFirst ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    position: 'relative',
                  }}>
                    {isFirst && <span style={{ position: 'absolute', top: -16, left: 2, fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{d.toLocaleDateString('nl-NL', { month: 'short' })}</span>}
                    {d.getDate()}
                  </div>
                );
              })}
            </div>

            {cars.map((car, carIdx) => {
              const carReservations = reservations.filter(r => r.car_id === car.id);
              return (
                <div key={car.id} style={{ display: 'flex', height: ROW_H, borderTop: '1px solid rgba(255,255,255,0.06)', alignItems: 'center', position: 'relative' }}>
                  <div style={{
                    width: LABEL_W, flexShrink: 0, paddingRight: '0.75rem',
                    overflow: 'hidden',
                  }}>
                    <div style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {car.autogegevens}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{car.kenteken}</div>
                  </div>

                  <div style={{ position: 'relative', flex: 1, height: '100%' }}>
                    {days.map((d, i) => {
                      const iso = fmtDateISO(d);
                      const isToday = iso === todayISO;
                      return (
                        <div
                          key={i}
                          onClick={() => openAdd(car.id, iso)}
                          title="Klik om te reserveren"
                          style={{
                            position: 'absolute', left: i * DAY_W, top: 0,
                            width: DAY_W, height: '100%',
                            background: isToday ? 'rgba(232,184,75,0.05)' : 'transparent',
                            borderLeft: d.getDate() === 1 ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                          }}
                        />
                      );
                    })}

                    {carReservations.map((res, resIdx) => {
                      const resStart = res.start_date?.split('T')[0] || res.start_date;
                      const resEnd = res.end_date?.split('T')[0] || res.end_date;
                      const startOffset = daysBetween(viewStartISO, resStart);
                      const endOffset = daysBetween(viewStartISO, resEnd);
                      const clampedStart = Math.max(0, startOffset);
                      const clampedEnd = Math.min(daysInView - 1, endOffset);
                      if (clampedEnd < 0 || clampedStart >= daysInView) return null;
                      const spanDays = clampedEnd - clampedStart + 1;
                      if (spanDays <= 0) return null;
                      const color = getColor(carIdx * 3 + resIdx);
                      return (
                        <div
                          key={res.id}
                          onClick={e => { e.stopPropagation(); openEdit(res); }}
                          title={`${res.customer_name} | ${fmtDateNL(resStart)} – ${fmtDateNL(resEnd)}${res.notes ? '\n' + res.notes : ''}`}
                          style={{
                            position: 'absolute',
                            left: clampedStart * DAY_W + 2,
                            top: '50%', transform: 'translateY(-50%)',
                            width: spanDays * DAY_W - 4,
                            height: 30,
                            background: `${color}22`,
                            border: `1.5px solid ${color}88`,
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                            padding: '0 0.4rem',
                            overflow: 'hidden',
                            zIndex: 2,
                          }}
                        >
                          <span style={{ fontSize: '0.68rem', color, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {res.customer_name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal.type === 'add' ? 'Reservering toevoegen' : 'Reservering bewerken'} onClose={() => setModal(null)}>
          <Field label="Voertuig">
            <select value={form.car_id} onChange={e => setForm(f => ({ ...f, car_id: e.target.value }))} style={{ ...inputStyle, appearance: 'none' }}>
              {cars.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#1a1a1a' }}>
                  {c.autogegevens} — {c.kenteken}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Klantnaam *">
            <input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} style={inputStyle} placeholder="Voornaam Achternaam" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Field label="Startdatum *">
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Einddatum *">
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={inputStyle} />
            </Field>
          </div>
          <Field label="Notities">
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={inputStyle} placeholder="Optioneel" />
          </Field>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              onClick={saveReservation}
              disabled={saving || !form.customer_name || !form.start_date || !form.end_date}
              style={{
                flex: 1,
                background: saving ? 'rgba(232,184,75,0.3)' : 'linear-gradient(135deg, #e8b84b, #c9962e)',
                color: saving ? 'rgba(255,255,255,0.4)' : '#1a0f00',
                border: 'none', borderRadius: 9,
                padding: '0.7rem', fontWeight: 700, fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Opslaan…' : 'Opslaan'}
            </button>
            {modal.type === 'edit' && (
              <button
                onClick={deleteReservation}
                disabled={deleting}
                style={{
                  background: 'rgba(255,60,60,0.1)',
                  border: '1px solid rgba(255,60,60,0.3)',
                  color: '#ff6b6b', borderRadius: 9,
                  padding: '0.7rem 1rem', fontWeight: 700, fontSize: '0.9rem',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? '…' : 'Verwijderen'}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
