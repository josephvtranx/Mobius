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
import studentService from '@/services/studentService';
import instructorCalendarService from '@/services/instructorCalendarService';
import instructorService from '@/services/instructorService';
import roomService from '@/services/roomService';
import rescheduleService from '@/services/rescheduleService';
import bookingService from '@/services/bookingService';
import studentViewService from '@/services/studentViewService';
import walletService from '@/services/walletService';
import paymentService from '@/services/paymentService';
import { walletStatus, attendanceRate, findRoomClashes } from '@/lib/derive';
import { tintFor } from '@/lib/rosterColors';
import '@/css/home.css';

// Presentational-only: pick a subject icon from the real subject name.
// No data implication — just which glyph a subject card shows.
function subjectIcon(subject) {
  const s = String(subject ?? '').toLowerCase();
  if (/(math|algebra|calc|geometry)/.test(s)) return 'fa-solid fa-square-root-variable';
  if (/physic/.test(s)) return 'fa-solid fa-atom';
  if (/chem/.test(s)) return 'fa-solid fa-flask';
  if (/(bio|science)/.test(s)) return 'fa-solid fa-dna';
  if (/(english|essay|writ|lit)/.test(s)) return 'fa-solid fa-pen-nib';
  if (/(sat|test|exam|prep)/.test(s)) return 'fa-solid fa-graduation-cap';
  return 'fa-solid fa-book-open';
}

const label = (s) => String(s ?? '').replace(/_/g, ' ');
// Compact "$24.6k"-style KPI display — the full "$24,600.00" form used on
// the Financial dashboard/Payments pages is too wide for a small KPI tile.
const moneyCompact = (n) => {
  const v = Number(n);
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
};
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
  const [busyRequest, setBusyRequest] = useState(null);

  const load = () => {
    const monthStart = DateTime.now().startOf('month').toISODate();
    const monthEnd = DateTime.now().endOf('month').toISODate();
    Promise.all([
      reportService.getDashboard(),
      classService.getAllClasses(),
      classService.getMembershipRequests('pending'),
      studentService.getAllStudents(),
      roomService.getAllRooms(),
      paymentService.getPayments({ start: monthStart, end: monthEnd }),
    ])
      .then(async ([dash, classes, requests, students, rooms, monthPayments]) => {
        const active = classes.filter((c) => c.status === 'active');
        // Per-class sessions aren't on the list endpoint — same N+1 pattern
        // Attendance.jsx already uses to get real session instances.
        const details = await Promise.all(active.map((c) => classService.getClass(c.class_id)));
        const allSessions = details.flatMap((d, i) =>
          (d.sessions || []).map((s) => ({ ...s, class_id: active[i].class_id, subject: active[i].subject, instructor: active[i].instructor, enrolled: active[i].enrolled, student_limit: active[i].student_limit }))
        );
        setData({ dash, classes: active, requests, students, allSessions, rooms, monthPayments });
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard'));
  };
  useEffect(load, []);

  const respond = async (requestId, action) => {
    setBusyRequest(requestId);
    try {
      await classService.resolveMembershipRequest(requestId, { action });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resolve the request');
    } finally {
      setBusyRequest(null);
    }
  };

  if (error) return <div className="hm-error">{error}</div>;
  if (!data) return <Loading />;

  const { dash, classes, requests, students, allSessions, rooms, monthPayments } = data;
  const revenueMtd = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const roomName = new Map(rooms.map((r) => [r.room_id, r.name]));
  const now = DateTime.now();
  const todayIso = now.toISODate();
  const todaySessions = allSessions
    .filter((s) => isoToLocal(s.starts_at).toISODate() === todayIso)
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  const roomsToday = new Set(todaySessions.map((s) => s.room_id).filter((r) => r != null));
  const sessionsThisWeek = allSessions.filter((s) => {
    const d = isoToLocal(s.starts_at);
    return d >= now.startOf('day') && d < now.plus({ days: 7 });
  }).length;
  const seatCapacity = classes.reduce((sum, c) => sum + (c.student_limit || 0), 0);
  const seatEnrolled = classes.reduce((sum, c) => sum + (c.enrolled || 0), 0);
  const seatFillRate = seatCapacity ? Math.round((seatEnrolled / seatCapacity) * 100) : null;
  const clashes = findRoomClashes(allSessions);
  const clashDay = clashes[0] ? isoToLocal(clashes[0][0].starts_at).toFormat('cccc') : null;

  const heroParts = [
    `${todaySessions.length} session${todaySessions.length === 1 ? '' : 's'} run today${roomsToday.size ? ` across ${roomsToday.size} room${roomsToday.size === 1 ? '' : 's'}` : ''}.`,
  ];
  if (requests.length) heroParts.push(`${requests.length} student${requests.length === 1 ? '' : 's'} ${requests.length === 1 ? 'is' : 'are'} waiting on class requests.`);
  if (clashDay) heroParts.push(`${clashDay} has a room clash to resolve.`);
  if (requests.length === 0 && !clashDay) heroParts.push('No room clashes this week.');

  return (
    <div className="hm-page">
      <div className="hm-hero-card">
        <div className="hm-hero">
          <div className="hm-hero-copy">
            <span className="hm-eyebrow">{now.toFormat('cccc, LLLL d')}</span>
            <h1>Good {now.hour < 12 ? 'morning' : now.hour < 18 ? 'afternoon' : 'evening'}, {String(user?.name ?? '').split(' ')[0] || 'there'}</h1>
            <p>{heroParts.join(' ')}</p>
          </div>
          <div className="hm-needs">
            <div>
              <span className="hm-eyebrow">Needs attention</span>
              <h2>{requests.length} open request{requests.length === 1 ? '' : 's'}{clashes.length ? ` · ${clashes.length} room clash${clashes.length === 1 ? '' : 'es'}` : ''}</h2>
              <div className="hm-needs-meta">
                <span><i className="fa-regular fa-clock"></i>{todaySessions.length} sessions today</span>
                <span><i className="fa-solid fa-users"></i>{new Set(todaySessions.map((s) => s.instructor)).size} tutors on site</span>
              </div>
            </div>
            <div className="hm-needs-actions">
              <Link className="hm-needs-btn solid" to="/operations/requests"><i className="fa-solid fa-user-check"></i>Review requests</Link>
              <Link className="hm-needs-btn ghost" to="/operations/scheduling"><i className="fa-regular fa-calendar"></i>Open schedule</Link>
            </div>
          </div>
        </div>

        <div className="hm-hero-kpis">
          <div className="hm-hero-kpi"><span className="hm-hero-kpi-value">{students.length}</span><span className="hm-hero-kpi-label">Active students</span></div>
          <div className="hm-hero-kpi"><span className="hm-hero-kpi-value">{sessionsThisWeek}</span><span className="hm-hero-kpi-label">Sessions this week</span></div>
          <div className="hm-hero-kpi"><span className="hm-hero-kpi-value">{seatFillRate != null ? `${seatFillRate}%` : '—'}</span><span className="hm-hero-kpi-label">Seat fill rate</span></div>
          <div className="hm-hero-kpi"><span className="hm-hero-kpi-value">{moneyCompact(revenueMtd)}</span><span className="hm-hero-kpi-label">Revenue MTD</span></div>
        </div>
      </div>

      <div className="hm-grid">
        <Card title="Today's sessions" action={<Link className="hm-link" to="/operations/scheduling">Full schedule</Link>}>
          {todaySessions.length ? (
            <div>
              {todaySessions.map((s) => {
                const tint = tintFor(s.subject);
                const clashed = clashes.some(([a, b]) => a.session_id === s.session_id || b.session_id === s.session_id);
                return (
                  <Link key={s.session_id} to={`/operations/classes/${s.class_id}`} className="hm-session-row" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span className="hm-icon-tint" style={{ background: tint.bg, color: tint.fg }}><i className={subjectIcon(s.subject)}></i></span>
                    <div className="hm-session-when">
                      <span className="hm-session-day">{isoToLocal(s.starts_at).toFormat('h:mm a')}</span>
                      {s.room_id != null && <span className="hm-session-time">{roomName.get(s.room_id) ?? `Room ${s.room_id}`}</span>}
                    </div>
                    <div className="hm-session-what">
                      <span className="hm-session-subject">{s.subject}</span>
                      <span className="hm-session-meta">{s.instructor} · {s.enrolled} of {s.student_limit} students</span>
                    </div>
                    {clashed && <span className="hm-badge error">Room clash</span>}
                  </Link>
                );
              })}
            </div>
          ) : <Empty>No sessions today.</Empty>}
        </Card>

        <Card title="Join requests" action={<Link className="hm-link" to="/operations/requests">Roster</Link>}>
          {requests.length ? (
            <div>
              {requests.slice(0, 4).map((r) => {
                const initials = (r.student_name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
                const tint = tintFor(r.student_name);
                return (
                  <div key={r.request_id} className="hm-request-row">
                    <div className="hm-request-top">
                      <span className="hm-avatar-sm" style={{ background: tint.bg, color: tint.fg }}>{initials}</span>
                      <span className="hm-request-text"><strong>{r.student_name}</strong> wants to join {r.subject}</span>
                      <span className="hm-request-age">{isoToLocal(r.created_at).toRelative()}</span>
                    </div>
                    <div className="hm-request-actions">
                      <button type="button" className="approve" disabled={busyRequest === r.request_id} onClick={() => respond(r.request_id, 'approve')}>Approve</button>
                      <button type="button" className="decline" disabled={busyRequest === r.request_id} onClick={() => respond(r.request_id, 'reject')}>Decline</button>
                    </div>
                  </div>
                );
              })}
            </div>
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
  const me = user.user_id;

  useEffect(() => {
    Promise.all([
      instructorCalendarService.getMySessions(7),
      rescheduleService.getRequests(),
      bookingService.getPending(),
      instructorService.getMyClasses(me),
    ])
      .then(([sessions, reschedules, bookings, classes]) => setData({ sessions, reschedules, bookings, classes }))
      .catch((err) => setError(err.response?.data?.message || 'Could not load the dashboard'));
  }, [me]);

  if (error) return <div className="hm-error">{error}</div>;
  if (!data) return <Loading />;

  const now = DateTime.now();
  const todayIso = now.toISODate();
  const pending = data.reschedules.length + data.bookings.length;
  const todaySessions = data.sessions.filter((s) => isoToLocal(s.starts_at).toISODate() === todayIso);
  const needAttendanceNow = todaySessions.filter((s) => isoToLocal(s.starts_at) < now).length;
  const rosterStudentIds = new Set(data.classes.flatMap((c) => c.roster.filter((r) => r.status === 'active').map((r) => r.student_id)));
  // Classes with a past session and an active roster — the same real filter
  // Feedback.jsx uses, so this count matches what that page actually shows.
  const feedbackReady = data.classes.filter((c) => {
    const past = c.sessions.filter((s) => isoToLocal(s.starts_at) < now);
    return past.length > 0 && c.roster.some((r) => r.status === 'active');
  }).length;
  const nextSession = [...data.sessions].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))[0];

  const heroParts = [`${todaySessions.length} session${todaySessions.length === 1 ? '' : 's'} today`];
  if (needAttendanceNow) heroParts.push(`${needAttendanceNow} still need${needAttendanceNow === 1 ? 's' : ''} attendance`);
  const heroLine = heroParts.join(' · ') + (feedbackReady ? `. ${feedbackReady} class${feedbackReady === 1 ? '' : 'es'} ${feedbackReady === 1 ? 'has' : 'have'} recent sessions ready for feedback.` : '.');

  return (
    <div className="hm-page">
      <div className="hm-hero-card">
        <div className="hm-hero">
          <div className="hm-hero-copy">
            <span className="hm-eyebrow">{now.toFormat('cccc, LLLL d')}</span>
            <h1>Good {now.hour < 12 ? 'morning' : now.hour < 18 ? 'afternoon' : 'evening'}, {String(user?.name ?? '').split(' ')[0] || 'there'}</h1>
            <p>{heroLine}</p>
          </div>
          {nextSession ? (
            <div className="hm-needs">
              <div>
                <span className="hm-eyebrow">Up next</span>
                <h2>{nextSession.subject} · {isoToLocal(nextSession.starts_at).toFormat('ccc h:mm a')}</h2>
                <div className="hm-needs-meta">
                  <span><i className="fa-solid fa-users"></i>{nextSession.enrolled} enrolled</span>
                  <span><i className="fa-regular fa-clock"></i>{isoToLocal(nextSession.starts_at).toRelative()}</span>
                </div>
              </div>
              <div className="hm-needs-actions">
                <Link className="hm-needs-btn solid" to={`/operations/classes/${nextSession.class_id}/sessions/${nextSession.session_id}/attendance`}><i className="fa-solid fa-clipboard-check"></i>Take attendance</Link>
                <Link className="hm-needs-btn ghost" to="/instructor/classes"><i className="fa-solid fa-users"></i>Roster</Link>
              </div>
            </div>
          ) : (
            <div className="hm-needs">
              <div>
                <span className="hm-eyebrow">Up next</span>
                <h2>Nothing scheduled</h2>
                <p style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>No sessions in the next 7 days.</p>
              </div>
            </div>
          )}
        </div>

        <div className="hm-hero-kpis">
          <div className="hm-hero-kpi"><span className="hm-hero-kpi-value">{todaySessions.length}</span><span className="hm-hero-kpi-label">Sessions today</span></div>
          <div className="hm-hero-kpi"><span className="hm-hero-kpi-value">{data.sessions.length}</span><span className="hm-hero-kpi-label">Sessions this week</span></div>
          <div className="hm-hero-kpi"><span className="hm-hero-kpi-value">{rosterStudentIds.size}</span><span className="hm-hero-kpi-label">Students (all classes)</span></div>
          <div className="hm-hero-kpi"><span className={`hm-hero-kpi-value ${pending ? 'alert' : ''}`}>{pending}</span><span className="hm-hero-kpi-label">Pending requests</span></div>
        </div>
      </div>

      <div className="hm-grid">
        <Card title="Today's sessions" action={<Link className="hm-link" to="/operations/schedule">Full schedule</Link>}>
          {todaySessions.length ? (
            <div>
              {todaySessions.map((s) => {
                const tint = tintFor(s.subject);
                return (
                  <div key={s.session_id} className="hm-session-row">
                    <span className="hm-icon-tint" style={{ background: tint.bg, color: tint.fg }}><i className={subjectIcon(s.subject)}></i></span>
                    <div className="hm-session-when">
                      <span className="hm-session-day">{isoToLocal(s.starts_at).toFormat('h:mm a')}</span>
                    </div>
                    <div className="hm-session-what">
                      <span className="hm-session-subject">{s.subject}</span>
                      <span className="hm-session-meta">{label(s.class_type)} · {s.enrolled} enrolled</span>
                    </div>
                    <Link className="hm-link" to={`/operations/classes/${s.class_id}/sessions/${s.session_id}/attendance`}>Take attendance</Link>
                  </div>
                );
              })}
            </div>
          ) : <Empty>No sessions today.</Empty>}
        </Card>

        <div className="hm-stack">
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

          <Card title="Feedback" action={<Link className="hm-link" to="/instructor/feedback">Write feedback</Link>}>
            {feedbackReady ? (
              <p className="hm-kpi-label">{feedbackReady} class{feedbackReady === 1 ? '' : 'es'} {feedbackReady === 1 ? 'has' : 'have'} a recent session ready for feedback.</p>
            ) : <Empty>Nothing to write up right now.</Empty>}
          </Card>
        </div>
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
  const entries = data.record.entries ?? [];
  const notes = entries.filter((e) => e.note).slice(0, 2);
  const status = walletStatus(wallet);
  const low = status !== 'healthy';
  const { rate: attendancePct } = attendanceRate(entries);

  const now = DateTime.now();
  const thisMonthEntries = entries.filter((e) => isoToLocal(e.starts_at).hasSame(now, 'month'));
  const attendedThisMonth = thisMonthEntries.filter((e) => e.attendance?.status === 'present');
  const hoursThisMonth = attendedThisMonth.reduce((sum, e) => sum + DateTime.fromISO(e.ends_at).diff(DateTime.fromISO(e.starts_at), 'hours').hours, 0);
  const nextSession = sessions[0];

  return (
    <div className="hm-page">
      <div className="hm-hero-card">
        <div className="hm-hero">
          <div className="hm-hero-copy">
            <span className="hm-eyebrow">{now.toFormat('cccc, LLLL d')}</span>
            <h1>Welcome back, {String(user?.name ?? '').split(' ')[0] || 'there'}</h1>
            {nextSession ? (
              <p>Your next session is {label(nextSession.class_type)} <strong>{nextSession.subject}</strong> {isoToLocal(nextSession.starts_at).toRelative()}.</p>
            ) : <p>No upcoming sessions booked yet.</p>}
          </div>
          {nextSession ? (
            <div className="hm-needs">
              <div>
                <span className="hm-eyebrow">Up next</span>
                <h2>{nextSession.subject}</h2>
                <div className="hm-needs-meta">
                  <span><i className="fa-regular fa-clock"></i>{isoToLocal(nextSession.starts_at).toFormat('ccc, LLL d · h:mm a')}</span>
                </div>
              </div>
              <div className="hm-needs-actions">
                <Link className="hm-needs-btn solid" to={`/family/students/${me}/schedule`}><i className="fa-regular fa-eye"></i>Details</Link>
                <Link className="hm-needs-btn ghost" to={`/family/students/${me}/schedule`}><i className="fa-regular fa-calendar"></i>Reschedule</Link>
              </div>
            </div>
          ) : (
            <div className="hm-needs">
              <div>
                <span className="hm-eyebrow">Up next</span>
                <h2>Nothing scheduled</h2>
              </div>
              <div className="hm-needs-actions">
                <Link className="hm-needs-btn solid" to={`/family/students/${me}/book`}><i className="fa-solid fa-plus"></i>Book a session</Link>
              </div>
            </div>
          )}
        </div>

        <div className="hm-hero-kpis">
          <div className="hm-hero-kpi"><span className="hm-hero-kpi-value">{attendedThisMonth.length}</span><span className="hm-hero-kpi-label">Sessions attended (this month)</span></div>
          <div className="hm-hero-kpi"><span className="hm-hero-kpi-value">{hoursThisMonth.toFixed(1)}</span><span className="hm-hero-kpi-label">Hours this month</span></div>
          {attendancePct != null && (
            <div className="hm-hero-kpi"><span className="hm-hero-kpi-value">{attendancePct}%</span><span className="hm-hero-kpi-label">Attendance rate</span></div>
          )}
        </div>
      </div>

      <div className="hm-grid">
        <Card title="This week">
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
