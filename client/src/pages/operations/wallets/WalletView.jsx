// v2 wallet console (template — spec 04): per-student balance/committed/
// available, the credit ledger, and staff manual entries. Server validation
// messages render verbatim (polish later).
import { useEffect, useState } from 'react';
import walletService from '@/services/walletService';
import studentService from '@/services/studentService';
import { isoToLocal } from 'mobius-lms';

function WalletView() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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
        note: entry.note || undefined
      });
      setNotice(`Entry ${result.entry.entry_id} recorded — balance ${result.balance}`);
      setEntry({ entry_type: 'purchase', amount: '', note: '' });
      load(studentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Entry failed');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Wallets (v2)</h1>
      <p>
        <select value={studentId} onChange={pick}>
          <option value="">— pick student —</option>
          {students.map((s) => (
            <option key={s.student_id ?? s.user_id} value={s.student_id ?? s.user_id}>
              {s.name}
            </option>
          ))}
        </select>
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {notice && <p style={{ color: 'green' }}>{notice}</p>}

      {wallet && (
        <>
          <h2>
            Balance {wallet.balance} · Committed {wallet.committed} · Available {wallet.available}
          </h2>

          <h3>Committed by enrollment</h3>
          <table border="1" cellPadding="6">
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

          <h3>Manual entry (staff top-up stopgap)</h3>
          <form onSubmit={submitEntry} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={entry.entry_type}
              onChange={(e) => setEntry((x) => ({ ...x, entry_type: e.target.value }))}>
              <option value="purchase">purchase</option>
              <option value="bonus">bonus</option>
              <option value="adjustment">adjustment (±)</option>
            </select>
            <input type="number" placeholder="credits" value={entry.amount} required
              onChange={(e) => setEntry((x) => ({ ...x, amount: e.target.value }))} />
            <input type="text" placeholder="note" value={entry.note}
              onChange={(e) => setEntry((x) => ({ ...x, note: e.target.value }))} />
            <button type="submit">Record</button>
          </form>

          <h3>Ledger (latest 50)</h3>
          <table border="1" cellPadding="6">
            <thead><tr><th>When</th><th>Type</th><th>Amount</th><th>Session</th><th>Note</th></tr></thead>
            <tbody>
              {wallet.ledger.map((l) => (
                <tr key={l.entry_id}>
                  <td>{isoToLocal(l.created_at)}</td>
                  <td>{l.entry_type}</td>
                  <td>{l.amount}</td>
                  <td>{l.session_starts_at ? `${isoToLocal(l.session_starts_at)} (${l.attendance_status})` : '—'}</td>
                  <td>{l.note || ''}</td>
                </tr>
              ))}
              {wallet.ledger.length === 0 && <tr><td colSpan="5">No entries yet</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default WalletView;
