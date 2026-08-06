// Cost breakdown (design handoff: Mobius Staff.dc.html Financial
// dashboard). Instructor pay / operating-expense breakdowns require a real
// payroll and expense ledger that doesn't exist — honest stub, same
// pattern as Pay.jsx/Payroll.jsx.
import '@/css/home.css';

function CostBreakdown() {
  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>Cost breakdown</h1>
      </header>
      <div className="hm-card">
        <p>Expense and payroll cost breakdowns aren't available yet — there's no expense ledger or payroll backend wired up. See Payroll for the instructor-hours side once that's built.</p>
      </div>
    </div>
  );
}

export default CostBreakdown;
