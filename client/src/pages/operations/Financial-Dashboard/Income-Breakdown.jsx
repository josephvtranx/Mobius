// Income breakdown (design handoff: Mobius Staff.dc.html Financial
// dashboard). Revenue-by-month is now real, derived from the payments
// table (see Overview.jsx/Payments.jsx). Per-subject revenue stays out of
// scope: payments record a dollar amount received from a student, not
// which subject/class it paid for — there's no real link between a
// payment and a subject to derive that split from honestly.
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import paymentService from '@/services/paymentService';
import '@/css/home.css';
import '@/css/table.css';

const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const MONTHS_BACK = 6;

function IncomeBreakdown() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const start = DateTime.now().minus({ months: MONTHS_BACK - 1 }).startOf('month').toISODate();
    const end = DateTime.now().endOf('month').toISODate();
    paymentService.getPayments({ start, end })
      .then((payments) => {
        const byMonth = new Map();
        for (let i = 0; i < MONTHS_BACK; i++) {
          const key = DateTime.now().minus({ months: MONTHS_BACK - 1 - i }).toFormat('yyyy-LL');
          byMonth.set(key, 0);
        }
        for (const p of payments) {
          const key = DateTime.fromISO(p.payment_date).toFormat('yyyy-LL');
          if (byMonth.has(key)) byMonth.set(key, byMonth.get(key) + Number(p.amount));
        }
        setRows([...byMonth.entries()].map(([key, total]) => ({
          label: DateTime.fromFormat(key, 'yyyy-LL').toFormat('LLLL yyyy'), total,
        })));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load income breakdown'));
  }, []);

  if (error) return <div className="hm-page"><div className="hm-error">{error}</div></div>;
  if (!rows) return <div className="hm-page"><div className="hm-loading">Loading…</div></div>;

  const total = rows.reduce((s, r) => s + r.total, 0);

  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>Income breakdown</h1>
        <p>Revenue by month, from recorded payments — the last {MONTHS_BACK} months.</p>
      </header>

      <div className="hm-card">
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Month</th><th>Revenue</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}><td>{r.label}</td><td>{money(r.total)}</td></tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td><strong>Total</strong></td><td><strong>{money(total)}</strong></td></tr>
            </tfoot>
          </table>
        </div>
        <p className="at-subtitle" style={{ marginTop: 10 }}>
          Per-subject revenue isn't tracked — a payment records money received from a student, not which class it was for.
        </p>
      </div>
    </div>
  );
}

export default IncomeBreakdown;
