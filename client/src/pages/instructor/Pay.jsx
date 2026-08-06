// Instructor Pay (design handoff README > Instructor app > Pay): real
// payroll history now that payroll/time_logs have an API. Salaried
// instructors see a flat per-run amount; hourly instructors see the real
// hours (computed server-side from completed class_sessions) and rate
// behind each number — nothing here is restated or recomputed client-side.
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import payrollService from '@/services/payrollService';
import { isoToLocal } from 'mobius-lms';
import '@/css/attendance.css';
import '@/css/table.css';

const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// pay_period_start/end are plain DATE columns, not instants — format them
// directly rather than through isoToLocal (which assumes a UTC instant and
// would shift the calendar date depending on the viewer's timezone).
const dateFmt = (d, fmt = 'LLL d, yyyy') => DateTime.fromISO(d).toFormat(fmt);

function Pay() {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    payrollService.getMine()
      .then(setHistory)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load payroll history'));
  }, []);

  if (error) return <div className="at-page"><div className="hm-error">{error}</div></div>;
  if (!history) return <div className="at-page"><div className="hm-loading">Loading…</div></div>;

  const latest = history[0];

  return (
    <div className="at-page">
      <h1 className="at-title">Pay</h1>

      {latest && (
        <div className="hm-card" style={{ marginBottom: 16 }}>
          <div className="hm-card-head"><h2>Most recent payout</h2></div>
          <div className="hm-wallet">
            <div><span className="hm-kpi-value">{money(latest.total_pay)}</span><span className="hm-kpi-label">Total pay</span></div>
          </div>
          <p className="at-subtitle" style={{ marginTop: 8 }}>
            {dateFmt(latest.pay_period_start, 'LLL d')} – {dateFmt(latest.pay_period_end)}
          </p>
        </div>
      )}

      <div className="hm-card">
        <div className="hm-card-head"><h2>History</h2></div>
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Period</th><th>Total pay</th><th>Paid on</th></tr></thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.payroll_id}>
                  <td>{dateFmt(h.pay_period_start, 'LLL d')} – {dateFmt(h.pay_period_end)}</td>
                  <td>{money(h.total_pay)}</td>
                  <td>{isoToLocal(h.generated_at).toFormat('LLL d, yyyy')}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan="3">No payroll runs yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <p className="at-subtitle" style={{ marginTop: 12 }}>
        Hourly pay comes straight from sessions you've completed — nothing restated here. Payroll is run by Operations.
      </p>
    </div>
  );
}

export default Pay;
