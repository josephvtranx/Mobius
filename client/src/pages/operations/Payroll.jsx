// Staff Payroll (design handoff README > Staff app > "Financial dashboard
// & Payroll"): real now — payroll/time_logs already existed in the schema
// with no API against them. Pick a period, preview what it would pay out,
// then run it for real. Hourly staff are excluded (no clock-in/out feature
// yet, so no real ongoing hours source) — shown plainly, not hidden.
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import payrollService from '@/services/payrollService';
import { isoToLocal } from 'mobius-lms';
import '@/css/home.css';
import '@/css/table.css';
import '@/css/finance-pages.css';

const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => DateTime.now().toISODate();
// pay_period_start/end (and the raw date-input start/end state) are plain
// DATE values, not instants — format them directly rather than through
// isoToLocal (which assumes a UTC instant and would shift the calendar date
// depending on the viewer's timezone).
const dateFmt = (d, fmt = 'LLL d, yyyy') => DateTime.fromISO(d).toFormat(fmt);

function Payroll() {
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(today());
  const [preview, setPreview] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadHistory = () => {
    payrollService.getHistory().then(setHistory).catch((err) => setError(err.response?.data?.message || 'Failed to load history'));
  };
  useEffect(loadHistory, []);

  const doPreview = async () => {
    setError('');
    setRunResult(null);
    setBusy(true);
    try {
      setPreview(await payrollService.preview(start, end));
    } catch (err) {
      setError(err.response?.data?.message || 'Preview failed');
    } finally {
      setBusy(false);
    }
  };

  const doRun = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await payrollService.run(start, end);
      setRunResult(res);
      setPreview(null);
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Run failed');
    } finally {
      setBusy(false);
    }
  };

  const eligible = preview?.filter((r) => !r.excluded) ?? [];
  const excluded = preview?.filter((r) => r.excluded) ?? [];

  return (
    <div className="hm-page payroll-page">
      {error && <div className="hm-error">{error}</div>}

      <section className="payroll-run">
        <div className="payroll-run-copy">
          <h2>Run payroll</h2>
          <p>Choose a pay period, preview every eligible person, then review the totals before running payroll.</p>
        </div>
        <div className="payroll-controls">
          <label className="payroll-field">Period start
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="payroll-field">Period end
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
          <button type="button" className="hm-btn primary" disabled={busy} onClick={doPreview}>
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />Preview
          </button>
        </div>
      </section>

      {preview && (
        <section className="fin-section payroll-preview">
          <header className="fin-section-head">
            <div>
              <h2>Payroll preview</h2>
              <p>{dateFmt(start, 'LLL d')} to {dateFmt(end)} · {eligible.length} eligible</p>
            </div>
            <button type="button" className="hm-btn primary" disabled={busy || eligible.length === 0} onClick={doRun}>
              {busy ? 'Running…' : `Run payroll (${eligible.length})`}
            </button>
          </header>
          <div className="hm-table-wrap payroll-table-wrap">
            <table className="hm-table">
              <thead><tr><th>Name</th><th>Basis</th><th>Hours</th><th>Rate</th><th>Total pay</th></tr></thead>
              <tbody>
                {eligible.map((r) => (
                  <tr key={r.user_id}>
                    <td>{r.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{r.user_type} · {r.pay_basis}</td>
                    <td>{r.hours != null ? r.hours.toFixed(1) : '—'}</td>
                    <td>{r.rate != null ? money(r.rate) : '—'}</td>
                    <td>{money(r.total_pay)}</td>
                  </tr>
                ))}
                {eligible.length === 0 && <tr><td colSpan="5">No one is eligible for this period.</td></tr>}
              </tbody>
            </table>
          </div>
          {excluded.length > 0 && (
            <p className="payroll-excluded">
              Not included: {excluded.map((r) => r.name).join(', ')} — {excluded[0].reason}
            </p>
          )}
        </section>
      )}

      {runResult && (
        <div className="fin-success payroll-result">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          <div>
            <p>Paid {runResult.paid.length} {runResult.paid.length === 1 ? 'person' : 'people'} for this period.</p>
            {runResult.skipped.length > 0 && (
              <p style={{ color: 'var(--shell-muted)' }}>
                Skipped: {runResult.skipped.map((s) => `${s.name} (${s.reason})`).join('; ')}
              </p>
            )}
          </div>
        </div>
      )}

      <section className="fin-section payroll-history">
        <header className="fin-section-head">
          <div>
            <h2>Payroll history</h2>
            <p>{history?.length ?? 0} payroll records</p>
          </div>
        </header>
        <div className="hm-table-wrap payroll-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Name</th><th>Type</th><th>Period</th><th>Total pay</th><th>Paid on</th></tr></thead>
            <tbody>
              {(history ?? []).map((h) => (
                <tr key={h.payroll_id}>
                  <td>{h.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{h.user_type}</td>
                  <td>{dateFmt(h.pay_period_start, 'LLL d')} – {dateFmt(h.pay_period_end)}</td>
                  <td>{money(h.total_pay)}</td>
                  <td>{isoToLocal(h.generated_at).toFormat('LLL d, yyyy')}</td>
                </tr>
              ))}
              {history?.length === 0 && <tr><td colSpan="5">No payroll runs yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Payroll;
