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
  const [counts, setCounts] = useState({ open_count: 0, urgent_count: 0, done_count: 0, dismissed_count: 0, all_count: 0, total_count: 0 });
  const [view, setView] = useState('active');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [urgent, setUrgent] = useState(false);
  const [sort, setSort] = useState('priority');
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
      setCounts({
        open_count: result.open_count ?? 0,
        urgent_count: result.urgent_count ?? 0,
        done_count: result.done_count ?? 0,
        dismissed_count: result.dismissed_count ?? 0,
        all_count: result.all_count ?? result.total_count ?? result.tasks.length,
        total_count: result.total_count ?? result.tasks.length,
      });
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

  const updateTask = async () => {
    if (!pending || busy) return;
    setBusy(true);
    setError('');
    try {
      if (pending.action === 'reopen') {
        await staffTaskService.reopenTask(pending.task.task_id);
        setNotice('Task reopened and returned to Needs attention.');
      } else {
        await staffTaskService.resolveTask(pending.task.task_id, pending.action);
        setNotice(pending.action === 'done' ? 'Task marked resolved.' : 'Task marked as not needed. You can find it in History.');
      }
      setPending(null);
      window.dispatchEvent(new Event('staff-tasks-changed'));
      await load();
    } catch (err) {
      setPending(null);
      setError(err.response?.data?.message || 'Could not update task. Your inbox has been kept intact.');
    } finally {
      setBusy(false);
    }
  };

  const filtered = tasks.filter((task) => {
    const cfg = KIND[task.kind] ?? KIND.other;
    return (kind === 'all' || task.kind === kind) && (!urgent || task.urgency === 'urgent')
      && `${cfg.text(task)} ${cfg.label} ${task.subject ?? ''} ${task.student_name ?? ''} ${task.details?.reason ?? ''}`
        .toLowerCase().includes(query.trim().toLowerCase());
  }).sort((a, b) => {
    const aTime = isoToLocal(a.created_at).toMillis();
    const bTime = isoToLocal(b.created_at).toMillis();
    if (sort === 'newest') return bTime - aTime;
    if (sort === 'oldest') return aTime - bTime;
    const urgencyOrder = Number(b.urgency === 'urgent') - Number(a.urgency === 'urgent');
    return urgencyOrder || aTime - bTime;
  });
  const clearFilters = () => { setQuery(''); setKind('all'); setUrgent(false); setSort('priority'); };
  const hasFilters = query.trim() || kind !== 'all' || urgent || sort !== 'priority';
  const tabCounts = {
    active: counts.open_count,
    done: counts.done_count,
    dismissed: counts.dismissed_count,
    all: counts.all_count,
  };
  const destination = (task, cfg) => {
    if (task.class_id && task.session_id && ['auto_complete_verify', 'note_unlock_request', 'appeal_review'].includes(task.kind)) {
      return `/operations/classes/${task.class_id}/sessions/${task.session_id}/attendance`;
    }
    return cfg.link({ ...task, details: { ...task.details, class_id: task.class_id ?? task.details?.class_id } });
  };
  const statusLabel = (status) => ({ open: 'Open', in_progress: 'In progress', done: 'Resolved', dismissed: 'Not needed' }[status] ?? status);

  return (
    <div className="hm-page ti-page">
      <div className="ti-anchor">
        <header className="ti-heading">
          <div>
            <p className="ti-intro">Review requests, follow up, and keep your academy moving.</p>
            <p className="ti-summary"><strong>{counts.open_count}</strong> need attention <span aria-hidden="true">·</span> <strong>{counts.urgent_count}</strong> urgent</p>
          </div>
          <div className="ti-refresh-group">
            <span role="status">{loading ? 'Refreshing…' : 'Up to date'}</span>
            <button className="ti-refresh" type="button" onClick={load} disabled={loading || busy} aria-label="Refresh task inbox" title="Refresh task inbox"><i className={`fa-solid fa-rotate-right${loading ? ' fa-spin' : ''}`} aria-hidden="true" /></button>
          </div>
        </header>
        <div className="ti-toolbar">
          <div className="ti-tabs" role="group" aria-label="Task status">
            {[['active', 'Needs attention'], ['done', 'Resolved'], ['dismissed', 'Not needed'], ['all', 'History']].map(([value, label]) => (
              <button key={value} aria-pressed={view === value} onClick={() => { setView(value); setNotice(''); }} disabled={busy}>
                {label}<span>{tabCounts[value]}</span>
              </button>
            ))}
          </div>
          <div className="ti-filters">
            <label className="ti-search"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /><input type="search" aria-label="Search tasks" placeholder="Search people, classes, or tasks" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
            <select aria-label="Task type" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="all">All task types</option>
              {Object.entries(KIND).map(([value, cfg]) => <option key={value} value={value}>{cfg.label}</option>)}
            </select>
            <select aria-label="Sort tasks" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="priority">Priority</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <button className="ti-urgent" type="button" aria-pressed={urgent} onClick={() => setUrgent((value) => !value)}><i className="fa-solid fa-bolt" aria-hidden="true" /> Urgent</button>
            {hasFilters && <button className="ti-clear" onClick={clearFilters}>Clear</button>}
          </div>
        </div>
      </div>
      {error && <div className="hm-error" role="alert">{error} <button className="hm-btn" onClick={load} disabled={loading}>Retry</button></div>}
      {notice && <div className="ti-notice" role="status"><span><i className="fa-solid fa-circle-check" aria-hidden="true" /> {notice}</span><button aria-label="Dismiss message" onClick={() => setNotice('')}><i className="fa-solid fa-xmark" aria-hidden="true" /></button></div>}
      {loading ? <div className="hm-loading" role="status">Loading tasks…</div> : (
        <>
          <div className="ti-result-bar"><span>{filtered.length === counts.total_count && !hasFilters ? `${counts.total_count} ${counts.total_count === 1 ? 'task' : 'tasks'}` : `${filtered.length} of ${counts.total_count} tasks`}</span>{tasks.length < counts.total_count && <span>Showing the first 500 — narrow this view to see more.</span>}</div>
          {filtered.length === 0 ? <div className="hm-card ti-empty">
            <i className={`fa-solid ${hasFilters ? 'fa-magnifying-glass' : 'fa-check-double'}`} aria-hidden="true" />
            <h2>{error ? 'Tasks unavailable' : hasFilters ? 'No matching tasks' : view === 'active' ? 'You’re all caught up' : 'No tasks here yet'}</h2>
            <p>{error ? 'Retry to load the inbox.' : hasFilters ? 'Try another search or clear your filters.' : view === 'active' ? 'New requests and follow-ups will appear here when they need your attention.' : 'Resolved tasks stay available here for reference.'}</p>
            {hasFilters && <button className="hm-btn" onClick={clearFilters}>Clear filters</button>}
          </div> : <div className="ti-list" role="list">{filtered.map((task) => {
            const cfg = KIND[task.kind] ?? KIND.other;
            const tint = tintFor(task.kind);
            const href = destination(task, cfg);
            const active = ['open', 'in_progress'].includes(task.status);
            return <article className={`ti-task${task.urgency === 'urgent' ? ' is-urgent' : ''}`} key={task.task_id} role="listitem">
              <span className="hm-icon-tint ti-icon" style={{ background: tint.bg, color: tint.fg }}><i className={cfg.icon} aria-hidden="true" /></span>
              <div className="ti-copy">
                <div className="ti-meta"><span className="ti-kind">{cfg.label}</span>{task.urgency === 'urgent' && <span className="ti-urgency"><i className="fa-solid fa-bolt" aria-hidden="true" /> Urgent</span>}<span className={`ti-status ti-status--${task.status}`}>{statusLabel(task.status)}</span></div>
                <h2>{cfg.text(task)}</h2>
                <div className="ti-timing"><time dateTime={task.created_at} title={isoToLocal(task.created_at).toFormat('DDD t')}>Created {isoToLocal(task.created_at).toRelative()}</time>
                  {task.resolved_at && <span>Closed {isoToLocal(task.resolved_at).toRelative()}{task.resolved_by_name ? ` by ${task.resolved_by_name}` : ''}</span>}</div>
              </div>
              <div className="ti-actions">
                {href && <Link className="hm-btn ti-open" to={href} title={`Review related ${cfg.label.toLowerCase()}`}><span>Review</span><i className="fa-solid fa-arrow-right" aria-hidden="true" /></Link>}
                {active ? <><button className="hm-btn ti-dismiss" disabled={busy} onClick={() => setPending({ task, action: 'dismissed' })}><i className="fa-regular fa-circle-xmark" aria-hidden="true" /> Not needed</button>
                  <button className="hm-btn primary ti-resolve" disabled={busy} onClick={() => setPending({ task, action: 'done' })}><i className="fa-solid fa-check" aria-hidden="true" /> Resolve</button></>
                  : <button className="hm-btn" disabled={busy} onClick={() => setPending({ task, action: 'reopen' })}><i className="fa-solid fa-arrow-rotate-left" aria-hidden="true" /> Reopen</button>}
              </div>
            </article>;
          })}</div>}
          <p className="ti-footnote"><i className="fa-solid fa-circle-info" aria-hidden="true" /> Resolve a task after completing its related work. Use Not needed only for duplicates, stale items, or tasks requiring no action.</p>
        </>
      )}
      <Modal isOpen={!!pending} onClose={() => { if (!busy) setPending(null); }}>
        {pending && <div className="ti-confirm">
          <h2>{pending.action === 'done' ? 'Mark this task resolved?' : pending.action === 'reopen' ? 'Reopen this task?' : 'Mark this task as not needed?'}</h2>
          <p>{(KIND[pending.task.kind] ?? KIND.other).text(pending.task)}</p>
          <p>{pending.action === 'reopen' ? 'This returns the item to Needs attention. It does not reverse work completed on another page.' : pending.action === 'dismissed' ? 'Use this only when no action is required, such as for a duplicate or stale task. The item will remain available in History.' : 'Confirm that you completed the related work first. Resolving this inbox item does not itself approve a request, change attendance, unlock a note, or adjust a balance.'}</p>
          <div className="ti-actions"><button className="hm-btn" disabled={busy} onClick={() => setPending(null)}>Cancel</button><button className={`hm-btn primary${pending.action === 'dismissed' ? ' ti-confirm-dismiss' : ''}`} disabled={busy} onClick={updateTask}>{busy ? 'Saving…' : pending.action === 'reopen' ? 'Reopen task' : pending.action === 'dismissed' ? 'Mark not needed' : 'Mark resolved'}</button></div>
        </div>}
      </Modal>
    </div>
  );
}

export default TaskInbox;
