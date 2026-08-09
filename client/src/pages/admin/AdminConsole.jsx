// Platform-admin console (Mobius employees): provision academies, edit their
// config, and see money coming in across all of them. Dark theme to signal
// this is the platform layer, not a tenant app.
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '@/services/adminService';

const money = (n) => n == null ? '—' : n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
const C = { bg: '#0f1420', panel: '#182031', border: '#263049', ink: '#e8ecf5', sub: '#8fa3c8', accent: '#5b8cff' };
const PAYMENT_MODES = ['collect_now', 'payment_link', 'both'];

export default function AdminConsole() {
  const nav = useNavigate();
  const [finance, setFinance] = useState(null);
  const [institutions, setInstitutions] = useState(null);
  const [error, setError] = useState('');
  const [configCode, setConfigCode] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    try {
      const [fin, insts] = await Promise.all([adminService.finance(), adminService.listInstitutions()]);
      setFinance(fin); setInstitutions(insts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    }
  }, []);

  useEffect(() => {
    if (!adminService.isAuthed()) { nav('/admin/login'); return; }
    load();
  }, [load, nav]);

  const admin = adminService.currentAdmin();
  const revByCode = Object.fromEntries((finance?.academies || []).map((a) => [a.code, a]));
  const maxTrend = Math.max(1, ...(finance?.trend || []).map((t) => t.total));

  const box = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 };
  const th = { textAlign: 'left', padding: '8px 10px', color: C.sub, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 };
  const td = { padding: '10px', borderTop: `1px solid ${C.border}` };
  const btn = { background: C.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600 };
  const ghost = { ...btn, background: 'transparent', border: `1px solid ${C.border}`, color: C.ink };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.ink, padding: '24px 32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: C.sub }}>Mobius · Platform admin</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 26 }}>Console</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {admin && <span style={{ color: C.sub }}>{admin.name}</span>}
          <button style={ghost} onClick={() => { adminService.logout(); nav('/admin/login'); }}>Log out</button>
        </div>
      </header>

      {error && <div style={{ ...box, borderColor: '#5a2b2b', color: '#ff9a9a', marginBottom: 18 }}>{error}</div>}
      {!finance && !error && <div style={{ color: C.sub }}>Loading…</div>}

      {finance && (
        <>
          {/* Money coming in */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14, marginBottom: 18 }}>
            <div style={box}>
              <div style={{ color: C.sub, fontSize: 13 }}>Total collected (all academies)</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{money(finance.grand_total)}</div>
            </div>
            <div style={box}>
              <div style={{ color: C.sub, fontSize: 13 }}>This month</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{money(finance.this_month)}</div>
            </div>
            <div style={box}>
              <div style={{ color: C.sub, fontSize: 13 }}>Academies</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{institutions?.length ?? '—'}</div>
            </div>
          </section>

          {/* 6-month trend */}
          {finance.trend?.length > 0 && (
            <section style={{ ...box, marginBottom: 18 }}>
              <div style={{ color: C.sub, fontSize: 13, marginBottom: 10 }}>Revenue trend (last 6 months, all academies)</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 120 }}>
                {finance.trend.map((t) => (
                  <div key={t.month} style={{ textAlign: 'center', flex: 1 }}>
                    <div title={money(t.total)} style={{ height: `${Math.round((t.total / maxTrend) * 100)}%`, minHeight: 2, background: C.accent, borderRadius: '4px 4px 0 0' }} />
                    <div style={{ color: C.sub, fontSize: 11, marginTop: 6 }}>{t.month}</div>
                    <div style={{ fontSize: 11 }}>{money(t.total)}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Academies */}
          <section style={{ ...box, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>Academies</h2>
              <button style={btn} onClick={() => setShowNew((v) => !v)}>{showNew ? 'Close' : '+ New academy'}</button>
            </div>
            {showNew && <NewAcademyForm onDone={async () => { setShowNew(false); await load(); }} C={C} btn={btn} ghost={ghost} />}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                <thead><tr>
                  <th style={th}>Code</th><th style={th}>Name</th><th style={th}>Students</th>
                  <th style={th}>Active classes</th><th style={th}>Total collected</th><th style={th}>This month</th><th style={th}></th>
                </tr></thead>
                <tbody>
                  {(institutions || []).map((i) => (
                    <tr key={i.code}>
                      <td style={td}><code>{i.code}</code>{!i.is_active && <span style={{ color: '#ff9a9a', marginLeft: 6 }}>suspended</span>}</td>
                      <td style={td}>{i.name}</td>
                      <td style={td}>{i.students ?? '—'}</td>
                      <td style={td}>{i.active_classes ?? '—'}</td>
                      <td style={td}>{money(revByCode[i.code]?.total)}</td>
                      <td style={td}>{money(revByCode[i.code]?.this_month)}</td>
                      <td style={td}><button style={ghost} onClick={() => setConfigCode(configCode === i.code ? null : i.code)}>{configCode === i.code ? 'Close' : 'Configure'}</button></td>
                    </tr>
                  ))}
                  {institutions?.length === 0 && <tr><td style={td} colSpan={7}>No academies yet — create one.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          {configCode && <ConfigEditor code={configCode} C={C} box={box} btn={btn} onClose={() => setConfigCode(null)} />}
        </>
      )}
    </div>
  );
}

function NewAcademyForm({ onDone, C, btn, ghost }) {
  const [f, setF] = useState({ code: '', name: '', admin_name: '', admin_email: '', admin_password: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const input = { padding: '9px 11px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.ink };

  const submit = async () => {
    setBusy(true); setMsg(null);
    try {
      const res = await adminService.provision(f);
      setMsg({ ok: true, text: `Provisioned ${res.code} — first staff ${res.initial_staff} can now log in.` });
      setF({ code: '', name: '', admin_name: '', admin_email: '', admin_password: '' });
      await onDone();
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || 'Provisioning failed' });
    } finally { setBusy(false); }
  };

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
        <input style={input} placeholder="Institution code (e.g. UW123)" value={f.code} onChange={set('code')} />
        <input style={input} placeholder="Academy name" value={f.name} onChange={set('name')} />
        <input style={input} placeholder="First staff — name" value={f.admin_name} onChange={set('admin_name')} />
        <input style={input} placeholder="First staff — email" value={f.admin_email} onChange={set('admin_email')} />
        <input style={input} type="password" placeholder="First staff — password (min 8)" value={f.admin_password} onChange={set('admin_password')} />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
        <button style={btn} disabled={busy || !f.code || !f.name || !f.admin_email || !f.admin_name || !f.admin_password} onClick={submit}>
          {busy ? 'Provisioning…' : 'Provision academy'}
        </button>
        {msg && <span style={{ color: msg.ok ? '#8fe6a0' : '#ff9a9a' }}>{msg.text}</span>}
      </div>
    </div>
  );
}

function ConfigEditor({ code, C, box, btn, onClose }) {
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminService.getConfig(code).then((d) => { setData(d); setDraft({}); setMsg(null); })
      .catch((err) => setMsg({ ok: false, text: err.response?.data?.message || 'Failed to load config' }));
  }, [code]);

  if (!data) return <div style={{ ...box }}>Loading config for {code}…</div>;
  const editable = data.editable;
  const val = (k) => (k in draft ? draft[k] : data.settings[k]);
  const setK = (k, v) => setDraft((p) => ({ ...p, [k]: v }));
  const input = { padding: '7px 9px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.bg, color: C.ink };

  const save = async () => {
    if (!Object.keys(draft).length) { onClose(); return; }
    setBusy(true); setMsg(null);
    try {
      await adminService.patchConfig(code, draft);
      setMsg({ ok: true, text: 'Saved.' });
      const fresh = await adminService.getConfig(code);
      setData(fresh); setDraft({});
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || 'Save failed' });
    } finally { setBusy(false); }
  };

  return (
    <section style={{ ...box }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Configure <code>{code}</code></h2>
        <button style={{ ...btn, background: 'transparent', border: `1px solid ${C.border}`, color: C.ink }} onClick={onClose}>Close</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
        {editable.map((k) => {
          const v = val(k);
          return (
            <label key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, fontSize: 14 }}>
              <span style={{ color: C.sub }}>{k}</span>
              {typeof v === 'boolean' ? (
                <input type="checkbox" checked={v} onChange={(e) => setK(k, e.target.checked)} />
              ) : k === 'payment_modes_enabled' ? (
                <select style={input} value={v} onChange={(e) => setK(k, e.target.value)}>
                  {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              ) : (
                <input style={{ ...input, width: 90 }} type="number" value={v} onChange={(e) => setK(k, e.target.value === '' ? '' : Number(e.target.value))} />
              )}
            </label>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14 }}>
        <button style={btn} disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button>
        {msg && <span style={{ color: msg.ok ? '#8fe6a0' : '#ff9a9a' }}>{msg.text}</span>}
      </div>
    </section>
  );
}
