// Role-aware home: staff / instructor / student dashboards on real v2 data.
// Guardians never see /home — their dashboard is /portal (login routes them
// there; deep links redirect below). Visual language matches the login
// redesign (css/home.css).
import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import { isoToLocal } from 'mobius-lms';
import authService from '@/services/authService';
import reportService from '@/services/reportService';
import classService from '@/services/classService';
import instructorCalendarService from '@/services/instructorCalendarService';
import rescheduleService from '@/services/rescheduleService';
import bookingService from '@/services/bookingService';
import studentViewService from '@/services/studentViewService';
import walletService from '@/services/walletService';
import { walletStatus } from '@/lib/derive';
import '@/css/home.css';

const label = (s) => String(s ?? '').replace(/_/g, ' ');
const day = (iso) => isoToLocal(iso).toFormat('ccc, LLL d');
const time = (iso) => isoToLocal(iso).toFormat('h:mm a');

function Greeting({ user, sub }) {
  const first = String(user?.name ?? '').split(' ')[0] || 'there';
  return (
    <header className="hm-greeting">
      <h1>Welcome back, {first}</h1>
      <p>{sub ?? DateTime.now().toFormat('cccc, LLLL d')}</p>
    </header>
  );
}

function Card({ title, action, children, className = '' }) {
  return (
    <section className={`hm-card ${className}`}>
      {(title || action) && (
        <div className="hm-card-head">
          <h2>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const Empty = ({ children }) => <div className="hm-empty">{children}</div>;
const Loading = () => <div className="hm-loading">Loading your dashboard…</div>;

function SessionList({ sessions, emptyText, renderMeta }) {
  if (!sessions.length) return <Empty>{emptyText}</Empty>;
  const todayIso = DateTime.now().toISODate();
  return (
    <ul className="hm-sessions">
      {sessions.map((s) => {
        const isToday = isoToLocal(s.starts_at).toISODate() === todayIso;
        return (
          <li key={s.session_id} className={isToday ? 'hm-session today' : 'hm-session'}>
            <div className="hm-session-when">
              <span className="hm-session-day">{isToday ? 'Today' : day(s.starts_at)}</span>
              <span className="hm-session-time">{time(s.starts_at)} – {time(s.ends_at)}</span>
            </div>
            <div className="hm-session-what">
              <span className="hm-session-subject">{s.subject}</span>
              {renderMeta && <span className="hm-session-meta">{renderMeta(s)}</span>}
            </div>
            {s.status === 'reschedule_requested' && (
              <span className="hm-badge warn">reschedule requested</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- staff ---------------- */

function StaffHome({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      reportService.getDashboard(),
      classService.getAllClasses(),
      classService.getMembershipRequests('pending')
    ])
      .then(([dash, classes, requests]) => setData({ dash, classes, requests }))
      .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard'));
  }, []);

  if (error) return <div className="hm-error">{error}</div>;
  if (!data) return <Loading />;

  const { dash, classes, requests } = data;
  const activeClasses = classes.filter((c) => c.status === 'active').length;
  const attention = [
    ...dash.delinquency_queue.map((d) => ({
      key: `del-${d.student_id}`, to: '/operations/wallets',
      text: `${d.name} is ${Math.abs(d.balance)} credits negative`,
      age: `${d.days_open}d`
    })),
    ...dash.pending_requests_aging.map((r) => ({
      key: `req-${r.kind}`, to: '/operations/requests',
      text: `${r.open_count} open ${label(r.kind)} ${r.open_count === 1 ? 'task' : 'tasks'}`,
      age: `${Math.round(r.oldest_days)}d`
    })),
    ...dash.auto_completed_pending.tasks.map((t) => ({
      key: `auto-${t.task_id}`, to: '/operations/classes',
      text: 'Auto-completed session to verify',
      age: null
    }))
  ];

  return (
    <div className="hm-page">
      <Greeting user={user} />
      <div className="hm-kpis">
        <div className="hm-kpi"><span className="hm-kpi-value">{activeClasses}</span><span className="hm-kpi-label">Active classes</span></div>
        <div className="hm-kpi"><span className="hm-kpi-value">{requests.length}</span><span className="hm-kpi-label">Pending requests</span></div>
        <div className={`hm-kpi ${dash.delinquency_queue.length ? 'alert' : ''}`}><span className="hm-kpi-value">{dash.delinquency_queue.length}</span><span className="hm-kpi-label">Delinquent wallets</span></div>
        <div className="hm-kpi"><span className="hm-kpi-value">{dash.auto_completed_pending.count}</span><span className="hm-kpi-label">Auto-marks to verify</span></div>
      </div>

      <div className="hm-grid">
        <Card title="Needs attention">
          {attention.length ? (
            <ul className="hm-list">
              {attention.slice(0, 6).map((a) => (
                <li key={a.key}>
                  <Link to={a.to}>{a.text}</Link>
                  {a.age && <span className="hm-age">{a.age}</span>}
                </li>
              ))}
            </ul>
          ) : <Empty>Nothing needs attention.</Empty>}
        </Card>

        <Card
          title="Membership requests"
          action={<Link className="hm-link" to="/operations/requests">View all</Link>}
        >
          {requests.length ? (
            <ul className="hm-list">
              {requests.slice(0, 3).map((r) => (
                <li key={r.request_id}>
                  <span>{r.student_name} → {r.subject} ({label(r.class_type)})</span>
                </li>
              ))}
            </ul>
          ) : <Empty>No pending membership requests.</Empty>}
        </Card>
      </div>

      <div className="hm-actions">
        <Link className="hm-btn primary" to="/operations/classes/new">+ New class</Link>
        <Link className="hm-btn" to="/operations/classes">Classes</Link>
        <Link className="hm-btn" to="/operations/wallets">Wallets</Link>
        <Link className="hm-btn" to="/operations/reports">Reports</Link>
      </div>
    </div>
  );
}

/* ---------------- instructor ---------------- */

function InstructorHome({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      instructorCalendarService.getMySessions(7),
      rescheduleService.getRequests(),
      bookingService.getPending()
    ])
      .then(([sessions, reschedules, bookings]) => setData({ sessions, reschedules, bookings }))
      .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard'));
  }, []);

  if (error) return <div className="hm-error">{error}</div>;
  if (!data) return <Loading />;

  const pending = data.reschedules.length + data.bookings.length;
  const studentsThisWeek = data.sessions.reduce((sum, s) => sum + (s.enrolled ?? 0), 0);

  return (
    <div className="hm-page">
      <Greeting user={user} sub={`${data.sessions.length} session${data.sessions.length === 1 ? '' : 's'} in the next 7 days`} />
      <div className="hm-kpis">
        <div className="hm-kpi"><span className="hm-kpi-value">{data.sessions.length}</span><span className="hm-kpi-label">Sessions this week</span></div>
        <div className="hm-kpi"><span className="hm-kpi-value">{studentsThisWeek}</span><span className="hm-kpi-label">Student seats booked</span></div>
        <div className={`hm-kpi ${pending ? 'alert' : ''}`}><span className="hm-kpi-value">{pending}</span><span className="hm-kpi-label">Pending requests</span></div>
      </div>
      <div className="hm-grid">
        <Card title="Your week">
          <SessionList
            sessions={data.sessions}
            emptyText="No sessions in the next 7 days."
            renderMeta={(s) => `${label(s.class_type)} · ${s.enrolled} enrolled`}
          />
        </Card>

        <Card
          title={`Inbox${pending ? ` (${pending})` : ''}`}
          action={<Link className="hm-link" to="/inbox">Open inbox</Link>}
        >
          {pending ? (
            <ul className="hm-list">
              {data.reschedules.slice(0, 3).map((r) => (
                <li key={r.request_id}>
                  <span>{r.student_name ?? 'A student'} asks to move {r.subject} to {day(r.proposed_starts_at)} {time(r.proposed_starts_at)}</span>
                </li>
              ))}
              {data.bookings.slice(0, 3).map((b) => (
                <li key={b.class_id}>
                  <span>{b.student_name ?? 'A student'} requests {b.subject} on {day(b.starts_at)} {time(b.starts_at)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>No pending requests — you're all caught up.</Empty>}
        </Card>
      </div>
    </div>
  );
}

/* ---------------- student ---------------- */

function StudentHome({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const me = user.user_id;

  useEffect(() => {
    Promise.all([
      studentViewService.getSchedule(me),
      walletService.getWallet(me),
      studentViewService.getRecord(me)
    ])
      .then(([schedule, wallet, record]) => setData({ schedule, wallet, record }))
      .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard'));
  }, [me]);

  if (error) return <div className="hm-error">{error}</div>;
  if (!data) return <Loading />;

  const { wallet } = data;
  const sessions = data.schedule.sessions ?? [];
  const notes = (data.record.entries ?? []).filter((e) => e.note).slice(0, 2);
  const status = walletStatus(wallet);
  const low = status !== 'healthy';

  return (
    <div className="hm-page">
      <Greeting user={user} />
      <div className="hm-grid">
        <Card title="Upcoming sessions">
          <SessionList
            sessions={sessions.slice(0, 6)}
            emptyText="No upcoming sessions."
            renderMeta={(s) => label(s.class_type)}
          />
          <div className="hm-card-foot">
            <Link className="hm-btn primary" to={`/family/students/${me}/book`}>Book a session</Link>
            <Link className="hm-btn" to={`/family/students/${me}/schedule`}>Full schedule</Link>
          </div>
        </Card>

        <div className="hm-stack">
          <Card title="Credits" className={low ? 'low' : ''}>
            <div className="hm-wallet">
              <div><span className="hm-kpi-value">{wallet.balance}</span><span className="hm-kpi-label">Balance</span></div>
              <div><span className="hm-kpi-value">{wallet.committed}</span><span className="hm-kpi-label">Committed</span></div>
              <div><span className="hm-kpi-value">{wallet.available}</span><span className="hm-kpi-label">Available</span></div>
            </div>
            {status === 'negative' && (
              <div className="hm-warn-note">Your balance is negative — top up to keep booking.</div>
            )}
            {status === 'low' && (
              <div className="hm-warn-note">Your available credits are running low — top up to keep booking.</div>
            )}
          </Card>

          <Card
            title="Recent feedback"
            action={<Link className="hm-link" to={`/family/students/${me}/record`}>Full record</Link>}
          >
            {notes.length ? (
              <ul className="hm-list">
                {notes.map((e) => (
                  <li key={e.session_id}>
                    <span><strong>{e.subject}</strong> · {day(e.starts_at)} — {e.note.performance || e.note.free_notes || 'note added'}</span>
                  </li>
                ))}
              </ul>
            ) : <Empty>No feedback yet.</Empty>}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- switch ---------------- */

export default function Home() {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role === 'guardian') return <Navigate to="/portal" replace />;
  if (user.role === 'instructor') return <InstructorHome user={user} />;
  if (user.role === 'student') return <StudentHome user={user} />;
  return <StaffHome user={user} />;
}
