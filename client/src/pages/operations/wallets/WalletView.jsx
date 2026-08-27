// Staff wallet console — a browsable table over the new GET /wallets list
// endpoint (the old pick-a-student dropdown existed only because no list
// endpoint did). Search + status chips filter the table; expanding a row
// lazy-loads that student's full wallet (balance / committed / available,
// committed-by-enrollment, recent ledger) from the per-student endpoint.
// The design's "Adjust modal" reason chips map onto the real, narrower
// entry_type enum: Refund isn't offered because the server rejects manual
// refund/deduction entries outright (attendance-driven only, INV-1) —
// Top-up=purchase, Goodwill credit=bonus, Correction=adjustment.
import { useEffect, useState } from 'react';
import walletService from '@/services/walletService';
import Modal from '@/components/Modal';
import { tintFor } from '@/lib/rosterColors';
import { isoToLocal } from 'mobius-lms';
import '@/css/roster.css';

const REASON_CHIPS = [
  { entry_type: 'purchase', label: 'Top-up' },
  { entry_type: 'bonus', label: 'Goodwill credit' },
  { entry_type: 'adjustment', label: 'Correction' },
];
// List-level status is balance-only (committed math lives on the detail
// view); thresholds follow the app's low-balance convention (2 × default
// session cost).
const statusOf = (balance) => (balance < 0 ? 'negative' : balance < 10 ? 'low' : 'healthy');
const STATUS_META = {
  negative: { label: 'Negative', bg: '#fdf1ef', fg: '#9c3a31' },
  low: { label: 'Low', bg: '#fff4e0', fg: '#9c6a1d' },
  healthy: { label: 'Healthy', bg: '#e9f5ee', fg: '#2c8a5b' },
};
const GRID = { gridTemplateColumns: 'minmax(0,1.4fr) 110px minmax(0,1fr) 110px 120px' };
const initialsOf = (name) =>
  String(name || '?').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

function WalletView() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [adjustFor, setAdjustFor] = useState(null); // { student_id, name }
  const [entry, setEntry] = useState({ entry_type: 'purchase', amount: '', note: '' });

  const loadList = () =>
    walletService.getAllWallets().then(setRows)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load wallets'));
  useEffect(() => { loadList(); }, []);

  const loadDetail = (sid) =>
    walletService.getWallet(sid).then(setDetail)
      .catch((err) => setDetail({ error: err.response?.data?.message || 'Failed to load wallet' }));

  const toggle = (sid) => {
    if (openId === sid) { setOpenId(null); setDetail(null); return; }
    setOpenId(sid);
    setDetail(null);
    loadDetail(sid);
  };

  const openAdjust = (row) => {
    setEntry({ entry_type: 'purchase', amount: '', note: '' });
    setNotice('');
    setAdjustFor(row);
  };

  const submitEntry = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await walletService.addEntry(adjustFor.student_id, {
        entry_type: entry.entry_type,
        amount: Number(entry.amount),
        note: entry.note || undefined,
      });
      setNotice(`Recorded for ${adjustFor.name} — new balance ${result.balance}.`);
      setAdjustFor(null);
      loadList();
      if (openId === adjustFor.student_id) loadDetail(adjustFor.student_id);
    } catch (err) {
      setError(err.response?.data?.message || 'Entry failed');
    }
  };

  if (error && !rows) return <div className="rt-page"><div className="hm-error">{error}</div></div>;
  if (!rows) return <div className="rt-page"><div className="hm-loading">Loading wallets…</div></div>;

  const needle = q.trim().toLowerCase();
  const counts = { negative: 0, low: 0, healthy: 0 };
  for (const r of rows) counts[statusOf(r.balance)] += 1;
  const shown = rows
    .filter((r) => filter === 'All' || statusOf(r.balance) === filter)
    .filter((r) => !needle || r.name.toLowerCase().includes(needle));

  return (
    <div className="rt-page">
      <div className="rt-filterbar">
        <div className="rt-filters">
          {['All', 'negative', 'low', 'healthy'].map((f) => (
            <button key={f} type="button" className={`rt-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'All' ? `All (${rows.length})` : `${STATUS_META[f].label} (${counts[f]})`}
            </button>
          ))}
        </div>
        <label className="rt-search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input type="text" placeholder="Filter by student name…" aria-label="Filter wallets"
            value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success, #2c8a5b)', padding: '10px 14px' }}>{notice}</div>}

      <section className="rt-section">
        <div className="rt-grid rt-head" style={GRID}>
          <span>Student</span>
          <span style={{ textAlign: 'right' }}>Balance</span>
          <span>Last activity</span>
          <span style={{ textAlign: 'center' }}>Status</span>
          <span></span>
        </div>

        {shown.map((r) => {
          const st = STATUS_META[statusOf(r.balance)];
          const tint = tintFor(r.name);
          const open = openId === r.student_id;
          return (
            <div key={r.student_id}>
              <div className="rt-grid rt-row rt-row--clickable" style={GRID} onClick={() => toggle(r.student_id)}>
                <div className="rt-name-row">
                  <span className="rt-avatar" style={{ background: tint.bg, color: tint.fg }}>{initialsOf(r.name)}</span>
                  <span className="rt-name">{r.name}</span>
                </div>
                <span className="rt-cell-strong" style={{ textAlign: 'right', color: r.balance < 0 ? '#9c3a31' : undefined }}>
                  {r.balance} cr
                </span>
                <span className="rt-cell">
                  {r.last_entry_at ? isoToLocal(r.last_entry_at).toFormat('LLL d, yyyy') : 'No activity yet'}
                </span>
                <span className="rt-pill" style={{ background: st.bg, color: st.fg }}>{st.label}</span>
                <span style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
                  <button type="button" className="rt-btn-primary" style={{ height: 30, fontSize: 12 }}
                    onClick={(e) => { e.stopPropagation(); openAdjust(r); }}>
                    Adjust
                  </button>
                  <i className={`rt-chevron fa-solid fa-chevron-${open ? 'up' : 'down'}`} />
                </span>
              </div>

              {open && (
                <div className="rt-expand">
                  {!detail && <div className="rt-cell">Loading wallet…</div>}
                  {detail?.error && <div className="hm-error">{detail.error}</div>}
                  {detail && !detail.error && (
                    <>
                      <div>
                        <div className="rt-expand-label">Wallet</div>
                        <div style={{ display: 'flex', gap: 28, marginBottom: 14 }}>
                          {[['Balance', detail.balance], ['Committed', detail.committed], ['Available', detail.available]].map(([label, v]) => (
                            <div key={label}>
                              <div style={{ fontSize: 22, fontWeight: 600, color: v < 0 ? '#9c3a31' : 'var(--shell-ink)' }}>{v}</div>
                              <div className="rt-person-sub">{label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="rt-expand-label">Committed by enrollment</div>
                        {detail.per_enrollment.length === 0 && <div className="rt-cell">No active enrollments.</div>}
                        {detail.per_enrollment.map((e) => (
                          <div key={e.enrollment_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}>
                            <span style={{ color: 'var(--shell-secondary)' }}>
                              {e.subject} <span className="rt-person-sub">· {e.sessions_counted} session{e.sessions_counted === 1 ? '' : 's'} {e.ends_on ? 'to class end' : '(runway)'}</span>
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--shell-ink)' }}>{e.committed} cr</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="rt-expand-label">Recent ledger</div>
                        {detail.ledger.length === 0 && <div className="rt-cell">No entries yet.</div>}
                        {detail.ledger.slice(0, 8).map((l) => (
                          <div key={l.entry_id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '4px 0', fontSize: 12.5 }}>
                            <span style={{ color: 'var(--shell-secondary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {isoToLocal(l.created_at).toFormat('LLL d')} · {l.entry_type.replace(/_/g, ' ')}
                              {l.session_starts_at && ` · ${isoToLocal(l.session_starts_at).toFormat('LLL d')} session (${String(l.attendance_status).replace(/_/g, ' ')})`}
                              {l.note && ` · ${l.note}`}
                            </span>
                            <span style={{ fontWeight: 600, color: l.amount < 0 ? '#9c3a31' : '#2c8a5b' }}>
                              {l.amount > 0 ? `+${l.amount}` : l.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {shown.length === 0 && (
          <div className="rt-row" style={{ display: 'block' }}>
            <span className="rt-cell">{needle ? `No students match "${q.trim()}"` : 'No wallets in this state.'}</span>
          </div>
        )}
      </section>

      <Modal isOpen={!!adjustFor} onClose={() => setAdjustFor(null)}>
        {adjustFor && (
          <form onSubmit={submitEntry}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <span style={{ width: 42, height: 42, borderRadius: 13, background: '#fff4e0', color: '#9c6a1d', flexShrink: 0,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                <i className="fa-solid fa-coins" />
              </span>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 17, fontWeight: 600 }}>Adjust wallet — {adjustFor.name}</div>
                <div style={{ fontSize: 12.5, color: '#7d6a5c' }}>
                  Current balance {adjustFor.balance} cr. Deductions and refunds happen only through attendance.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {REASON_CHIPS.map((c) => {
                const on = entry.entry_type === c.entry_type;
                return (
                  <button key={c.entry_type} type="button" onClick={() => setEntry((x) => ({ ...x, entry_type: c.entry_type }))}
                    style={{ padding: '7px 14px', borderRadius: 999, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
                      cursor: 'pointer', border: `1px solid ${on ? '#3d4a63' : '#e6e9f0'}`,
                      background: on ? '#3d4a63' : '#fff', color: on ? '#fff' : '#45526b' }}>
                    {c.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <label style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#97a0b1', marginBottom: 6 }}>
                  Credits
                </span>
                <input type="number" className="rt-input" required value={entry.amount} style={{ width: '100%', boxSizing: 'border-box' }}
                  onChange={(e) => setEntry((x) => ({ ...x, amount: e.target.value }))} />
              </label>
              <label style={{ flex: 2 }}>
                <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#97a0b1', marginBottom: 6 }}>
                  Note
                </span>
                <input type="text" className="rt-input" placeholder="Optional" value={entry.note} style={{ width: '100%', boxSizing: 'border-box' }}
                  onChange={(e) => setEntry((x) => ({ ...x, note: e.target.value }))} />
              </label>
            </div>
            {entry.entry_type === 'adjustment' && (
              <div style={{ fontSize: 12, color: '#7d6a5c', marginTop: 8 }}>Corrections may be negative (e.g. -5) or positive.</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 18 }}>
              <button type="button" className="hm-btn" style={{ height: 36 }} onClick={() => setAdjustFor(null)}>Cancel</button>
              <button type="submit" className="rt-btn-primary" style={{ height: 36 }}>Record entry</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default WalletView;
