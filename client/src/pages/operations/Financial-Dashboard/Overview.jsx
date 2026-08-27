// Financial dashboard overview (design handoff: Mobius Staff.dc.html
// FINANCE view, adapted to the data that actually exists). Revenue comes
// from recorded payments, cost from payroll runs; profit = the difference,
// labeled for what it is (payroll-only cost — operating_expenses has a
// schema but no API yet). The mock's recognised/deferred split, session
// deltas and churn-risk figures have no schema source and are omitted
// rather than invented. No in-page title — the topbar crumb says Overview.
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import reportService from '@/services/reportService';
import classService from '@/services/classService';
import studentService from '@/services/studentService';
import paymentService from '@/services/paymentService';
import payrollService from '@/services/payrollService';
import { money, FIN_COLORS, MonthBarChart, FinEmpty } from './finViz';
import '@/css/home.css';

const MONTHS_BACK = 6;
const monthKey = (iso) => DateTime.fromISO(iso).toFormat('yyyy-LL');

function Overview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const start = DateTime.now().minus({ months: MONTHS_BACK - 1 }).startOf('month').toISODate();
    const end = DateTime.now().endOf('month').toISODate();
    Promise.all([
      reportService.getDashboard(),
      classService.getAllClasses(),
      studentService.getAllStudents(),
      paymentService.getPayments({ start, end }),
      payrollService.getHistory(),
    ])
      .then(([dash, classes, students, payments, payroll]) => setData({ dash, classes, students, payments, payroll }))
      .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard'));
  }, []);

  if (error) return <div className="hm-page"><div className="hm-error">{error}</div></div>;
  if (!data) return <div className="hm-page"><div className="hm-loading">Loading…</div></div>;

  // Month buckets, oldest → newest.
  const months = Array.from({ length: MONTHS_BACK }, (_, i) => {
    const d = DateTime.now().minus({ months: MONTHS_BACK - 1 - i });
    return { key: d.toFormat('yyyy-LL'), label: d.toFormat('LLL'), values: { revenue: 0, cost: 0, profit: 0 } };
  });
  const byKey = new Map(months.map((m) => [m.key, m]));
  for (const p of data.payments) {
    const m = byKey.get(monthKey(p.payment_date));
    if (m) m.values.revenue += Number(p.amount);
  }
  for (const r of data.payroll) {
    const m = byKey.get(monthKey(r.pay_period_start));
    if (m) m.values.cost += Number(r.total_pay);
  }
  months.forEach((m) => { m.values.profit = m.values.revenue - m.values.cost; });

  const thisMonth = months[months.length - 1].values;
  const lastMonth = months[months.length - 2].values;
  const revenueDelta = lastMonth.revenue > 0
    ? Math.round(((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100)
    : null;
  const activeClasses = data.classes.filter((c) => c.status === 'active').length;
  const delinquent = data.dash.delinquency_queue.length;
  const pendingRequests = data.dash.pending_requests_aging.reduce((s, r) => s + r.open, 0);
  const anyMoney = months.some((m) => m.values.revenue !== 0 || m.values.cost !== 0);

  return (
    <div className="hm-page">
      <div className="hm-kpis">
        <div className="hm-kpi">
          <span className="hm-kpi-value">{money(thisMonth.revenue)}</span>
          <span className="hm-kpi-label">
            Revenue this month
            {revenueDelta != null && (
              <span style={{ marginLeft: 6, fontWeight: 600, color: revenueDelta >= 0 ? '#2c8a5b' : '#a03634' }}>
                <i className={`fa-solid fa-caret-${revenueDelta >= 0 ? 'up' : 'down'}`} style={{ marginRight: 3 }} />
                {Math.abs(revenueDelta)}%
              </span>
            )}
          </span>
        </div>
        <div className="hm-kpi">
          <span className="hm-kpi-value" style={{ color: thisMonth.profit < 0 ? '#a03634' : undefined }}>{money(thisMonth.profit)}</span>
          <span className="hm-kpi-label">Profit this month (vs payroll)</span>
        </div>
        <div className="hm-kpi"><span className="hm-kpi-value">{data.students.length}</span><span className="hm-kpi-label">Active students</span></div>
        <div className="hm-kpi"><span className="hm-kpi-value">{activeClasses}</span><span className="hm-kpi-label">Active classes</span></div>
        <div className={`hm-kpi ${delinquent ? 'alert' : ''}`}>
          <span className="hm-kpi-value">{delinquent}</span><span className="hm-kpi-label">Delinquent wallets</span>
        </div>
        <div className="hm-kpi"><span className="hm-kpi-value">{pendingRequests}</span><span className="hm-kpi-label">Pending requests</span></div>
      </div>

      {anyMoney ? (
        <div className="hm-card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Revenue, cost &amp; profit</div>
          <div style={{ fontSize: 12, color: '#7d6a5c', marginBottom: 14 }}>Last {MONTHS_BACK} months — hover a month for exact figures.</div>
          <MonthBarChart
            series={[
              { key: 'revenue', label: 'Revenue', color: FIN_COLORS.revenue },
              { key: 'cost', label: 'Cost (payroll)', color: FIN_COLORS.cost },
              { key: 'profit', label: 'Profit', color: FIN_COLORS.profit },
            ]}
            months={months}
          />
        </div>
      ) : (
        <FinEmpty sub="Once tuition payments and payroll runs start flowing, they show up here." />
      )}

      <div className="hm-card">
        <p style={{ margin: 0, fontSize: 13.5, color: '#5c4632', lineHeight: 1.55 }}>
          Revenue comes straight from <a className="hm-link" href="/operations/finance/payments">recorded payments</a>;
          cost is payroll only — operating expenses (rent, marketing, materials) have a schema but no entry screen yet,
          so profit here overstates true margin. Month splits use each payment's date and each payroll period's start.
        </p>
      </div>
    </div>
  );
}

export default Overview;
