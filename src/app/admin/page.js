"use client"
import { useState, useEffect, useCallback } from 'react';

const GOLD = '#e8b84b';
const G = (op) => `rgba(232,184,75,${op})`;

const api = async (path, method = 'GET', body) => {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
};

const Badge = ({ children, color = 'rgba(255,255,255,0.15)' }) => (
  <span style={{ fontSize: '0.68rem', background: color, borderRadius: 99, padding: '0.15rem 0.55rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
    {children}
  </span>
);

const Btn = ({ children, onClick, variant = 'ghost', disabled, style: s }) => {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${GOLD}, #c9962e)`, color: '#1a0f00', border: 'none' },
    danger: { background: 'rgba(255,80,80,0.15)', color: '#ff7070', border: '1px solid rgba(255,80,80,0.3)' },
    ghost: { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)' },
    gold: { background: G(0.12), color: GOLD, border: `1px solid ${G(0.3)}` },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...styles[variant], borderRadius: 8, padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...s }}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = 'text', placeholder, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
      {label}{required && <span style={{ color: GOLD }}> *</span>}
    </label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, color: 'white', padding: '0.55rem 0.8rem', fontSize: '0.88rem', outline: 'none', width: '100%' }} />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, color: 'white', padding: '0.55rem 0.8rem', fontSize: '0.88rem', outline: 'none' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Modal = ({ title, onClose, children, width = 500 }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const statusColor = (s) => s === 'active' ? 'rgba(80,200,120,0.25)' : 'rgba(255,80,80,0.18)';

// ─────────────────────────────────────────────────────────────────────────────
// TENANT FORM
// ─────────────────────────────────────────────────────────────────────────────
function TenantForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ name: '', slug: '', status: 'active', primary_color: '#e8b84b', billing_plan: 'free', logo_url: '', custom_domain: '', ...initial });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const save = async () => {
    setSaving(true); setErr('');
    try {
      if (initial?.id) {
        await api(`/api/admin/tenants/${initial.id}`, 'PUT', form);
      } else {
        await api('/api/admin/tenants', 'POST', form);
      }
      onSave();
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <Input label="Naam" value={form.name} onChange={v => { set('name')(v); if (!initial?.id) set('slug')(autoSlug(v)); }} required />
      <Input label="Slug" value={form.slug} onChange={set('slug')} placeholder="mijn-bedrijf" required />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Select label="Status" value={form.status} onChange={set('status')} options={[{ value: 'active', label: 'Actief' }, { value: 'inactive', label: 'Inactief' }, { value: 'suspended', label: 'Gesuspendeerd' }]} />
        <Select label="Billing plan" value={form.billing_plan} onChange={set('billing_plan')} options={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }, { value: 'enterprise', label: 'Enterprise' }]} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Input label="Kleurcode" value={form.primary_color} onChange={set('primary_color')} placeholder="#e8b84b" />
        <Input label="Logo URL" value={form.logo_url} onChange={set('logo_url')} placeholder="https://..." />
      </div>
      <Input label="Eigen domein / subdomein" value={form.custom_domain} onChange={set('custom_domain')} placeholder="verhuur.mijnbedrijf.nl" />
      {err && <p style={{ color: '#ff7070', fontSize: '0.82rem', margin: 0 }}>{err}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
        <Btn onClick={onClose}>Annuleren</Btn>
        <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'Opslaan…' : 'Opslaan'}</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TENANTS TAB
// ─────────────────────────────────────────────────────────────────────────────
function TenantsTab() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTenants(await api('/api/admin/tenants')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = async (id) => {
    if (!confirm('Tenant verwijderen? Dit verwijdert ook alle gekoppelde data.')) return;
    setDeleting(id);
    try { await api(`/api/admin/tenants/${id}`, 'DELETE'); await load(); } catch (e) { alert(e.message); }
    setDeleting(null);
  };

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Zoeken op naam of slug…"
          style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', padding: '0.5rem 0.85rem', fontSize: '0.85rem', outline: 'none' }} />
        <Btn variant="primary" onClick={() => setModal({ type: 'create' })}>+ Nieuwe tenant</Btn>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem' }}>Laden…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem' }}>Geen tenants gevonden</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map(t => (
            <div key={t.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.primary_color || GOLD, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{t.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '0.1rem' }}>{t.slug}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                <Badge color={statusColor(t.status)}>{t.status}</Badge>
                <Badge>{t.billing_plan}</Badge>
                <Badge color="rgba(100,160,255,0.2)">{t.member_count} leden</Badge>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                <Btn onClick={() => setModal({ type: 'edit', tenant: t })}>Bewerken</Btn>
                <Btn variant="danger" onClick={() => del(t.id)} disabled={deleting === t.id}>{deleting === t.id ? '…' : 'Verwijder'}</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal?.type === 'create' && (
        <Modal title="Nieuwe tenant" onClose={() => setModal(null)}>
          <TenantForm onSave={() => { setModal(null); load(); }} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Tenant bewerken" onClose={() => setModal(null)}>
          <TenantForm initial={modal.tenant} onSave={() => { setModal(null); load(); }} onClose={() => setModal(null)} />
        </Modal>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function UserModal({ user, tenants, onClose, onRefresh }) {
  const [adding, setAdding] = useState(false);
  const [newTenantId, setNewTenantId] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const addMembership = async () => {
    if (!newTenantId) return;
    setSaving(true); setErr('');
    try {
      await api('/api/admin/memberships', 'POST', { user_id: user.id, tenant_id: Number(newTenantId), role: newRole });
      onRefresh();
      setAdding(false); setNewTenantId('');
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const removeMembership = async (membershipId) => {
    if (!confirm('Koppeling verwijderen?')) return;
    try { await api(`/api/admin/memberships/${membershipId}`, 'DELETE'); onRefresh(); }
    catch (e) { alert(e.message); }
  };

  const updateRole = async (membershipId, role) => {
    try { await api(`/api/admin/memberships/${membershipId}`, 'PATCH', { role }); onRefresh(); }
    catch (e) { alert(e.message); }
  };

  const toggleSuperAdmin = async () => {
    try { await api(`/api/admin/users/${user.id}`, 'PATCH', { is_super_admin: !user.is_super_admin }); onRefresh(); }
    catch (e) { alert(e.message); }
  };

  const roles = ['member', 'staff', 'tenant_admin', 'viewer'];

  return (
    <Modal title="Gebruiker details" onClose={onClose} width={560}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
        {user.profile_image_url && <img src={user.profile_image_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontWeight: 700 }}>{user.name || '–'}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{user.email}</div>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', fontFamily: 'monospace', marginTop: '0.1rem' }}>{user.replit_sub}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
          {user.is_super_admin && <Badge color="rgba(232,184,75,0.25)">⭐ Super Admin</Badge>}
          <Btn variant={user.is_super_admin ? 'danger' : 'gold'} onClick={toggleSuperAdmin} style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
            {user.is_super_admin ? 'Super admin intrekken' : 'Super admin maken'}
          </Btn>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Tenant-koppelingen</p>
          <Btn variant="gold" onClick={() => setAdding(v => !v)} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}>+ Tenant toevoegen</Btn>
        </div>

        {adding && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <Select label="Tenant" value={newTenantId} onChange={setNewTenantId}
                options={[{ value: '', label: 'Selecteer tenant…' }, ...tenants.map(t => ({ value: String(t.id), label: t.name }))]} />
            </div>
            <div style={{ width: 130 }}>
              <Select label="Rol" value={newRole} onChange={setNewRole}
                options={roles.map(r => ({ value: r, label: r }))} />
            </div>
            <Btn variant="primary" onClick={addMembership} disabled={saving || !newTenantId}>{saving ? '…' : 'Koppelen'}</Btn>
          </div>
        )}
        {err && <p style={{ color: '#ff7070', fontSize: '0.8rem', margin: '0 0 0.5rem' }}>{err}</p>}

        {(user.tenants?.length ?? 0) === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.82rem', margin: 0 }}>Geen tenant-koppelingen</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {user.tenants.map(m => (
              <div key={m.membership_id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                <div style={{ flex: 1, color: 'white', fontSize: '0.85rem', fontWeight: 500 }}>{m.tenant_name}</div>
                <select value={m.role} onChange={e => updateRole(m.membership_id, e.target.value)}
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'rgba(255,255,255,0.7)', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <Btn variant="danger" onClick={() => removeMembership(m.membership_id)} style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}>✕</Btn>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS TAB
// ─────────────────────────────────────────────────────────────────────────────
function UsersTab({ tenants }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setUsers(await api('/api/admin/users')); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const refreshSelected = async () => {
    await load();
    if (selected) {
      try {
        const updated = await api(`/api/admin/users/${selected.id}`);
        setSelected(updated);
      } catch {}
    }
  };

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Zoeken op naam of e-mail…"
          style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'white', padding: '0.5rem 0.85rem', fontSize: '0.85rem', outline: 'none' }} />
      </div>
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', margin: '0 0 0.75rem' }}>
        Alleen gebruikers die minimaal één keer hebben ingelogd verschijnen hier.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem' }}>Laden…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem' }}>Geen gebruikers gevonden</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {filtered.map(u => (
            <div key={u.id} onClick={() => setSelected(u)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = G(0.3)}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
              {u.profile_image_url ? (
                <img src={u.profile_image_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: G(0.15), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>👤</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{u.name || 'Onbekend'}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{u.email || '–'}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
                {u.is_super_admin && <Badge color={G(0.2)}>⭐ Admin</Badge>}
                {(u.tenants?.length ?? 0) > 0 ? (
                  <Badge color="rgba(100,160,255,0.18)">{u.tenants.length} tenant{u.tenants.length !== 1 ? 's' : ''}</Badge>
                ) : (
                  <Badge color="rgba(255,255,255,0.08)">Geen tenant</Badge>
                )}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>›</div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <UserModal user={selected} tenants={tenants} onClose={() => setSelected(null)} onRefresh={refreshSelected} />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState('tenants');
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    fetch('/api/auth/user', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.isSuperAdmin) {
          window.location.href = '/';
          return;
        }
        setUser(data);
        setChecking(false);
      })
      .catch(() => { window.location.href = '/'; });
  }, []);

  useEffect(() => {
    if (!checking) {
      api('/api/admin/tenants').then(setTenants).catch(() => {});
    }
  }, [checking]);

  if (checking) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${G(0.2)}`, borderTopColor: GOLD, animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const tabs = [
    { id: 'tenants', label: '🏢 Tenants' },
    { id: 'users', label: '👥 Gebruikers' },
  ];

  return (
    <main style={{ minHeight: '100vh', paddingTop: '5rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.25rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: G(0.1), border: `1px solid ${G(0.25)}`, borderRadius: 20, padding: '0.25rem 0.85rem', fontSize: '0.72rem', color: GOLD, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            ⭐ Super Admin Paneel
          </div>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', margin: 0 }}>Platformbeheer</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', margin: '0.4rem 0 0' }}>
            Ingelogd als <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{user?.email}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.3rem', width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background: tab === t.id ? G(0.15) : 'transparent', border: tab === t.id ? `1px solid ${G(0.3)}` : '1px solid transparent', borderRadius: 7, color: tab === t.id ? GOLD : 'rgba(255,255,255,0.45)', padding: '0.45rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          {tab === 'tenants' && <TenantsTab />}
          {tab === 'users' && <UsersTab tenants={tenants} />}
        </div>

      </div>
    </main>
  );
}
