// Credit packages management: the academy defines its own bundles here;
// recording a payment against one grants its configured wallet credits.
// Retiring is soft so historical payments keep their package reference.
import { useEffect, useState } from 'react';
import packageService from '@/services/packageService';
import Modal from '@/components/Modal';
import '@/css/home.css';
import '@/css/table.css';
import '@/css/finance-pages.css';

const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const EMPTY_FORM = { name: '', credits: '', bonus_credits: '0', price: '' };

function Packages() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);

  const load = () =>
    packageService.getPackages(true).then(setRows)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load packages'));
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(EMPTY_FORM); setEditing('new'); setNotice(''); };
  const openEdit = (pkg) => {
    setForm({ name: pkg.name, credits: String(pkg.credits), bonus_credits: String(pkg.bonus_credits), price: String(pkg.price) });
    setEditing(pkg);
    setNotice('');
  };

  const submit = async (event) => {
    event.preventDefault();
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

  const toggleActive = async (pkg) => {
    setError('');
    try {
      await packageService.updatePackage(pkg.package_id, { is_active: !pkg.is_active });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  if (error && !rows) return <div className="hm-page fin-page"><div className="hm-error">{error}</div></div>;
  if (!rows) return <div className="hm-page fin-page"><div className="hm-loading">Loading packages…</div></div>;

  const activeCount = rows.filter((row) => row.is_active).length;

  return (
    <div className="hm-page fin-page packages-page">
      <div className="fin-page-intro package-toolbar">
        <div>
          <p>Credit bundles available when staff records a payment. Package credits are granted to the student's wallet automatically.</p>
          <div className="package-count"><strong>{activeCount}</strong> active · {rows.length - activeCount} retired</div>
        </div>
        <button type="button" className="hm-btn primary" onClick={openNew}>
          <i className="fa-solid fa-plus" aria-hidden="true" />New package
        </button>
      </div>

      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="fin-success"><i className="fa-solid fa-circle-check" aria-hidden="true" />{notice}</div>}

      <section className="fin-section package-list-section">
        <div className="hm-table-wrap fin-table-wrap">
          <table className="hm-table fin-table package-table">
            <thead><tr><th>Package</th><th>Credits</th><th>Bonus</th><th>Price</th><th>Status</th><th><span className="fin-sr">Actions</span></th></tr></thead>
            <tbody>
              {rows.map((pkg) => (
                <tr key={pkg.package_id} className={pkg.is_active ? '' : 'package-retired'}>
                  <td className="package-name">{pkg.name}</td>
                  <td>{pkg.credits} cr</td>
                  <td>{pkg.bonus_credits > 0 ? `+${pkg.bonus_credits} cr` : '—'}</td>
                  <td className="package-price">{money(pkg.price)}</td>
                  <td><span className={`package-state ${pkg.is_active ? 'active' : 'retired'}`}>{pkg.is_active ? 'Active' : 'Retired'}</span></td>
                  <td>
                    <div className="package-actions">
                      <button type="button" className="hm-btn package-row-action" onClick={() => openEdit(pkg)}>Edit</button>
                      <button type="button" className="hm-btn package-row-action" onClick={() => toggleActive(pkg)}>{pkg.is_active ? 'Retire' : 'Reactivate'}</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan="6" className="fin-table-empty">No packages yet — create the bundles your academy sells.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <form className="package-form" onSubmit={submit}>
            <div className="package-form-head">
              <span className="package-form-icon"><i className="fa-solid fa-box-open" aria-hidden="true" /></span>
              <div>
                <h2>{editing === 'new' ? 'New package' : `Edit ${editing.name}`}</h2>
                <p>Bonus credits are granted on top of the paid credits.</p>
              </div>
            </div>
            <div className="package-form-grid">
              <label className="fin-field package-name-field">Name
                <input type="text" required value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="fin-field">Credits
                <input type="number" min="1" required value={form.credits}
                  onChange={(event) => setForm((current) => ({ ...current, credits: event.target.value }))} />
              </label>
              <label className="fin-field">Bonus credits
                <input type="number" min="0" value={form.bonus_credits}
                  onChange={(event) => setForm((current) => ({ ...current, bonus_credits: event.target.value }))} />
              </label>
              <label className="fin-field">Price ($)
                <input type="number" min="0" step="0.01" required value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} />
              </label>
            </div>
            <div className="package-form-actions">
              <button type="button" className="hm-btn" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="hm-btn primary" disabled={busy}>
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
