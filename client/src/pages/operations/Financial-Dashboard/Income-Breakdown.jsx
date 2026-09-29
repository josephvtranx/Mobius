// Income breakdown — revenue by month (bar chart + table) and by payment
// method, all derived from the real payments table. Per-subject revenue
// stays out of scope: a payment records money received from a student, not
// which subject/class it paid for — there's no honest link to split on.
// No in-page title — the topbar crumb says Income breakdown.
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import paymentService from '@/services/paymentService';
import { money, FIN_COLORS, MonthBarChart, FinEmpty } from './finViz';
import '@/css/home.css';
import '@/css/table.css';
import '@/css/finance-pages.css';

const MONTHS_BACK = 6;

function IncomeBreakdown() {
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const start = DateTime.now().minus({ months: MONTHS_BACK - 1 }).startOf('month').toISODate();
    const end = DateTime.now().endOf('month').toISODate();
    paymentService.getPayments({ start, end })
      .then(setPayments)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load income breakdown'));
  }, []);

  if (error) return <div className="hm-page"><div className="hm-error">{error}</div></div>;
  if (!payments) return <div className="hm-page"><div className="hm-loading">Loading…</div></div>;

  const months = Array.from({ length: MONTHS_BACK }, (_, i) => {
    const d = DateTime.now().minus({ months: MONTHS_BACK - 1 - i });
    return { key: d.toFormat('yyyy-LL'), label: d.toFormat('LLL'), full: d.toFormat('LLLL yyyy'), values: { revenue: 0 } };
  });
  const byKey = new Map(months.map((m) => [m.key, m]));
  const byMethod = new Map();
  for (const p of payments) {
    const m = byKey.get(DateTime.fromISO(p.payment_date).toFormat('yyyy-LL'));
    if (m) m.values.revenue += Number(p.amount);
    const method = p.method_name || 'Unrecorded method';
    byMethod.set(method, (byMethod.get(method) ?? 0) + Number(p.amount));
  }
  const total = months.reduce((s, m) => s + m.values.revenue, 0);
  const methods = [...byMethod.entries()].sort((a, b) => b[1] - a[1]);

  if (total === 0) {
    return (
      <div className="hm-page fin-page fin-breakdown-page">
        <FinEmpty sub={`No payments recorded in the last ${MONTHS_BACK} months — record one on the Payments page.`} />
      </div>
    );
  }

  return (
    <div className="hm-page fin-page fin-breakdown-page">
      <section className="fin-section fin-chart-section">
        <header className="fin-section-head">
          <div>
            <h2>Revenue by month</h2>
            <p>Recorded payments across the last {MONTHS_BACK} months.</p>
          </div>
          <div className="fin-section-total">
            <span>Six-month total</span>
            <strong>{money(total)}</strong>
          </div>
        </header>
        <MonthBarChart series={[{ key: 'revenue', label: 'Revenue', color: FIN_COLORS.revenue }]} months={months} />
      </section>

      <div className="fin-breakdown-grid">
        <section className="fin-breakdown-column">
          <header className="fin-section-head">
            <div><h2>By payment method</h2><p>Share of recorded revenue in this window.</p></div>
          </header>
          <div className="fin-method-list">
            {methods.map(([method, amount]) => (
              <div className="fin-method-row" key={method}>
                <div className="fin-method-copy">
                  <span>{method}</span>
                  <strong>{money(amount)}</strong>
                </div>
                <div className="fin-method-track" aria-hidden="true">
                  <span style={{ width: `${Math.round((amount / total) * 100)}%`, background: FIN_COLORS.revenue }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="fin-breakdown-column">
          <header className="fin-section-head">
            <div><h2>Month by month</h2><p>Exact totals from the payment ledger.</p></div>
          </header>
          <div className="hm-table-wrap fin-table-wrap">
            <table className="hm-table fin-table">
              <thead><tr><th>Month</th><th>Revenue</th></tr></thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.key}><td>{m.full}</td><td>{money(m.values.revenue)}</td></tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td><strong>Total</strong></td><td><strong>{money(total)}</strong></td></tr>
              </tfoot>
            </table>
          </div>
        </section>
      </div>

      <div className="fin-note">
        <i className="fa-solid fa-circle-info" aria-hidden="true" />
        <p>Per-subject revenue isn't tracked — a payment records money received from a student, not which class it was for.</p>
      </div>
    </div>
  );
}

export default IncomeBreakdown;
