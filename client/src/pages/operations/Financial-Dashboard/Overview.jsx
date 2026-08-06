// Financial dashboard overview (design handoff: Mobius Staff.dc.html
// "## Financial dashboard & Payroll"). The design's revenue/expense/profit
// charts assume a payments ledger that doesn't exist in the real schema —
// server/src/app.js flags paymentRoutes.js itself as querying dropped v1
// tables (payments/invoices), and there is no /reports endpoint for
// revenue. Real, honest KPIs (active students/classes, delinquent wallets,
// pending requests — the same data staff Home.jsx already shows) fill the
// header; the rest is a plain "not available yet" note, same pattern as
// Pay.jsx/Payroll.jsx, instead of fabricated charts.
import { useEffect, useState } from 'react';
import reportService from '@/services/reportService';
import classService from '@/services/classService';
import studentService from '@/services/studentService';
import '@/css/home.css';

function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      reportService.getDashboard(),
      classService.getAllClasses(),
      studentService.getAllStudents(),
    ])
      .then(([dash, classes, students]) => setData({ dash, classes, students }))
      .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard'));
  }, []);

  if (error) return <div className="hm-page"><div className="hm-error">{error}</div></div>;
  if (!data) return <div className="hm-page"><div className="hm-loading">Loading…</div></div>;

  const activeClasses = data.classes.filter((c) => c.status === 'active').length;

  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>Financial dashboard</h1>
        <p>Academy-wide health, drawn from real enrollment and billing data.</p>
      </header>

      <div className="hm-kpis">
        <div className="hm-kpi"><span className="hm-kpi-value">{data.students.length}</span><span className="hm-kpi-label">Active students</span></div>
        <div className="hm-kpi"><span className="hm-kpi-value">{activeClasses}</span><span className="hm-kpi-label">Active classes</span></div>
        <div className={`hm-kpi ${data.dash.delinquency_queue.length ? 'alert' : ''}`}>
          <span className="hm-kpi-value">{data.dash.delinquency_queue.length}</span><span className="hm-kpi-label">Delinquent wallets</span>
        </div>
        <div className="hm-kpi"><span className="hm-kpi-value">{data.dash.pending_requests_aging.reduce((s, r) => s + r.open, 0)}</span><span className="hm-kpi-label">Pending requests</span></div>
      </div>

      <div className="hm-card">
        <p>Revenue, expense and profitability reporting isn't available yet — there's no payments ledger wired up on the backend (the wallet/credit system tracks session credits, not dollars). The KPIs above are real and update live; a proper financial report replaces this note once that backend exists.</p>
      </div>
    </div>
  );
}

export default Overview;
