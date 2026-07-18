// v2 staff reports (template — spec 08 dashboard signals + spec 06 ACA-3
// note completion). Plain tables; chart polish belongs to the finance pages'
// later pass.
import { useEffect, useState } from 'react';
import reportService from '@/services/reportService';

const pct = (rate) => (rate === null || rate === undefined ? '—' : `${Math.round(rate * 100)}%`);

function ReportsDashboard() {
  const [dash, setDash] = useState(null);
  const [notes, setNotes] = useState(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    reportService.getDashboard().then(setDash)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  useEffect(() => {
    reportService.getNoteCompletion(days).then(setNotes).catch(() => {});
  }, [days]);

  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!dash) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Reports (v2)</h1>

      <h2>Instructor cancel rate (60d)</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>Instructor</th><th>Cancelled</th><th>Taught</th><th>Rate</th></tr></thead>
        <tbody>
          {dash.instructor_cancel_rate.map((r) => (
            <tr key={r.instructor_id}>
              <td>{r.instructor}</td><td>{r.cancelled}</td><td>{r.taught}</td><td>{pct(r.rate)}</td>
            </tr>
          ))}
          {dash.instructor_cancel_rate.length === 0 && <tr><td colSpan="4">No taught sessions in window</td></tr>}
        </tbody>
      </table>

      <h2>Auto-completed sessions pending verification ({dash.auto_completed_pending.count})</h2>
      <ul>
        {dash.auto_completed_pending.tasks.map((t) => (
          <li key={t.task_id}>session {t.session_id} — flagged {String(t.created_at).slice(0, 10)}</li>
        ))}
        {dash.auto_completed_pending.count === 0 && <li>Queue empty</li>}
      </ul>

      <h2>Delinquency queue</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>Student</th><th>Balance</th><th>Days open</th></tr></thead>
        <tbody>
          {dash.delinquency_queue.map((d) => (
            <tr key={d.task_id}><td>{d.student}</td><td>{d.balance}</td><td>{d.days_open}</td></tr>
          ))}
          {dash.delinquency_queue.length === 0 && <tr><td colSpan="3">Nobody in grace</td></tr>}
        </tbody>
      </table>

      <h2>Serial movers (≥3 reschedules / 30d)</h2>
      <ul>
        {dash.serial_movers.map((m) => (
          <li key={m.student_id}>{m.student} — {m.requests} requests</li>
        ))}
        {dash.serial_movers.length === 0 && <li>None</li>}
      </ul>

      <h2>Open staff tasks by kind</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>Kind</th><th>Open</th><th>Oldest (days)</th></tr></thead>
        <tbody>
          {dash.pending_requests_aging.map((t) => (
            <tr key={t.kind}><td>{t.kind}</td><td>{t.open}</td><td>{t.oldest_days}</td></tr>
          ))}
          {dash.pending_requests_aging.length === 0 && <tr><td colSpan="3">Nothing open</td></tr>}
        </tbody>
      </table>

      <h2>
        Note completion — trailing
        <input type="number" min="1" max="365" value={days} style={{ width: 60, margin: '0 6px' }}
          onChange={(e) => setDays(Number(e.target.value) || 30)} />
        days
      </h2>
      {notes && (
        <>
          <table border="1" cellPadding="6">
            <thead><tr><th>Instructor</th><th>Noted</th><th>Marked</th><th>Rate</th></tr></thead>
            <tbody>
              {notes.by_instructor.map((r) => (
                <tr key={r.instructor_id}>
                  <td>{r.instructor}</td><td>{r.noted}</td><td>{r.marked}</td><td>{pct(r.rate)}</td>
                </tr>
              ))}
              {notes.by_instructor.length === 0 && <tr><td colSpan="4">No marked sessions in window</td></tr>}
            </tbody>
          </table>
          <p>{notes.missing.length} attendance-marked student-sessions missing notes.</p>
        </>
      )}
    </div>
  );
}

export default ReportsDashboard;
