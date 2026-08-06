// Income breakdown (design handoff: Mobius Staff.dc.html Financial
// dashboard). Per-subject revenue requires a real payments ledger that
// doesn't exist (see Overview.jsx) — honest stub rather than fabricated
// charts, same pattern as Pay.jsx/Payroll.jsx.
import '@/css/home.css';

function IncomeBreakdown() {
  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>Income breakdown</h1>
      </header>
      <div className="hm-card">
        <p>Per-subject revenue breakdowns aren't available yet — there's no payments ledger on the backend to derive them from. Check the Financial dashboard overview for the real, currently-tracked KPIs.</p>
      </div>
    </div>
  );
}

export default IncomeBreakdown;
