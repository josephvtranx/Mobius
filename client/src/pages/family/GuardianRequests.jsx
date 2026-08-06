// Guardian Requests (Mobius Guardian.dc.html Requests view). "Pending
// reschedule requests" reads the real GET /reschedule-requests/mine
// (reschedule_requests already tracked requested_by/held_for_student_id,
// it just had no student/guardian-reachable read before). "Report an
// absence" now really sends a reason + note — session_attendance grew
// cancel_reason/cancel_note columns and POST /sessions/:id/cancel accepts
// them (both previously nonexistent; the reason chips used to be UI-only).
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import sessionServiceV2 from '@/services/sessionServiceV2';
import studentViewService from '@/services/studentViewService';
import guardianPortalService from '@/services/guardianPortalService';
import rescheduleService from '@/services/rescheduleService';
import Modal from '@/components/Modal';
import { isoToLocal } from 'mobius-lms';
import '@/css/home.css';

const fmt = (iso) => isoToLocal(iso).toFormat('ccc, LLL d · h:mm a');
const STATUS_TONE = { pending: 'warn', escalated: 'warn', accepted: 'success', rejected: 'error', expired: 'error' };
const STATUS_LABEL = { pending: 'awaiting confirmation', escalated: 'escalated to staff', accepted: 'confirmed', rejected: 'declined', expired: 'expired' };
const REASONS = [
  { value: 'illness', label: 'Illness' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'schedule_conflict', label: 'Schedule conflict' },
  { value: 'family_emergency', label: 'Family emergency' },
  { value: 'other', label: 'Other' },
];

function GuardianRequests() {
  const { studentId } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [myRequests, setMyRequests] = useState(null);
  const [childName, setChildName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [absenceFor, setAbsenceFor] = useState(null); // session being reported
  const [reason, setReason] = useState('other');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      studentViewService.getSchedule(studentId),
      guardianPortalService.getPortal(),
      rescheduleService.getMine(),
    ]).then(([sched, portal, requests]) => {
      setSchedule(sched);
      setChildName(portal.children.find((c) => String(c.student_id) === String(studentId))?.name ?? '');
      setMyRequests(requests.filter((r) => String(r.held_for_student_id) === String(studentId)));
    }).catch((err) => setError(err.response?.data?.message || 'Failed to load requests'));
  }, [studentId]);
  useEffect(load, [load]);

  const openAbsence = (session) => {
    setAbsenceFor(session);
    setReason('other');
    setNote('');
    setError('');
  };

  const submitAbsence = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await sessionServiceV2.cancelSession(absenceFor.session_id, Number(studentId), { reason, note: note.trim() || undefined });
      setNotice(
        `${absenceFor.subject} on ${fmt(absenceFor.starts_at)} reported — ${res.money_effect === 'credit_forfeited'
          ? 'past the change deadline, so the credit was used (staff can review).'
          : 'no credit was charged.'}`
      );
      setAbsenceFor(null);
      load();
    } catch (err) {
      setError(`${err.response?.data?.code ?? ''} ${err.response?.data?.message ?? 'Report failed'}`.trim());
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !schedule) return <div className="hm-error">{error}</div>;
  if (!schedule) return <div className="hm-loading">Loading…</div>;

  const upcoming = schedule.sessions.filter((s) => s.status === 'scheduled');

  return (
    <div className="hm-page">
      <p><Link to="/portal" className="hm-link">← Back to My children</Link></p>
      <header className="hm-greeting">
        <h1>Requests{childName ? ` — ${childName}` : ''}</h1>
      </header>

      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)' }}>{notice}</div>}

      <section className="hm-card">
        <div className="hm-card-head"><h2>Reschedule requests</h2></div>
        {myRequests === null ? (
          <div className="hm-loading">Loading…</div>
        ) : myRequests.length ? (
          <ul className="hm-list">
            {myRequests.map((r) => (
              <li key={r.request_id}>
                <span>{r.subject} — {fmt(r.original_starts_at)} → {fmt(r.proposed_starts_at)}</span>
                <span className={`hm-badge ${STATUS_TONE[r.status] ?? 'info'}`}>{STATUS_LABEL[r.status] ?? r.status}</span>
              </li>
            ))}
          </ul>
        ) : <div className="hm-empty">No reschedule requests yet.</div>}
      </section>

      <section className="hm-card">
        <div className="hm-card-head"><h2>Report an absence</h2></div>
        <p className="hm-kpi-label" style={{ marginBottom: 10 }}>
          Pick an upcoming session below. Inside the change window the credit is forfeited (staff can review); otherwise no credit is used.
        </p>
        {upcoming.length ? (
          <ul className="hm-list">
            {upcoming.map((s) => (
              <li key={s.session_id}>
                <span>{s.subject} — {fmt(s.starts_at)}</span>
                <button type="button" className="hm-btn" onClick={() => openAbsence(s)}>
                  Report absence
                </button>
              </li>
            ))}
          </ul>
        ) : <div className="hm-empty">No upcoming sessions.</div>}
      </section>

      <Modal isOpen={!!absenceFor} onClose={() => setAbsenceFor(null)}>
        {absenceFor && (
          <div className="sc-modal">
            <h2>Report an absence</h2>
            <p className="at-subtitle">{absenceFor.subject} — {fmt(absenceFor.starts_at)}</p>
            {error && <div className="hm-error">{error}</div>}

            <p className="hm-kpi-label" style={{ marginTop: 14, marginBottom: 8 }}>Reason</p>
            <div className="hm-actions" style={{ marginBottom: 12 }}>
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={`status-pill status-pill--info`}
                  style={{ cursor: 'pointer', border: 'none', opacity: reason === r.value ? 1 : 0.5 }}
                  onClick={() => setReason(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <p className="hm-kpi-label" style={{ marginBottom: 6 }}>Note for the tutor (optional)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)', fontFamily: 'inherit' }}
            />

            <div className="hm-actions" style={{ marginTop: 14 }}>
              <button type="button" className="hm-btn" onClick={() => setAbsenceFor(null)}>Cancel</button>
              <button type="button" className="hm-btn primary" disabled={submitting} onClick={submitAbsence}>
                {submitting ? 'Reporting…' : 'Report absence'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default GuardianRequests;
