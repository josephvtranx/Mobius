// Payments (design handoff: Mobius Staff.dc.html Financial dashboard).
// payments/invoices/payment_methods already existed in the v2 schema with
// zero endpoints against them — real now. This is a manual "record money
// already received" ledger: no card collection, no payment links, no
// processor. Recording a payment does NOT touch a student's wallet/credit
// balance — there is no real dollars-per-credit rate anywhere in the schema
// yet (ASSUMPTION[TOPUP] hasn't landed), so granting credits stays a
// separate, already-real action on the Wallets page rather than an invented
// conversion here.
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import paymentService from '@/services/paymentService';
import invoiceService from '@/services/invoiceService';
import studentService from '@/services/studentService';
import '@/css/home.css';
import '@/css/table.css';

const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
// issued_at/due_date/payment_date are plain DATE columns, not instants.
const dateFmt = (d) => (d ? DateTime.fromISO(d).toFormat('LLL d, yyyy') : '—');
const STATUS_TONE = { paid: 'success', pending: 'info', overdue: 'error', canceled: 'warning' };
const fieldStyle = { width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)', marginTop: 4 };

function Payments() {
  const [students, setStudents] = useState([]);
  const [methods, setMethods] = useState([]);
  const [payments, setPayments] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [payForm, setPayForm] = useState({ student_id: '', amount: '', payment_date: today(), method_id: '', description: '' });
  const [invForm, setInvForm] = useState({ student_id: '', total_amount: '', due_date: '', description: '' });
  const [payingInvoice, setPayingInvoice] = useState(null); // { invoice_id, amount, payment_date, method_id }

  const loadAll = () => {
    Promise.all([paymentService.getPayments(), invoiceService.getInvoices()])
      .then(([p, i]) => { setPayments(p); setInvoices(i); })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load payments'));
  };

  useEffect(() => {
    studentService.getAllStudents().then(setStudents).catch(() => {});
    paymentService.getMethods().then(setMethods).catch(() => {});
    loadAll();
  }, []);

  const submitPayment = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await paymentService.recordPayment({
        student_id: Number(payForm.student_id),
        amount: Number(payForm.amount),
        payment_date: payForm.payment_date,
        method_id: payForm.method_id ? Number(payForm.method_id) : null,
        description: payForm.description || null,
      });
      setPayForm({ student_id: '', amount: '', payment_date: today(), method_id: '', description: '' });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally { setBusy(false); }
  };

  const submitInvoice = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await invoiceService.createInvoice({
        student_id: Number(invForm.student_id),
        total_amount: Number(invForm.total_amount),
        due_date: invForm.due_date || null,
        description: invForm.description || null,
      });
      setInvForm({ student_id: '', total_amount: '', due_date: '', description: '' });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally { setBusy(false); }
  };

  const startPayInvoice = (inv) => setPayingInvoice({
    invoice_id: inv.invoice_id,
    amount: (Number(inv.total_amount) - Number(inv.amount_paid)).toFixed(2),
    payment_date: today(),
    method_id: '',
  });

  const submitInvoicePayment = async () => {
    setError(''); setBusy(true);
    try {
      await invoiceService.payInvoice(payingInvoice.invoice_id, {
        amount: Number(payingInvoice.amount),
        payment_date: payingInvoice.payment_date,
        method_id: payingInvoice.method_id ? Number(payingInvoice.method_id) : null,
      });
      setPayingInvoice(null);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record invoice payment');
    } finally { setBusy(false); }
  };

  const cancelInvoice = async (invoiceId) => {
    setError(''); setBusy(true);
    try {
      await invoiceService.cancelInvoice(invoiceId);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel invoice');
    } finally { setBusy(false); }
  };

  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>Payments</h1>
        <p>Record money already received and track invoices. There's no online checkout here — no card collection, no payment links.</p>
      </header>

      {error && <div className="hm-error">{error}</div>}

      <div className="hm-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <form onSubmit={submitPayment} className="hm-card" style={{ display: 'grid', gap: 10 }}>
          <div className="hm-card-head"><h2>Record a payment</h2></div>
          <label className="hm-kpi-label">Student
            <select style={fieldStyle} value={payForm.student_id} required
              onChange={(e) => setPayForm((f) => ({ ...f, student_id: e.target.value }))}>
              <option value="">— pick —</option>
              {students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
            </select>
          </label>
          <label className="hm-kpi-label">Amount
            <input style={fieldStyle} type="number" min="0" step="0.01" required
              value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} />
          </label>
          <label className="hm-kpi-label">Date received
            <input style={fieldStyle} type="date" required
              value={payForm.payment_date} onChange={(e) => setPayForm((f) => ({ ...f, payment_date: e.target.value }))} />
          </label>
          <label className="hm-kpi-label">Method
            <select style={fieldStyle} value={payForm.method_id}
              onChange={(e) => setPayForm((f) => ({ ...f, method_id: e.target.value }))}>
              <option value="">— unspecified —</option>
              {methods.map((m) => <option key={m.method_id} value={m.method_id}>{m.method_name}</option>)}
            </select>
          </label>
          <label className="hm-kpi-label">Note
            <input style={fieldStyle} type="text" value={payForm.description}
              onChange={(e) => setPayForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <button type="submit" className="hm-btn primary" disabled={busy}>Record payment</button>
        </form>

        <form onSubmit={submitInvoice} className="hm-card" style={{ display: 'grid', gap: 10 }}>
          <div className="hm-card-head"><h2>Create an invoice</h2></div>
          <label className="hm-kpi-label">Student
            <select style={fieldStyle} value={invForm.student_id} required
              onChange={(e) => setInvForm((f) => ({ ...f, student_id: e.target.value }))}>
              <option value="">— pick —</option>
              {students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
            </select>
          </label>
          <label className="hm-kpi-label">Total amount
            <input style={fieldStyle} type="number" min="0" step="0.01" required
              value={invForm.total_amount} onChange={(e) => setInvForm((f) => ({ ...f, total_amount: e.target.value }))} />
          </label>
          <label className="hm-kpi-label">Due date
            <input style={fieldStyle} type="date"
              value={invForm.due_date} onChange={(e) => setInvForm((f) => ({ ...f, due_date: e.target.value }))} />
          </label>
          <label className="hm-kpi-label">Description
            <input style={fieldStyle} type="text" value={invForm.description}
              onChange={(e) => setInvForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <button type="submit" className="hm-btn primary" disabled={busy}>Create invoice</button>
        </form>
      </div>

      <div className="hm-card" style={{ marginTop: 16 }}>
        <div className="hm-card-head"><h2>Invoices</h2></div>
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Student</th><th>Amount</th><th>Paid</th><th>Due</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {(invoices ?? []).map((inv) => (
                <tr key={inv.invoice_id}>
                  <td>{inv.student_name}</td>
                  <td>{money(inv.total_amount)}</td>
                  <td>{money(inv.amount_paid)}</td>
                  <td>{dateFmt(inv.due_date)}</td>
                  <td><span className={`status-pill status-pill--${STATUS_TONE[inv.status]}`}>{inv.status}</span></td>
                  <td>
                    {inv.status === 'pending' && payingInvoice?.invoice_id !== inv.invoice_id && (
                      <>
                        <button type="button" className="hm-btn" onClick={() => startPayInvoice(inv)}>Record payment</button>{' '}
                        <button type="button" className="hm-btn" onClick={() => cancelInvoice(inv.invoice_id)}>Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {invoices?.length === 0 && <tr><td colSpan="6">No invoices yet.</td></tr>}
            </tbody>
          </table>
        </div>

        {payingInvoice && (
          <div className="hm-card" style={{ marginTop: 12, display: 'grid', gap: 10, maxWidth: 320 }}>
            <div className="hm-card-head"><h2>Record payment — invoice #{payingInvoice.invoice_id}</h2></div>
            <label className="hm-kpi-label">Amount
              <input style={fieldStyle} type="number" min="0" step="0.01" value={payingInvoice.amount}
                onChange={(e) => setPayingInvoice((p) => ({ ...p, amount: e.target.value }))} />
            </label>
            <label className="hm-kpi-label">Date received
              <input style={fieldStyle} type="date" value={payingInvoice.payment_date}
                onChange={(e) => setPayingInvoice((p) => ({ ...p, payment_date: e.target.value }))} />
            </label>
            <label className="hm-kpi-label">Method
              <select style={fieldStyle} value={payingInvoice.method_id}
                onChange={(e) => setPayingInvoice((p) => ({ ...p, method_id: e.target.value }))}>
                <option value="">— unspecified —</option>
                {methods.map((m) => <option key={m.method_id} value={m.method_id}>{m.method_name}</option>)}
              </select>
            </label>
            <div>
              <button type="button" className="hm-btn primary" disabled={busy} onClick={submitInvoicePayment}>Confirm</button>{' '}
              <button type="button" className="hm-btn" onClick={() => setPayingInvoice(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="hm-card" style={{ marginTop: 16 }}>
        <div className="hm-card-head"><h2>Recent payments</h2></div>
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Student</th><th>Amount</th><th>Date</th><th>Method</th><th>Note</th></tr></thead>
            <tbody>
              {(payments ?? []).map((p) => (
                <tr key={p.payment_id}>
                  <td>{p.student_name}</td>
                  <td>{money(p.amount)}</td>
                  <td>{dateFmt(p.payment_date)}</td>
                  <td>{p.method_name || '—'}</td>
                  <td>{p.description || ''}</td>
                </tr>
              ))}
              {payments?.length === 0 && <tr><td colSpan="5">No payments recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payments;
