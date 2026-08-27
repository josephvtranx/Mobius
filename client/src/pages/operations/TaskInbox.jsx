// Staff Task inbox (design handoff: Mobius Staff.dc.html "Task inbox" —
// "everything that needs a decision, in one queue"). Real now: backed by
// the generic /api/staff-tasks list/resolve endpoints over the staff_tasks
// table, which many flows populate but nothing previously surfaced or
// closed. Each kind maps to an icon/label and, where a clear destination
// exists, an "Open" deep-link to the screen where the decision is actually
// made; "Mark done" / "Dismiss" resolve the task in place (INV-6).
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import staffTaskService from '@/services/staffTaskService';
import { isoToLocal } from 'mobius-lms';
import { tintFor } from '@/lib/rosterColors';
import '@/css/home.css';
import '@/css/task-inbox.css';
import Modal from '@/components/Modal';

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
  reschedule_escalation: {
    icon: 'fa-regular fa-calendar-xmark', label: 'Reschedule escalation',
    link: () => '/operations/scheduling',
    text: (t) => `A reschedule request for ${t.student_name ?? 'a student'} went unanswered`,
  },
  booking_escalation: {
    icon: 'fa-regular fa-calendar-plus', label: 'Booking escalation',
    link: () => '/operations/scheduling',
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
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ open_count: 0, total_count: 0 });
  const [view, setView] = useState('active');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const generation = useRef(0);

  const load = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError('');
    try {
      const result = await staffTaskService.getTasks(view === 'active' ? undefined : view);
      if (current !== generation.current) return;
      setTasks(result.tasks);
      setCounts({ open_count: result.open_count ?? 0, total_count: result.total_count ?? result.tasks.length });
    } catch (err) {
      if (current === generation.current) setError(err.response?.data?.message || 'Could not load tasks. Please retry.');
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [view]);
  useEffect(() => {
    load();
    return () => { generation.current++; };
  }, [load]);

  const resolve = async () => {
    if (!pending || busy) return;
    setBusy(true);
    setError('');
    try {
      await staffTaskService.resolveTask(pending.task.task_id, pending.action);
      setNotice(pending.action === 'done' ? 'Task marked done.' : 'Task dismissed. You can find it in History.');
      setPending(null);
      window.dispatchEvent(new Event('staff-tasks-changed'));
      await load();
    } catch (err) {
      setPending(null);
      setError(err.response?.data?.message || 'Could not resolve task. Your inbox has been kept intact.');
    } finally {
      setBusy(false);
    }
  };

  const filtered = tasks.filter((task) => {
    const cfg = KIND[task.kind] ?? KIND.other;
    return (kind === 'all' || task.kind === kind) && (!urgent || task.urgency === 'urgent')
      && `${cfg.text(task)} ${cfg.label} ${task.subject ?? ''} ${task.student_name ?? ''} ${task.details?.reason ?? ''}`
        .toLowerCase().includes(query.trim().toLowerCase());
  });
  const clearFilters = () => { setQuery(''); setKind('all'); setUrgent(false); };
  const hasFilters = query.trim() || kind !== 'all' || urgent;
  const destination = (task, cfg) => {
    if (task.class_id && task.session_id && ['auto_complete_verify', 'note_unlock_request', 'appeal_review'].includes(task.kind)) {
      return `/operations/classes/${task.class_id}/sessions/${task.session_id}/attendance`;
    }
    return cfg.link({ ...task, details: { ...task.details, class_id: task.class_id ?? task.details?.class_id } });
  };

  return (
    <div className="hm-page ti-page">
      <header className="ti-heading">
        <p className="ti-intro">Review requests, follow up, and keep your academy moving.</p>
        <button className="hm-btn" onClick={load} disabled={loading || busy}><i className="fa-solid fa-rotate-right" aria-hidden="true" /> Refresh</button>
      </header>
      <div className="ti-toolbar">
        <div className="ti-tabs" role="group" aria-label="Task status">
          {[['active', 'Needs attention'], ['done', 'Done'], ['dismissed', 'Dismissed'], ['all', 'History']].map(([value, label]) => (
            <button key={value} aria-pressed={view === value} onClick={() => { setView(value); setNotice(''); }} disabled={busy}>
              {label}{value === 'active' && <span>{counts.open_count}</span>}
            </button>
          ))}
        </div>
        <div className="ti-filters">
          <input type="search" aria-label="Search tasks" placeholder="Search students, subjects, or tasks…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select aria-label="Task type" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">All task types</option>
            {Object.entries(KIND).map(([value, cfg]) => <option key={value} value={value}>{cfg.label}</option>)}
          </select>
          <label><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> Urgent only</label>
          {hasFilters && <button className="hm-btn" onClick={clearFilters}>Clear filters</button>}
        </div>
      </div>
      {error && <div className="hm-error" role="alert">{error} <button className="hm-btn" onClick={load} disabled={loading}>Retry</button></div>}
      {notice && <div className="ti-notice" role="status">{notice}</div>}
      {loading ? <div className="hm-loading" role="status">Loading tasks…</div> : (
        <>
          <div className="ti-caption">{filtered.length} shown · {counts.total_count} in this view{tasks.length < counts.total_count && ' · Showing the first 500; narrow the status view to see more.'}</div>
          {filtered.length === 0 ? <div className="hm-card ti-empty">
            <i className={`fa-solid ${hasFilters ? 'fa-magnifying-glass' : 'fa-check-double'}`} aria-hidden="true" />
            <h2>{error ? 'Tasks unavailable' : hasFilters ? 'No matching tasks' : view === 'active' ? 'You’re all caught up' : 'No tasks here yet'}</h2>
            <p>{error ? 'Retry to load the inbox.' : hasFilters ? 'Try another search or clear your filters.' : view === 'active' ? 'New requests and follow-ups will appear here when they need your attention.' : 'Resolved tasks stay available here for reference.'}</p>
            {hasFilters && <button className="hm-btn" onClick={clearFilters}>Clear filters</button>}
          </div> : <div className="ti-list">{filtered.map((task) => {
            const cfg = KIND[task.kind] ?? KIND.other;
            const tint = tintFor(task.kind);
            const href = destination(task, cfg);
            const active = ['open', 'in_progress'].includes(task.status);
            return <article className="hm-card ti-task" key={task.task_id}>
              <span className="hm-icon-tint ti-icon" style={{ background: tint.bg, color: tint.fg }}><i className={cfg.icon} aria-hidden="true" /></span>
              <div className="ti-copy">
                <div className="ti-meta"><span>{cfg.label}</span>{task.urgency === 'urgent' && <span className="hm-badge error">Urgent</span>}<span>{task.status.replace('_', ' ')}</span></div>
                <h2>{cfg.text(task)}</h2>
                <time dateTime={task.created_at} title={isoToLocal(task.created_at).toFormat('DDD t')}>{isoToLocal(task.created_at).toRelative()}</time>
                {task.resolved_at && <span> · Closed {isoToLocal(task.resolved_at).toRelative()}</span>}
              </div>
              <div className="ti-actions">
                {href && <Link className="hm-btn" to={href}>Review <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></Link>}
                {active && <><button className="hm-btn" disabled={busy} onClick={() => setPending({ task, action: 'dismissed' })}>Dismiss</button>
                  <button className="hm-btn primary" disabled={busy} onClick={() => setPending({ task, action: 'done' })}>Mark done</button></>}
              </div>
            </article>;
          })}</div>}
          <p className="ti-caption">Closing a task updates the inbox only. Review the related request before closing it; approvals, attendance, and balances are managed on their own pages.</p>
        </>
      )}
      <Modal isOpen={!!pending} onClose={() => { if (!busy) setPending(null); }}>
        {pending && <div className="ti-confirm">
          <h2>{pending.action === 'done' ? 'Mark this task done?' : 'Dismiss this task?'}</h2>
          <p>{(KIND[pending.task.kind] ?? KIND.other).text(pending.task)}</p>
          <p>This closes the inbox item only. It will not approve a request, change attendance, unlock a note, or adjust a balance.</p>
          <div className="ti-actions"><button className="hm-btn" disabled={busy} onClick={() => setPending(null)}>Cancel</button><button className="hm-btn primary" disabled={busy} onClick={resolve}>{busy ? 'Saving…' : 'Confirm'}</button></div>
        </div>}
      </Modal>
    </div>
  );
}

export default TaskInbox;
