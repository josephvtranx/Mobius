// v2 wallet console (design handoff README > Staff app > Wallets). The
// real API has no "list every wallet" endpoint (only GET /:studentId), so
// this stays a search-then-view console rather than the design's browsable
// table — the honest shape given what exists. The design's "Adjust modal"
// reason chips (Top-up/Refund/Correction/Goodwill credit) map onto the
// real, narrower entry_type enum: Refund isn't offered because the server
// rejects manual refund/deduction entries outright (attendance-driven
// only, INV-1) — Top-up=purchase, Goodwill credit=bonus, Correction=adjustment.
import { useEffect, useState } from 'react';
import walletService from '@/services/walletService';
import studentService from '@/services/studentService';
import Modal from '@/components/Modal';
import { walletStatus } from '@/lib/derive';
import { isoToLocal } from 'mobius-lms';
import '@/css/attendance.css';
import '@/css/table.css';
import '@/css/schedule.css';
import '@/css/my-classes.css';

const REASON_CHIPS = [
  { entry_type: 'purchase', label: 'Top-up' },
  { entry_type: 'bonus', label: 'Goodwill credit' },
  { entry_type: 'adjustment', label: 'Correction' },
];
const STATUS_TONE = { negative: 'error', low: 'warning', healthy: 'success' };

function WalletView() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [entry, setEntry] = useState({ entry_type: 'purchase', amount: '', note: '' });

  useEffect(() => {
    studentService.getAllStudents().then(setStudents).catch(() => {});
  }, []);

  const load = async (sid) => {
    setError('');
    setWallet(null);
    if (!sid) return;
    try {
      setWallet(await walletService.getWallet(sid));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load wallet');
    }
  };

  const pick = (e) => {
    setStudentId(e.target.value);
    setNotice('');
    load(e.target.value);
  };

  const submitEntry = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const result = await walletService.addEntry(studentId, {
        entry_type: entry.entry_type,
        amount: Number(entry.amount),
        note: entry.note || undefined,
      });
      setNotice(`Entry ${result.entry.entry_id} recorded — balance ${result.balance}`);
      setEntry({ entry_type: 'purchase', amount: '', note: '' });
      setAdjustOpen(false);
      load(studentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Entry failed');
    }
  };

  const status = wallet ? walletStatus(wallet) : null;

  return (
    <div className="at-page" style={{ maxWidth: 900 }}>
      <h1 className="at-title">Wallets</h1>
      <div className="hm-card">
        <label className="at-subtitle" style={{ display: 'block', marginBottom: 4 }}>Student</label>
        <select className="hm-btn" style={{ width: 280 }} value={studentId} onChange={pick}>
          <option value="">— pick student —</option>
          {students.map((s) => (
            <option key={s.student_id ?? s.user_id} value={s.student_id ?? s.user_id}>{s.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)' }}>{notice}</div>}

      {wallet && (
        <>
          <section className="hm-card mc-card">
            <div className="hm-card-head">
              <h2>Balance</h2>
              <span className={`status-pill status-pill--${STATUS_TONE[status]}`}>{status}</span>
            </div>
            <div className="hm-wallet">
              <div><span className="hm-kpi-value">{wallet.balance}</span><span className="hm-kpi-label">Balance</span></div>
              <div><span className="hm-kpi-value">{wallet.committed}</span><span className="hm-kpi-label">Committed</span></div>
              <div><span className="hm-kpi-value">{wallet.available}</span><span className="hm-kpi-label">Available</span></div>
            </div>
            <div className="hm-card-foot">
              <button type="button" className="hm-btn primary" onClick={() => setAdjustOpen(true)}>Adjust</button>
            </div>
          </section>

          <section className="hm-card mc-card">
            <div className="hm-card-head"><h2>Committed by enrollment</h2></div>
            <div className="hm-table-wrap">
              <table className="hm-table">
                <thead><tr><th>Subject</th><th>Committed</th><th>Sessions counted</th><th>Runway</th></tr></thead>
                <tbody>
                  {wallet.per_enrollment.map((e) => (
                    <tr key={e.enrollment_id}>
                      <td>{e.subject}</td>
                      <td>{e.committed}</td>
                      <td>{e.sessions_counted}</td>
                      <td>{e.ends_on ? 'to class end' : 'runway window'}</td>
                    </tr>
                  ))}
                  {wallet.per_enrollment.length === 0 && <tr><td colSpan="4">No active enrollments</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="hm-card mc-card">
            <div className="hm-card-head"><h2>Ledger</h2></div>
            <div className="hm-table-wrap">
              <table className="hm-table">
                <thead><tr><th>When</th><th>Type</th><th>Amount</th><th>Session</th><th>Note</th></tr></thead>
                <tbody>
                  {wallet.ledger.map((l) => (
                    <tr key={l.entry_id}>
                      <td>{isoToLocal(l.created_at).toFormat('LLL d · h:mm a')}</td>
                      <td>{l.entry_type}</td>
                      <td>{l.amount}</td>
                      <td>{l.session_starts_at ? `${isoToLocal(l.session_starts_at).toFormat('LLL d')} (${l.attendance_status})` : '—'}</td>
                      <td>{l.note || ''}</td>
                    </tr>
                  ))}
                  {wallet.ledger.length === 0 && <tr><td colSpan="5">No entries yet</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <Modal isOpen={adjustOpen} onClose={() => setAdjustOpen(false)}>
        <form className="sc-modal" onSubmit={submitEntry}>
          <h2>Adjust wallet</h2>
          <div className="hm-actions" style={{ margin: '10px 0' }}>
            {REASON_CHIPS.map((c) => (
              <button
                key={c.entry_type}
                type="button"
                className={`status-pill status-pill--info`}
                style={{
                  cursor: 'pointer', border: 'none',
                  opacity: entry.entry_type === c.entry_type ? 1 : 0.5,
                }}
                onClick={() => setEntry((x) => ({ ...x, entry_type: c.entry_type }))}
              >
                {c.label}
              </button>
            ))}
          </div>
          <input
            type="number" placeholder="Credits" required value={entry.amount}
            onChange={(e) => setEntry((x) => ({ ...x, amount: e.target.value }))}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)', marginBottom: 8 }}
          />
          <input
            type="text" placeholder="Note (optional)" value={entry.note}
            onChange={(e) => setEntry((x) => ({ ...x, note: e.target.value }))}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)', marginBottom: 8 }}
          />
          <div className="hm-actions">
            <button type="button" className="hm-btn" onClick={() => setAdjustOpen(false)}>Cancel</button>
            <button type="submit" className="hm-btn primary">Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default WalletView;
