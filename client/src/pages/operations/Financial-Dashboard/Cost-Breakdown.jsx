// Cost breakdown (design handoff: Mobius Staff.dc.html Financial
// dashboard). Payroll cost is now real — grouped from the actual payroll
// runs (Payroll.jsx/payrollRoutes.js), which already exist. Operating
// expenses (rent, marketing, materials, etc.) have a real table
// (operating_expenses) but no API/UI yet — flagged honestly rather than
// built here, since it needs its own decisions (pa_code/cost-center
// tagging) not part of this pass.
import { useEffect, useState } from 'react';
import payrollService from '@/services/payrollService';
import '@/css/home.css';
import '@/css/table.css';

const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

  const byType = new Map();
  for (const h of history) {
    byType.set(h.user_type, (byType.get(h.user_type) ?? 0) + Number(h.total_pay));
  }
  const totalPayroll = [...byType.values()].reduce((s, v) => s + v, 0);

  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>Cost breakdown</h1>
        <p>Payroll paid out to date, by role.</p>
      </header>

      <div className="hm-card">
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Category</th><th>Total paid</th></tr></thead>
            <tbody>
              {[...byType.entries()].map(([type, total]) => (
                <tr key={type}><td style={{ textTransform: 'capitalize' }}>{type} payroll</td><td>{money(total)}</td></tr>
              ))}
              {byType.size === 0 && <tr><td colSpan="2">No payroll runs yet.</td></tr>}
            </tbody>
            <tfoot>
              <tr><td><strong>Total payroll</strong></td><td><strong>{money(totalPayroll)}</strong></td></tr>
            </tfoot>
          </table>
        </div>
        <p className="at-subtitle" style={{ marginTop: 10 }}>
          Operating expenses (rent, marketing, materials, etc.) aren't tracked here yet — there's a real table for them
          but no entry screen. This shows payroll cost only, not full operating expense.
        </p>
      </div>
    </div>
  );
}

export default CostBreakdown;
