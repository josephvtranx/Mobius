// Credit packages management (2026-08-20): the academy defines its own
// bundles (name, credits, bonus, price) here; the Payments page and the
// add-student wizard list the active ones, and recording a payment against
// a package credits the wallet server-side. Retiring is soft (is_active) so
// old payments keep their package reference. Neutral roster look (rt-*).
import { useEffect, useState } from 'react';
import packageService from '@/services/packageService';
import Modal from '@/components/Modal';
import '@/css/roster.css';

const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const GRID = { gridTemplateColumns: 'minmax(0,1.3fr) 110px 110px 120px 110px 150px' };
const EMPTY_FORM = { name: '', credits: '', bonus_credits: '0', price: '' };
const fieldLabel = { display: 'block', fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#97a0b1', marginBottom: 6 };

function Packages() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | package row
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const load = () =>
    packageService.getPackages(true).then(setRows)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load packages'));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY_FORM); setEditing('new'); setNotice(''); };
  const openEdit = (p) => {
    setForm({ name: p.name, credits: String(p.credits), bonus_credits: String(p.bonus_credits), price: String(p.price) });
    setEditing(p);
    setNotice('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        credits: Number(form.credits),
        bonus_credits: Number(form.bonus_credits || 0),
        price: Number(form.price),
      };
      if (editing === 'new') {
        await packageService.createPackage(payload);
        setNotice(`Package "${payload.name}" created.`);
      } else {
        await packageService.updatePackage(editing.package_id, payload);
        setNotice(`Package "${payload.name}" updated.`);
      }
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (p) => {
    setError('');
    try {
      await packageService.updatePackage(p.package_id, { is_active: !p.is_active });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  if (error && !rows) return <div className="rt-page"><div className="hm-error">{error}</div></div>;
  if (!rows) return <div className="rt-page"><div className="hm-loading">Loading packages…</div></div>;

  return (
    <div className="rt-page">
      <div className="rt-filterbar">
        <p style={{ margin: 0, marginRight: 'auto', fontSize: 13.5, color: 'var(--shell-muted)' }}>
          Credit bundles families can buy — recording a payment against one credits the student's wallet automatically.
        </p>
        <button type="button" className="rt-btn-primary" onClick={openNew}>
          <i className="fa-solid fa-plus" style={{ marginRight: 7 }} />New package
        </button>
      </div>

      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success, #2c8a5b)', padding: '10px 14px' }}>{notice}</div>}

      <section className="rt-section">
        <div className="rt-grid rt-head" style={GRID}>
          <span>Package</span>
          <span style={{ textAlign: 'right' }}>Credits</span>
          <span style={{ textAlign: 'right' }}>Bonus</span>
          <span style={{ textAlign: 'right' }}>Price</span>
          <span style={{ textAlign: 'center' }}>Status</span>
          <span></span>
        </div>
        {rows.map((p) => (
          <div key={p.package_id} className="rt-grid rt-row" style={{ ...GRID, opacity: p.is_active ? 1 : 0.55 }}>
            <span className="rt-name">{p.name}</span>
            <span className="rt-cell-strong" style={{ textAlign: 'right' }}>{p.credits} cr</span>
            <span className="rt-cell" style={{ textAlign: 'right' }}>{p.bonus_credits > 0 ? `+${p.bonus_credits} cr` : '—'}</span>
            <span className="rt-cell-strong" style={{ textAlign: 'right' }}>{money(p.price)}</span>
            <span className="rt-pill" style={p.is_active
              ? { background: '#e9f5ee', color: '#2c8a5b' }
              : { background: '#eef0f4', color: '#7b8494' }}>
              {p.is_active ? 'Active' : 'Retired'}
            </span>
            <span style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="hm-btn" style={{ height: 30, fontSize: 12 }} onClick={() => openEdit(p)}>Edit</button>
              <button type="button" className="hm-btn" style={{ height: 30, fontSize: 12 }} onClick={() => toggleActive(p)}>
                {p.is_active ? 'Retire' : 'Reactivate'}
              </button>
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="rt-row" style={{ display: 'block' }}>
            <span className="rt-cell">No packages yet — create the bundles your academy sells.</span>
          </div>
        )}
      </section>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <form onSubmit={submit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
              <span style={{ width: 42, height: 42, borderRadius: 13, background: '#e0f2ee', color: '#25887a', flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                <i className="fa-solid fa-box-open" />
              </span>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{editing === 'new' ? 'New package' : `Edit ${editing.name}`}</div>
                <div style={{ fontSize: 12.5, color: '#6b7587' }}>Bonus credits are granted on top of the paid credits.</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ gridColumn: '1 / -1' }}>
                <span style={fieldLabel}>Name</span>
                <input type="text" className="rt-input" required value={form.name} style={{ width: '100%', boxSizing: 'border-box' }}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </label>
              <label>
                <span style={fieldLabel}>Credits</span>
                <input type="number" min="1" className="rt-input" required value={form.credits} style={{ width: '100%', boxSizing: 'border-box' }}
                  onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))} />
              </label>
              <label>
                <span style={fieldLabel}>Bonus credits</span>
                <input type="number" min="0" className="rt-input" value={form.bonus_credits} style={{ width: '100%', boxSizing: 'border-box' }}
                  onChange={(e) => setForm((f) => ({ ...f, bonus_credits: e.target.value }))} />
              </label>
              <label>
                <span style={fieldLabel}>Price ($)</span>
                <input type="number" min="0" step="0.01" className="rt-input" required value={form.price} style={{ width: '100%', boxSizing: 'border-box' }}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 18 }}>
              <button type="button" className="hm-btn" style={{ height: 36 }} onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="rt-btn-primary" style={{ height: 36 }} disabled={busy}>
                {editing === 'new' ? 'Create package' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Packages;
