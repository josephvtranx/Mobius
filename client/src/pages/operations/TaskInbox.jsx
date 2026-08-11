// Staff Task inbox (design handoff: Mobius Staff.dc.html "Task inbox" —
// "everything that needs a decision, in one queue"). Real now: backed by
// the generic /api/staff-tasks list/resolve endpoints over the staff_tasks
// table, which many flows populate but nothing previously surfaced or
// closed. Each kind maps to an icon/label and, where a clear destination
// exists, an "Open" deep-link to the screen where the decision is actually
// made; "Mark done" / "Dismiss" resolve the task in place (INV-6).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import staffTaskService from '@/services/staffTaskService';
import { isoToLocal } from 'mobius-lms';
import { tintFor } from '@/lib/rosterColors';
import '@/css/home.css';

// Per-kind presentation + deep-link. link(t) may return null when there's
// no single obvious destination (the task is then resolve-only).
const KIND = {
  join_request: {
    icon: 'fa-solid fa-user-plus', label: 'Join request',
    link: () => '/operations/requests',
    text: (t) => `${t.student_name ?? 'A student'} wants to join ${t.subject ?? 'a class'}`,
  },
  leave_request: {
    icon: 'fa-solid fa-user-minus', label: 'Leave request',
    link: () => '/operations/requests',
    text: (t) => `${t.student_name ?? 'A student'} wants to leave ${t.subject ?? 'a class'}`,
  },
  delinquent_balance: {
    icon: 'fa-solid fa-wallet', label: 'Delinquent balance',
    link: (t) => (t.details?.student_id ? `/operations/wallets?student=${t.details.student_id}` : '/operations/wallets'),
    text: (t) => `${t.student_name ?? 'A student'}'s balance went negative${t.details?.balance != null ? ` (${t.details.balance})` : ''}`,
  },
  // Escalations deep-link to /inbox — the accept/reject surface for pending
  // reschedules and bookings (staff see all of them there); Scheduling has
  // no response affordance.
  reschedule_escalation: {
    icon: 'fa-regular fa-calendar-xmark', label: 'Reschedule escalation',
    link: () => '/inbox',
    text: (t) => `A reschedule request for ${t.student_name ?? 'a student'} went unanswered`,
  },
  booking_escalation: {
    icon: 'fa-regular fa-calendar-plus', label: 'Booking escalation',
    link: () => '/inbox',
    text: (t) => `A self-serve booking${t.subject ? ` for ${t.subject}` : ''} went unanswered`,
  },
  instructor_termination_request: {
    icon: 'fa-solid fa-triangle-exclamation', label: 'Termination request',
    link: (t) => (t.details?.class_id ? `/operations/classes/${t.details.class_id}` : null),
    text: (t) => `Termination requested for ${t.subject ?? 'a class'}${t.details?.reason ? ` — ${t.details.reason}` : ''}`,
  },
  auto_complete_verify: {
    icon: 'fa-solid fa-clipboard-check', label: 'Auto-completed — verify',
    link: (t) => (t.details?.class_id ? `/operations/classes/${t.details.class_id}` : '/operations/attendance'),
    text: (t) => `A session was auto-completed${t.subject ? ` in ${t.subject}` : ''} — confirm attendance`,
  },
  note_unlock_request: {
    icon: 'fa-solid fa-lock-open', label: 'Note unlock request',
    link: (t) => (t.details?.class_id ? `/operations/classes/${t.details.class_id}` : null),
    text: (t) => `An instructor asked to unlock a session note${t.details?.reason ? ` — ${t.details.reason}` : ''}`,
  },
  appeal_review: {
    icon: 'fa-solid fa-gavel', label: 'Appeal review',
    link: (t) => (t.details?.class_id ? `/operations/classes/${t.details.class_id}` : null),
    text: (t) => `A late self-cancellation by ${t.student_name ?? 'a student'} needs review`,
  },
  other: {
    icon: 'fa-solid fa-circle-info', label: 'Task', link: () => null,
    text: () => 'A task needs your attention',
  },
};

function TaskInbox() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null);

  const load = () => {
    staffTaskService.getTasks()
      .then((res) => setTasks(res.tasks))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load tasks'));
  };
  useEffect(load, []);

  const resolve = (taskId, action) => async () => {
    setBusy(taskId);
    setError('');
    try {
      await staffTaskService.resolveTask(taskId, action);
      load();
      // let the sidebar badge refresh its open-count without a navigation
      window.dispatchEvent(new Event('staff-tasks-changed'));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve task');
    } finally {
      setBusy(null);
    }
  };

  if (error) return <div className="hm-page"><div className="hm-error">{error}</div></div>;
  if (!tasks) return <div className="hm-page"><div className="hm-loading">Loading…</div></div>;

  return (
    <div className="hm-page" style={{ maxWidth: 960 }}>
      <header className="hm-greeting">
        <h1>Task inbox</h1>
        <p>Everything that needs a decision, in one queue — {tasks.length} open.</p>
      </header>

      {tasks.length === 0 ? (
        <div className="hm-empty" style={{ textAlign: 'center', padding: '64px 20px' }}>
          <i className="fa-solid fa-check-double" style={{ fontSize: 26, color: 'var(--status-success)' }}></i>
          <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 14 }}>Inbox zero</div>
          <div className="hm-kpi-label" style={{ marginTop: 6 }}>Nothing needs a decision right now.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map((t) => {
            const cfg = KIND[t.kind] ?? KIND.other;
            const tint = tintFor(t.kind);
            const href = cfg.link(t);
            return (
              <div key={t.task_id} className="hm-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
                <span className="hm-icon-tint" style={{ width: 42, height: 42, background: tint.bg, color: tint.fg }}>
                  <i className={cfg.icon}></i>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--shell-ink)' }}>{cfg.text(t)}</div>
                  <div className="hm-kpi-label" style={{ marginTop: 2 }}>
                    {cfg.label}
                    {t.urgency === 'urgent' && <span className="hm-badge error" style={{ marginLeft: 8 }}>urgent</span>}
                    {' · '}{isoToLocal(t.created_at).toRelative()}
                  </div>
                </div>
                {href && <Link className="hm-btn" to={href}>Open</Link>}
                <button type="button" className="hm-btn" disabled={busy === t.task_id} onClick={resolve(t.task_id, 'dismissed')}>Dismiss</button>
                <button type="button" className="hm-btn primary" disabled={busy === t.task_id} onClick={resolve(t.task_id, 'done')}>Mark done</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TaskInbox;
