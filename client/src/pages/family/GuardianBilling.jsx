// Guardian Billing (Mobius Guardian.dc.html Billing view). Balance/committed/
// available + the real credit ledger come straight from the same
// GET /wallets/:studentId a guardian is already authorized to read
// (canActForStudent) — no separate guardian-billing endpoint needed.
// Payments/invoices are now real too (payments/invoices tables, previously
// unused) — read-only here. There's still no card collection or payment
// links anywhere in the server, so "Payment method"/online top-up stay
// honest stubs (same pattern as instructor Pay.jsx / staff Payroll.jsx),
// not a fabricated checkout flow.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import walletService from '@/services/walletService';
import guardianPortalService from '@/services/guardianPortalService';
import paymentService from '@/services/paymentService';
import invoiceService from '@/services/invoiceService';
import { walletStatus } from '@/lib/derive';
import { isoToLocal } from 'mobius-lms';
import '@/css/home.css';
import '@/css/table.css';

const STATUS_TONE = { negative: 'error', low: 'warning', healthy: 'success' };
const INVOICE_TONE = { paid: 'success', pending: 'info', overdue: 'error', canceled: 'warning' };
const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// payment_date/issued_at/due_date are plain DATE columns, not instants.
const dateFmt = (d) => (d ? DateTime.fromISO(d).toFormat('LLL d, yyyy') : '—');

function GuardianBilling() {
  const { studentId } = useParams();
  const [wallet, setWallet] = useState(null);
  const [childName, setChildName] = useState('');
  const [payments, setPayments] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setWallet(null);
    setPayments(null);
    setInvoices(null);
    setError('');
    Promise.all([
      walletService.getWallet(studentId),
      guardianPortalService.getPortal(),
      paymentService.getStudentPayments(studentId),
      invoiceService.getStudentInvoices(studentId),
    ]).then(([w, portal, p, i]) => {
      setWallet(w);
      setChildName(portal.children.find((c) => String(c.student_id) === String(studentId))?.name ?? '');
      setPayments(p);
      setInvoices(i);
    }).catch((err) => setError(err.response?.data?.message || 'Failed to load billing'));
  }, [studentId]);

  if (error) return <div className="hm-error">{error}</div>;
  if (!wallet) return <div className="hm-loading">Loading…</div>;

  const status = walletStatus(wallet);

  return (
    <div className="hm-page">
      <p><Link to="/portal" className="hm-link">← Back to My children</Link></p>
      <header className="hm-greeting">
        <h1>Billing{childName ? ` — ${childName}` : ''}</h1>
      </header>

      <section className="hm-card">
        <div className="hm-card-head">
          <h2>Balance</h2>
          <span className={`status-pill status-pill--${STATUS_TONE[status]}`}>{status}</span>
        </div>
        <div className="hm-wallet">
          <div><span className="hm-kpi-value">{wallet.balance}</span><span className="hm-kpi-label">Balance</span></div>
          <div><span className="hm-kpi-value">{wallet.committed}</span><span className="hm-kpi-label">Committed</span></div>
          <div><span className="hm-kpi-value">{wallet.available}</span><span className="hm-kpi-label">Available</span></div>
        </div>
        {status !== 'healthy' && (
          <div className="hm-warn-note">
            {status === 'negative' ? 'Balance is negative.' : 'Available credits are running low.'} Contact the academy to top up.
          </div>
        )}
      </section>

      <section className="hm-card">
        <div className="hm-card-head"><h2>Committed by enrollment</h2></div>
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Subject</th><th>Committed</th><th>Sessions counted</th></tr></thead>
            <tbody>
              {wallet.per_enrollment.map((e) => (
                <tr key={e.enrollment_id}>
                  <td>{e.subject}</td>
                  <td>{e.committed}</td>
                  <td>{e.sessions_counted}</td>
                </tr>
              ))}
              {wallet.per_enrollment.length === 0 && <tr><td colSpan="3">No active enrollments</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hm-card">
        <div className="hm-card-head"><h2>Wallet activity</h2></div>
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>When</th><th>Type</th><th>Amount</th><th>Session</th><th>Note</th></tr></thead>
            <tbody>
              {wallet.ledger.map((l) => (
                <tr key={l.entry_id}>
                  <td>{isoToLocal(l.created_at).toFormat('LLL d · h:mm a')}</td>
                  <td>{l.entry_type}</td>
                  <td>{l.amount}</td>
                  <td>{l.session_starts_at ? `${isoToLocal(l.session_starts_at).toFormat('LLL d')} (${l.attendance_status})` : '—'}</td>
                  <td>{l.note || ''}</td>
                </tr>
              ))}
              {wallet.ledger.length === 0 && <tr><td colSpan="5">No activity yet</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hm-card">
        <div className="hm-card-head"><h2>Invoices</h2></div>
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Amount</th><th>Due</th><th>Status</th><th>Description</th></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.invoice_id}>
                  <td>{money(inv.total_amount)}</td>
                  <td>{dateFmt(inv.due_date)}</td>
                  <td><span className={`status-pill status-pill--${INVOICE_TONE[inv.status]}`}>{inv.status}</span></td>
                  <td>{inv.description || ''}</td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan="4">No invoices</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hm-card">
        <div className="hm-card-head"><h2>Payments</h2></div>
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Date</th><th>Amount</th><th>Method</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.payment_id}>
                  <td>{dateFmt(p.payment_date)}</td>
                  <td>{money(p.amount)}</td>
                  <td>{p.method_name || '—'}</td>
                </tr>
              ))}
              {payments.length === 0 && <tr><td colSpan="3">No payments recorded</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="at-subtitle" style={{ marginTop: 10 }}>
          Paying online isn't available yet — the academy records payments as they're received. Contact the academy to pay or top up.
        </p>
      </section>
    </div>
  );
}

export default GuardianBilling;
