// Staff Attendance — an OVERSIGHT surface, not a marking queue (product
// decision 2026-08-15: marking attendance is the instructor's job; staff
// retain full view/edit power for corrections, excusals, and covering for
// an instructor). Rebuilt 2026-08-19 per the design handoff's day view:
// a day pager, one row per class session that day (tint tile, time · room ·
// tutor), To mark / Marked tabs with counts, and a search box to jump to a
// class. The mock's "This week" stats strip was deliberately dropped.
// The auto-complete job backstops anything unmarked past the knob hours.
//
// There's no direct "sessions across all classes in a date range" endpoint,
// so this fetches every class (staff-only) then each class's sessions and
// flattens — the same N+1-by-class pattern as the instructor's My classes.
// A session counts as "marked" once its status leaves 'scheduled' (the
// attendance route flips it to 'completed' when every roster student has a
// mark) — a real signal, not invented.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import classService from '@/services/classService';
import roomService from '@/services/roomService';
import { lookFor } from '@/lib/subjectLooks';
import { isoToLocal } from 'mobius-lms';
import '@/css/attendance.css';
import '@/css/roster.css';

const PILL = {
  needsMarking: { bg: '#f7ecd8', fg: '#8a5c14' },
  upcoming: { bg: '#eef4f3', fg: '#5c4632' },
  marked: { bg: '#e3f1e8', fg: '#2e6f47' },
  cancelled: { bg: '#f9e6e5', fg: '#a03634' },
};

function Attendance() {
  const [sessions, setSessions] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('tomark');
  const [day, setDay] = useState(DateTime.now().startOf('day'));
  const [q, setQ] = useState('');

  useEffect(() => {
    roomService.getAllRooms().then(setRooms).catch(() => {});
    classService.getAllClasses()
      .then(async (classes) => {
        // getClass(id) (detail) doesn't return the list endpoint's display
        // names in the same shape — carry subject/instructor over from it.
        const details = await Promise.all(classes.map((c) => classService.getClass(c.class_id)));
        const flat = details.flatMap((cls, i) =>
          cls.sessions.map((s) => ({
            ...s,
            class_id: cls.class_id,
            subject: classes[i].subject,
            instructor: classes[i].instructor,
            rosterCount: cls.roster.filter((r) => r.status === 'active').length,
          }))
        );
        flat.sort((a, b) => (a.starts_at < b.starts_at ? -1 : 1));
        setSessions(flat);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load sessions'));
  }, []);

  if (error) return <div className="hm-page"><div className="hm-error">{error}</div></div>;
  if (!sessions) return <div className="hm-page hm-loading">Loading…</div>;

  const now = DateTime.now();
  const isToday = day.hasSame(now, 'day');
  const roomName = new Map(rooms.map((r) => [r.room_id, r.name]));
  const needle = q.trim().toLowerCase();

  const daySessions = sessions
    .filter((s) => isoToLocal(s.starts_at).hasSame(day, 'day'))
    .filter((s) => !needle || `${s.subject} ${s.instructor}`.toLowerCase().includes(needle));
  const toMark = daySessions.filter((s) => s.status === 'scheduled');
  const marked = daySessions.filter((s) => s.status !== 'scheduled');
  const shown = tab === 'tomark' ? toMark : marked;

  const tabChip = (key, label, count) => {
    const on = tab === key;
    return (
      <button key={key} type="button" onClick={() => setTab(key)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 15px', borderRadius: 999,
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          border: `1px solid ${on ? '#c2703e' : '#ead9c8'}`, background: on ? '#c2703e' : '#fff', color: on ? '#fff' : '#5c4632' }}>
        {label}
        <span style={{ fontSize: 11, fontWeight: 600, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: on ? 'rgba(255,255,255,.25)' : '#f6ecdf', color: on ? '#fff' : '#a3672a' }}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="hm-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <button type="button" className="hm-btn" aria-label="Previous day"
          style={{ width: 36, height: 36, padding: 0, justifyContent: 'center' }}
          onClick={() => setDay((d) => d.minus({ days: 1 }))}>
          <i className="fa-solid fa-chevron-left" />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, minWidth: 120, textAlign: 'center' }}>
          {isToday ? 'Today' : day.toFormat('ccc, LLL d')}
        </span>
        <button type="button" className="hm-btn" aria-label="Next day"
          style={{ width: 36, height: 36, padding: 0, justifyContent: 'center' }}
          onClick={() => setDay((d) => d.plus({ days: 1 }))}>
          <i className="fa-solid fa-chevron-right" />
        </button>
        {!isToday && (
          <button type="button" className="hm-btn" style={{ height: 36, fontSize: 12.5 }}
            onClick={() => setDay(DateTime.now().startOf('day'))}>
            Today
          </button>
        )}
        <label className="rt-search" style={{ height: 36 }}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input type="text" placeholder="Find a class or tutor…" aria-label="Find a class"
            value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {tabChip('tomark', 'To mark', toMark.length)}
          {tabChip('marked', 'Marked', marked.length)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {shown.map((s) => {
          const look = lookFor(s.subject);
          const started = isoToLocal(s.starts_at) <= now;
          const cancelled = s.status.startsWith('cancelled');
          const pill = tab === 'tomark'
            ? (started
              ? { ...PILL.needsMarking, text: 'Needs marking' }
              : { ...PILL.upcoming, text: `Starts ${isoToLocal(s.starts_at).toFormat('h:mm a')}` })
            : (cancelled
              ? { ...PILL.cancelled, text: s.status.replace(/_/g, ' ') }
              : s.status === 'completed'
                ? { ...PILL.marked, text: 'Marked' }
                : { ...PILL.needsMarking, text: s.status.replace(/_/g, ' ') });
          return (
            <section key={s.session_id} className="hm-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', flexWrap: 'wrap' }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: look.band, color: look.accent,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  <i className={look.icon} />
                </span>
                <div style={{ minWidth: 170, flex: 1, lineHeight: 1.3 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{s.subject}</div>
                  <div style={{ fontSize: 12, color: '#7d6a5c', marginTop: 2 }}>
                    {isoToLocal(s.starts_at).toFormat('h:mm a')}
                    {s.room_id != null && ` · ${roomName.get(s.room_id) ?? `Room ${s.room_id}`}`}
                    {s.instructor && ` · ${s.instructor}`}
                    {` · ${s.rosterCount} student${s.rosterCount === 1 ? '' : 's'}`}
                  </div>
                </div>
                {cancelled && s.cancellation_reason && (
                  <span style={{ fontSize: 12, color: '#7d6a5c', fontStyle: 'italic' }}>"{s.cancellation_reason}"</span>
                )}
                <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 999,
                  background: pill.bg, color: pill.fg }}>
                  {pill.text}
                </span>
                {tab === 'tomark' && started && (
                  <Link className="hm-btn primary" style={{ height: 36, flexShrink: 0 }}
                    to={`/operations/classes/${s.class_id}/sessions/${s.session_id}/attendance`}>
                    Take attendance
                  </Link>
                )}
                {tab === 'marked' && s.status === 'completed' && (
                  <Link className="hm-btn" style={{ height: 36, flexShrink: 0 }}
                    to={`/operations/classes/${s.class_id}/sessions/${s.session_id}/attendance`}>
                    Review
                  </Link>
                )}
              </div>
            </section>
          );
        })}

        {shown.length === 0 && (
          <div className="hm-empty" style={{ textAlign: 'center', padding: '56px 20px', background: '#fff',
            border: '1px solid #f0e3d8', borderRadius: 16 }}>
            <i className={`fa-solid ${tab === 'tomark' ? 'fa-clipboard-check' : 'fa-clipboard-list'}`}
              style={{ fontSize: 26, color: tab === 'tomark' ? '#2c8a5b' : '#c4a98e' }} />
            <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 14 }}>
              {needle
                ? `No classes match "${q.trim()}"`
                : tab === 'tomark'
                  ? (marked.length ? 'All marked for this day' : 'Nothing to mark on this day')
                  : 'Nothing marked on this day'}
            </div>
            <div style={{ fontSize: 13.5, color: '#7d6a5c', marginTop: 6 }}>
              {needle
                ? 'Try another name, or check a different day.'
                : tab === 'tomark'
                  ? 'Instructors mark their own sessions — this page is for oversight and covering for them.'
                  : 'Marked and cancelled sessions for the day will show here.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Attendance;
