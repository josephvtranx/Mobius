// Financial dashboard overview (design handoff: Mobius Staff.dc.html
// "## Financial dashboard & Payroll"). Revenue is now real — the
// payments table (previously unused, see Payments.jsx) tracks money
// actually received. Profit/margin still isn't shown: operating_expenses
// exists in the schema but has no API yet (see Cost-Breakdown.jsx), and
// showing "profit" against payroll cost alone would overstate what's
// tracked. Active students/classes, delinquent wallets and pending
// requests are the same real signals staff Home.jsx already shows.
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import reportService from '@/services/reportService';
import classService from '@/services/classService';
import studentService from '@/services/studentService';
import paymentService from '@/services/paymentService';
import '@/css/home.css';

const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const monthStart = DateTime.now().startOf('month').toISODate();
    const monthEnd = DateTime.now().endOf('month').toISODate();
    Promise.all([
      reportService.getDashboard(),
      classService.getAllClasses(),
      studentService.getAllStudents(),
      paymentService.getPayments({ start: monthStart, end: monthEnd }),
    ])
      .then(([dash, classes, students, monthPayments]) => setData({ dash, classes, students, monthPayments }))
      .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard'));
  }, []);

  if (error) return <div className="hm-page"><div className="hm-error">{error}</div></div>;
  if (!data) return <div className="hm-page"><div className="hm-loading">Loading…</div></div>;

  const activeClasses = data.classes.filter((c) => c.status === 'active').length;
  const revenueThisMonth = data.monthPayments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>Financial dashboard</h1>
        <p>Academy-wide health, drawn from real enrollment and billing data.</p>
      </header>

      <div className="hm-kpis">
        <div className="hm-kpi"><span className="hm-kpi-value">{money(revenueThisMonth)}</span><span className="hm-kpi-label">Revenue this month</span></div>
        <div className="hm-kpi"><span className="hm-kpi-value">{data.students.length}</span><span className="hm-kpi-label">Active students</span></div>
        <div className="hm-kpi"><span className="hm-kpi-value">{activeClasses}</span><span className="hm-kpi-label">Active classes</span></div>
        <div className={`hm-kpi ${data.dash.delinquency_queue.length ? 'alert' : ''}`}>
          <span className="hm-kpi-value">{data.dash.delinquency_queue.length}</span><span className="hm-kpi-label">Delinquent wallets</span>
        </div>
        <div className="hm-kpi"><span className="hm-kpi-value">{data.dash.pending_requests_aging.reduce((s, r) => s + r.open, 0)}</span><span className="hm-kpi-label">Pending requests</span></div>
      </div>

      <div className="hm-card">
        <p>Revenue comes straight from <a className="hm-link" href="/operations/finance/payments">recorded payments</a>. Full profit/margin reporting isn't available yet — operating expenses (rent, marketing, etc.) have a schema but no entry screen; see Cost breakdown for the payroll side of costs.</p>
      </div>
    </div>
  );
}

export default Overview;
