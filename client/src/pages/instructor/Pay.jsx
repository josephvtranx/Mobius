// Instructor Pay (design handoff README > Instructor app > Pay): read-only
// hours/gross/next-payout view, sourced from submitted attendance. There is
// no payroll/hours/payout endpoint or table anywhere in the server (checked
// server/src/routes and helpers) — this is a real, unbuilt backend gap, not
// something to fake numbers for. Ships as an honest placeholder instead.
import '@/css/attendance.css';

function Pay() {
  return (
    <div className="at-page">
      <h1 className="at-title">Pay</h1>
      <div className="hm-card">
        <p>Pay tracking isn't available yet — hours and payouts aren't wired up on the backend.</p>
        <p className="at-subtitle">
          Once submitted, hours will come straight from the attendance you take —
          nothing restated here. Check back once payroll is built.
        </p>
      </div>
    </div>
  );
}

export default Pay;
