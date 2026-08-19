// Platform-admin console (Mobius employees) — light neutral theme per the
// design handoff (Mobius Admin.dc.html). Renders bare (no tenant shell).
// Three views behind one sidebar: Dashboard (cross-tenant finance + trend),
// Academies (table + inline config editor), Provision academy.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import adminService from '@/services/adminService';
import TrendChart from './TrendChart';
import ConfigEditor from './ConfigEditor';
import { logoGradient, initialsOf, fmtMoney } from './adminKnobs';
import '@/css/admin.css';

const MONO = "'IBM Plex Mono',monospace";
const card = { background: '#fff', border: '1px solid #e5e3de', borderRadius: 14 };
const darkBtn = { display: 'inline-flex', alignItems: 'center', gap: 9, border: 'none', background: '#1c1c1c',
  color: '#fff', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' };

export default function AdminConsole() {
  const nav = useNavigate();
  const [view, setView] = useState('overview');
  const [error, setError] = useState('');
  const [finance, setFinance] = useState(null);
  const [institutions, setInstitutions] = useState(null);
  const [query, setQuery] = useState('');
  const [configCode, setConfigCode] = useState(null);

  const load = useCallback(async () => {
    setError('');
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
  const loading = !finance || !institutions;

  const finByCode = useMemo(() => Object.fromEntries(
    (finance?.academies || []).map((a) => [a.code.toUpperCase(), a])), [finance]);

  // One merged academy model for the table + chart: registry row + counts
  // (null counts = that tenant's DB was unreachable) + finance join by code.
  const academies = useMemo(() => (institutions || []).map((i) => {
    const fin = finByCode[i.code.toUpperCase()];
    const unreachable = i.students == null || fin?.unreachable;
    return {
      code: i.code, name: i.name, is_active: i.is_active, schema_version: i.schema_version,
      students: i.students, classes: i.active_classes,
      total: fin?.total ?? null, month: fin?.this_month ?? null,
      series: fin?.series ?? null, unreachable,
    };
  }), [institutions, finByCode]);

  const shown = query.trim()
    ? academies.filter((a) => (a.code + ' ' + a.name).toLowerCase().includes(query.trim().toLowerCase()))
    : academies;

  const suspendedN = academies.filter((a) => !a.is_active).length;
  const unreachableN = academies.filter((a) => a.unreachable).length;
  const activeStudents = academies.filter((a) => a.is_active && !a.unreachable)
    .reduce((s, a) => s + (a.students || 0), 0);

  // Stat-tile sparklines from the merged monthly trend (last 6 months).
  const sparkVals = (finance?.trend || []).slice(-6).map((t) => t.total);
  const spark = (vals) => {
    const max = Math.max(...vals, 1);
    return vals.map((x, i) => (
      <span key={i} style={{ width: 4, borderRadius: 2, height: Math.max(4, Math.round((x / max) * 44)),
        background: i === vals.length - 1 ? '#1c1c1c' : '#dedbd2' }} />
    ));
  };
  const monthUp = sparkVals.length >= 2 && sparkVals[sparkVals.length - 1] > 0;

  const navBtn = (key, icon, label) => {
    const on = view === key;
    return (
      <button className="ad-nav" onClick={() => setView(key)}
        style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13.5, fontWeight: on ? 600 : 500, padding: '10px 12px', borderRadius: 10,
          background: on ? '#fff' : 'transparent', color: on ? '#1c1c1c' : '#6f6a60',
          border: `1px solid ${on ? '#e5e3de' : 'transparent'}` }}>
        <i className={`fa-solid ${icon}`} style={{ width: 19, textAlign: 'center' }} />{label}
      </button>
    );
  };

  const schemaChip = (a) => {
    const known = a.schema_version != null && !a.unreachable;
    const chip = known
      ? { text: `v${a.schema_version}`, bd: '#cfe5d6', bg: '#effaf2', fg: '#1f8a4c', tip: 'Schema version as recorded' }
      : a.unreachable
        ? { text: 'unknown', bd: '#e5e3de', bg: '#faf9f7', fg: '#8a8577', tip: 'Unreachable — schema version unknown' }
        : { text: 'unknown', bd: '#e5e3de', bg: '#faf9f7', fg: '#8a8577', tip: 'Schema version not recorded yet' };
    return (
      <span title={chip.tip} style={{ fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '3px 9px',
        border: `1px solid ${chip.bd}`, background: chip.bg, color: chip.fg }}>{chip.text}</span>
    );
  };

  const crumb = view === 'overview' ? 'Overview' : view === 'provision' ? 'Provision academy' : 'Academies';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#faf9f7', fontFamily: "'Noto Sans KR',system-ui,sans-serif", color: '#1c1c1c' }}>
      {/* Sidebar */}
      <aside style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', height: '100vh', width: 248, flexShrink: 0,
        background: '#f3f2ee', borderRight: '1px solid #e5e3de', display: 'flex', flexDirection: 'column', padding: '16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1px solid #e5e3de',
          borderRadius: 12, padding: '11px 12px', marginBottom: 22 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: '#1c1c1c', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, flexShrink: 0 }}>
            <i className="fa-solid fa-infinity" />
          </span>
          <span style={{ lineHeight: 1.25, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 10.5, fontWeight: 500, color: '#8a8577', letterSpacing: '.04em' }}>Platform</span>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>Mobius Admin</span>
          </span>
        </div>

        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.1em', color: '#b3aea4', textTransform: 'uppercase', padding: '0 10px 9px' }}>Main menu</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navBtn('overview', 'fa-house', 'Dashboard')}
          {navBtn('academies', 'fa-building-columns', 'Academies')}
        </nav>
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '.1em', color: '#b3aea4', textTransform: 'uppercase', padding: '20px 10px 9px' }}>Management</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navBtn('provision', 'fa-plus', 'Provision academy')}
        </nav>

        <div style={{ marginTop: 'auto', background: '#fff', border: '1px solid #e5e3de', borderRadius: 12,
          padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#6f6a60,#1c1c1c)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            {initialsOf(admin?.name || 'A')}
          </span>
          <span style={{ lineHeight: 1.25, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{admin?.name}</span>
            <span style={{ display: 'block', fontSize: 11, color: '#8a8577' }}>Platform admin</span>
          </span>
          <button onClick={() => { adminService.logout(); nav('/admin/login'); }} title="Log out"
            style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: 8, border: '1px solid #e5e3de', background: 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#8a8577', flexShrink: 0, cursor: 'pointer' }}>
            <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: 12 }} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(250,249,247,.9)', backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e5e3de', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13.5, color: '#8a8577' }}>
            Console <span style={{ margin: '0 6px', color: '#d5d2c9' }}>›</span>
            <strong style={{ color: '#1c1c1c', fontWeight: 600 }}>{crumb}</strong>
          </div>
          <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 9, background: '#fff',
            border: '1px solid #e5e3de', borderRadius: 10, padding: '0 13px', height: 38, width: 'min(280px,30vw)' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: '#b3aea4', fontSize: 12 }} />
            <input placeholder="Search academies…" value={query}
              onChange={(e) => { setQuery(e.target.value); if (e.target.value && view !== 'academies') setView('academies'); }}
              style={{ border: 'none', outline: 'none', background: 'none', fontFamily: 'inherit', fontSize: 13, color: '#1c1c1c', width: '100%' }} />
          </label>
        </header>

        <main style={{ flex: 1, padding: '30px 32px 64px', width: '100%' }}>
          {error && (
            <div style={{ ...card, borderColor: '#ecc8c3', background: '#fdf1ef', color: '#b23a2f', padding: '14px 18px',
              marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, fontSize: 13.5 }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#9c6a1d' }} />{error}
              <button onClick={load} style={{ marginLeft: 'auto', height: 32, padding: '0 14px', borderRadius: 8,
                border: '1px solid #ecc8c3', background: '#fff', color: '#b23a2f', fontWeight: 600, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>
                Retry
              </button>
            </div>
          )}

          {/* ============ DASHBOARD ============ */}
          {view === 'overview' && (
            <div>
              <h1 style={{ margin: '0 0 22px', fontSize: 40, fontWeight: 600, letterSpacing: '-.02em' }}>
                Welcome back{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}
              </h1>
              {loading && !error ? (
                <>
                  <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                    {[0, 1, 2].map((i) => <div key={i} className="ad-skel" style={{ height: 118 }} />)}
                  </section>
                  <div className="ad-skel" style={{ height: 320 }} />
                </>
              ) : !error && (
                <>
                  <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
                    {[
                      { label: 'Total collected', value: fmtMoney(finance.grand_total), sub: 'All payments, every active academy', up: true, sparkVals },
                      { label: 'This month', value: fmtMoney(finance.this_month), sub: `${DateTime.now().toFormat('MMMM yyyy')} · resets on the 1st`, up: monthUp, sparkVals },
                      { label: 'Active students', value: String(activeStudents),
                        sub: `${academies.length} academies · ${suspendedN} suspended · ${unreachableN} unreachable`, up: false, sparkVals: null },
                    ].map((s) => (
                      <div key={s.label} style={{ ...card, overflow: 'hidden' }}>
                        <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ font: `600 11px ${MONO}`, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8a8577' }}>{s.label}</div>
                            <div style={{ font: `600 27px ${MONO}`, letterSpacing: '-.02em', marginTop: 8 }}>{s.value}</div>
                          </div>
                          {s.sparkVals && s.sparkVals.length > 1 && (
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 44, paddingTop: 4 }}>{spark(s.sparkVals)}</div>
                          )}
                        </div>
                        <div style={{ padding: '9px 20px', background: '#faf9f7', borderTop: '1px solid #f0eee8',
                          fontSize: 12, color: '#8a8577', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {s.up && <span style={{ color: '#1f8a4c' }}><i className="fa-solid fa-circle-arrow-up" /></span>}
                          {s.sub}
                        </div>
                      </div>
                    ))}
                  </section>
                  <TrendChart academies={academies} onRetry={load} />
                </>
              )}
            </div>
          )}

          {/* ============ ACADEMIES ============ */}
          {view === 'academies' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-.02em' }}>Academies</h1>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#8a8577' }}>
                    {academies.length} registered · suspended academies are excluded from finance totals
                  </p>
                </div>
                <button onClick={() => setView('provision')} className="ad-btn"
                  style={{ ...darkBtn, marginLeft: 'auto', height: 40, padding: '0 17px', borderRadius: 10, fontSize: 13 }}>
                  <i className="fa-solid fa-plus" />New academy
                </button>
              </div>

              <section style={{ ...card, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: 1040 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 92px 110px 128px 112px 122px 108px',
                      padding: '12px 22px', borderBottom: '1px solid #e5e3de', font: `600 10.5px ${MONO}`,
                      letterSpacing: '.1em', textTransform: 'uppercase', color: '#b3aea4' }}>
                      <span>Code</span><span>Name</span>
                      <span style={{ textAlign: 'right' }}>Students</span><span style={{ textAlign: 'right' }}>Classes</span>
                      <span style={{ textAlign: 'right' }}>Collected</span><span style={{ textAlign: 'right' }}>This month</span>
                      <span style={{ textAlign: 'center' }}>Schema</span><span />
                    </div>
                    {loading && !error && [0, 1, 2].map((i) => (
                      <div key={i} style={{ padding: '14px 22px' }}><div className="ad-skel" style={{ height: 34 }} /></div>
                    ))}
                    {!loading && shown.map((a) => (
                      <div key={a.code} className="adm-row"
                        style={{ display: 'grid', gridTemplateColumns: '200px 1fr 92px 110px 128px 112px 122px 108px',
                          alignItems: 'center', padding: '14px 22px', borderBottom: '1px solid #f0eee8', opacity: a.is_active ? 1 : 0.6 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 9, background: logoGradient(a.code),
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {initialsOf(a.name)}
                          </span>
                          <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <span style={{ font: `600 13px ${MONO}` }}>{a.code}</span>
                            {!a.is_active && (
                              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase',
                                color: '#b23a2f', border: '1px solid #ecc8c3', background: '#fdf1ef', borderRadius: 5,
                                padding: '1px 6px', width: 'fit-content' }}>Suspended</span>
                            )}
                          </span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, fontWeight: 500, minWidth: 0 }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
                          {a.unreachable && (
                            <>
                              <span title="Couldn't reach this academy's database" style={{ color: '#9c6a1d', fontSize: 12, flexShrink: 0 }}>
                                <i className="fa-solid fa-triangle-exclamation" />
                              </span>
                              <button onClick={load} style={{ flexShrink: 0, border: '1px solid #e5e3de', background: 'none',
                                color: '#8a8577', fontWeight: 500, fontSize: 11, fontFamily: 'inherit', borderRadius: 7,
                                padding: '3px 9px', cursor: 'pointer' }}>Retry</button>
                            </>
                          )}
                        </span>
                        {[a.students, a.classes].map((n, i) => (
                          <span key={i} style={{ textAlign: 'right', font: `500 13px ${MONO}`, color: a.unreachable ? '#b3aea4' : '#1c1c1c' }}>
                            {n == null ? '—' : String(n)}
                          </span>
                        ))}
                        {[a.total, a.month].map((n, i) => (
                          <span key={i} style={{ textAlign: 'right', font: `500 13px ${MONO}`, color: a.unreachable ? '#b3aea4' : '#1c1c1c' }}>
                            {fmtMoney(n)}
                          </span>
                        ))}
                        <span style={{ textAlign: 'center' }}>{schemaChip(a)}</span>
                        <span style={{ textAlign: 'right' }}>
                          <button onClick={() => setConfigCode(configCode === a.code ? null : a.code)}
                            style={{ height: 32, padding: '0 14px', borderRadius: 9,
                              border: `1px solid ${configCode === a.code ? '#1c1c1c' : '#e5e3de'}`,
                              background: configCode === a.code ? '#1c1c1c' : '#fff',
                              color: configCode === a.code ? '#fff' : '#1c1c1c',
                              fontWeight: 600, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>Configure</button>
                        </span>
                      </div>
                    ))}
                    {!loading && !shown.length && (
                      <div style={{ padding: '40px 22px', textAlign: 'center', fontSize: 13, color: '#8a8577' }}>
                        {query ? `No academies match “${query}”.` : (
                          <>No academies yet — <button onClick={() => setView('provision')}
                            style={{ border: 'none', background: 'none', color: '#1c1c1c', fontWeight: 600, fontSize: 13,
                              fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>provision one</button>.</>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {configCode && academies.find((a) => a.code === configCode) && (
                <ConfigEditor academy={academies.find((a) => a.code === configCode)}
                  onClose={() => setConfigCode(null)} onChanged={load} />
              )}
            </div>
          )}

          {/* ============ PROVISION ============ */}
          {view === 'provision' && (
            <ProvisionPage onProvisioned={load} goAcademies={() => setView('academies')} />
          )}
        </main>
      </div>
    </div>
  );
}

function ProvisionPage({ onProvisioned, goAcademies }) {
  const empty = { code: '', name: '', admin_name: '', admin_email: '', admin_password: '' };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const set = (k) => (e) => {
    setF((p) => ({ ...p, [k]: k === 'code' ? e.target.value.toUpperCase() : e.target.value }));
    setErr('');
  };
  const filled = Object.values(f).every((v) => v.trim());

  const submit = async () => {
    if (!filled || busy) return;
    if (!/^[A-Za-z0-9_-]{3,32}$/.test(f.code)) { setErr('Code must be 3–32 characters: letters, digits, _ or - only.'); return; }
    if (f.admin_password.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    setBusy(true); setErr('');
    try {
      const res = await adminService.provision(f);
      setMsg(`Provisioned ${res.code} — first staff ${res.initial_staff} can now log in.`);
      setF(empty);
      await onProvisioned();
    } catch (e) {
      setErr(e.response?.data?.message || 'Provisioning failed');
    } finally {
      setBusy(false);
    }
  };

  const field = (id, key, label, props = {}) => (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#8a8577', marginBottom: 6 }}>{label}</label>
      <input id={id} className="ad-in" value={f[key]} onChange={set(key)} {...props} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-.02em' }}>Provision academy</h1>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#8a8577' }}>
          Set up a new tenant end-to-end — its first staff member can log in the moment this finishes.
        </p>
      </div>
      {msg && (
        <div role="status" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
          padding: '12px 16px', borderRadius: 11, border: '1px solid #cfe5d6', background: '#effaf2', color: '#1f8a4c', fontSize: 13.5 }}>
          <i className="fa-solid fa-circle-check" />{msg}
          <button onClick={goAcademies} style={{ marginLeft: 6, fontWeight: 600, cursor: 'pointer', color: '#1f8a4c',
            textDecoration: 'underline', border: 'none', background: 'none', fontSize: 13.5, fontFamily: 'inherit', padding: 0 }}>
            View in academies
          </button>
          <button onClick={() => setMsg('')} aria-label="Dismiss"
            style={{ marginLeft: 'auto', border: 'none', background: 'none', color: '#1f8a4c', cursor: 'pointer', fontSize: 14 }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}
      <div style={{ padding: '22px 24px', border: '1px solid #e5e3de', borderRadius: 14, background: '#fff' }}>
        <p style={{ margin: '0 0 18px', fontSize: 12.5, lineHeight: 1.6, color: '#8a8577' }}>
          Creates the academy's own database, runs all migrations, registers it on the platform, and seeds the first
          staff account — that person can sign straight into the Staff app of a working, empty academy.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {field('pv-code', 'code', 'Institution code', { placeholder: 'e.g. UW123 — letters, digits, _ or -', style: { fontFamily: MONO } })}
          {field('pv-name', 'name', 'Academy name', { placeholder: 'e.g. Bright Minds Academy' })}
          {field('pv-sname', 'admin_name', 'First staff — name', { placeholder: 'Full name' })}
          {field('pv-semail', 'admin_email', 'First staff — email', { type: 'email', placeholder: 'Must be new to the platform' })}
          {field('pv-spass', 'admin_password', 'First staff — password', { type: 'password', placeholder: 'Min 8 characters' })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
          <button onClick={submit} aria-disabled={!filled || busy} className="ad-btn"
            style={{ ...darkBtn, height: 42, padding: '0 20px', borderRadius: 11, fontSize: 13.5,
              opacity: !filled || busy ? 0.45 : 1, cursor: !filled || busy ? 'default' : 'pointer' }}>
            {busy && <i className="fa-solid fa-circle-notch fa-spin" />}
            {busy ? 'Provisioning…' : 'Provision academy'}
          </button>
          {busy && (
            <span style={{ fontSize: 12.5, color: '#9c6a1d' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 7 }} />
              Creating and migrating a database — this takes a moment. Don't resubmit.
            </span>
          )}
          {err && <span role="alert" style={{ fontSize: 13, color: '#b23a2f' }}>{err}</span>}
        </div>
      </div>
    </div>
  );
}
