// Cost breakdown — payroll by month (bar chart) and by role, from real
// payroll runs. Operating expenses (rent, marketing, materials) have a real
// table (operating_expenses) but no API/UI yet — flagged honestly rather
// than built here, since it needs its own decisions (cost-center tagging).
// No in-page title — the topbar crumb says Cost breakdown.
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import payrollService from '@/services/payrollService';
import { money, FIN_COLORS, MonthBarChart, FinEmpty } from './finViz';
import '@/css/home.css';
import '@/css/table.css';
import '@/css/finance-pages.css';

const MONTHS_BACK = 6;

function CostBreakdown() {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    payrollService.getHistory()
      .then(setHistory)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load cost breakdown'));
  }, []);

  if (error) return <div className="hm-page"><div className="hm-error">{error}</div></div>;
  if (!history) return <div className="hm-page"><div className="hm-loading">Loading…</div></div>;

  const months = Array.from({ length: MONTHS_BACK }, (_, i) => {
    const d = DateTime.now().minus({ months: MONTHS_BACK - 1 - i });
    return { key: d.toFormat('yyyy-LL'), label: d.toFormat('LLL'), values: { cost: 0 } };
  });
  const byKey = new Map(months.map((m) => [m.key, m]));
  const byType = new Map();
  for (const r of history) {
    const m = byKey.get(DateTime.fromISO(r.pay_period_start).toFormat('yyyy-LL'));
    if (m) m.values.cost += Number(r.total_pay);
    byType.set(r.user_type, (byType.get(r.user_type) ?? 0) + Number(r.total_pay));
  }
  const totalPayroll = [...byType.values()].reduce((s, v) => s + v, 0);
  const sixMonthTotal = months.reduce((s, m) => s + m.values.cost, 0);

  if (history.length === 0) {
    return (
      <div className="hm-page fin-page fin-breakdown-page">
        <FinEmpty sub="No payroll runs yet — run one from the Payroll page and it shows up here." />
      </div>
    );
  }

  return (
    <div className="hm-page fin-page fin-breakdown-page">
      <section className="fin-section fin-chart-section">
        <header className="fin-section-head">
          <div>
            <h2>Payroll by month</h2>
            <p>Last {MONTHS_BACK} months, grouped by pay-period start.</p>
          </div>
          <div className="fin-section-total">
            <span>Six-month total</span>
            <strong>{money(sixMonthTotal)}</strong>
          </div>
        </header>
        <MonthBarChart series={[{ key: 'cost', label: 'Payroll', color: FIN_COLORS.cost }]} months={months} />
      </section>

      <section className="fin-section fin-role-section">
        <header className="fin-section-head">
          <div><h2>Payroll by role</h2><p>All recorded payroll runs.</p></div>
          <div className="fin-section-total">
            <span>All-time total</span>
            <strong>{money(totalPayroll)}</strong>
          </div>
        </header>
        <div className="hm-table-wrap fin-table-wrap">
          <table className="hm-table fin-table">
            <thead><tr><th>Category</th><th>Total paid</th></tr></thead>
            <tbody>
              {[...byType.entries()].map(([type, total]) => (
                <tr key={type}><td style={{ textTransform: 'capitalize' }}>{type} payroll</td><td>{money(total)}</td></tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td><strong>Total payroll</strong></td><td><strong>{money(totalPayroll)}</strong></td></tr>
            </tfoot>
          </table>
        </div>
      </section>

      <div className="fin-note">
        <i className="fa-solid fa-circle-info" aria-hidden="true" />
        <p>Operating expenses (rent, marketing, materials, etc.) aren't tracked here yet — there's a real table for them but no entry screen. This shows payroll cost only, not full operating expense.</p>
      </div>
    </div>
  );
}

export default CostBreakdown;
