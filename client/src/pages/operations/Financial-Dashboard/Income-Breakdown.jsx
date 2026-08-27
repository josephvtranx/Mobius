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
      <div className="hm-page">
        <FinEmpty sub={`No payments recorded in the last ${MONTHS_BACK} months — record one on the Payments page.`} />
      </div>
    );
  }

  return (
    <div className="hm-page">
      <div className="hm-card" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Revenue by month</div>
        <div style={{ fontSize: 12, color: '#7d6a5c', marginBottom: 14 }}>
          Recorded payments, last {MONTHS_BACK} months · {money(total)} total
        </div>
        <MonthBarChart series={[{ key: 'revenue', label: 'Revenue', color: FIN_COLORS.revenue }]} months={months} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20, alignItems: 'start' }}>
        <div className="hm-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>By payment method</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {methods.map(([method, amount]) => (
              <div key={method}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{method}</span>
                  <span style={{ fontWeight: 600 }}>{money(amount)}</span>
                </div>
                <div style={{ height: 7, borderRadius: 999, background: '#f0e9e2', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 999, width: `${Math.round((amount / total) * 100)}%`, background: FIN_COLORS.revenue }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hm-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Month by month</div>
          <div className="hm-table-wrap">
            <table className="hm-table">
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
        </div>
      </div>

      <div className="hm-card">
        <p style={{ margin: 0, fontSize: 13.5, color: '#5c4632', lineHeight: 1.55 }}>
          Per-subject revenue isn't tracked — a payment records money received from a student, not which class it was for.
        </p>
      </div>
    </div>
  );
}

export default IncomeBreakdown;
