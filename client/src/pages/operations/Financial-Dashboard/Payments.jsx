// Payments (design handoff: Mobius Staff.dc.html Financial dashboard). The
// old version of this page called paymentService -> /api/payments/*, which
// server/src/app.js itself flags as hitting dropped v1 tables — that data
// was never real. Real per-student credit activity already lives on
// Wallets (operations/wallets); this stays an honest stub until an actual
// payments/invoicing backend exists, same pattern as Pay.jsx/Payroll.jsx.
import { Link } from 'react-router-dom';
import '@/css/home.css';

function Payments() {
  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>Payments</h1>
      </header>
      <div className="hm-card">
        <p>Invoicing and payment collection aren't available yet — there's no payments backend wired up (the previous version of this page called an endpoint that queries tables the real schema doesn't have).</p>
        <p className="hm-kpi-label" style={{ marginTop: 10 }}>
          Real, per-student credit activity is already tracked — see <Link className="hm-link" to="/operations/wallets">Wallets</Link>.
        </p>
      </div>
    </div>
  );
}

export default Payments;
