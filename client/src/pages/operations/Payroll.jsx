// Staff Payroll (design handoff README > Staff app > "Financial dashboard
// & Payroll"): per-instructor hours/rate/bonus/status with Run payroll /
// Generate payslips actions. There is no payroll endpoint or table
// anywhere in the server, and per-instructor pay/hours-worked is
// explicitly parked pending the Top-Up spec (docs/client-ui-plan.md) —
// same status as the Financial-Dashboard pages, which are still mock
// data. The shellNav "Payroll" item previously pointed nowhere (silently
// bounced to /home via the catch-all); this at least tells staff why.
import '@/css/attendance.css';

function Payroll() {
  return (
    <div className="at-page">
      <h1 className="at-title">Payroll</h1>
      <div className="hm-card">
        <p>Payroll isn't available yet — there's no payroll backend built.</p>
        <p className="at-subtitle">Parked alongside the finance dashboards pending the Top-Up spec.</p>
      </div>
    </div>
  );
}

export default Payroll;
