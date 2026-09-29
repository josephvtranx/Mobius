// Staff class detail per the design handoff (Mobius Staff.dc.html CLASS
// DETAIL view): tinted banner (icon, title, tutor · pattern · room, Edit /
// End class), stats strip, roster card with enrolled-since + attendance %,
// weekly-schedule card, and the sessions list below (not in the mock, but
// it carries real actions — attendance links + staff cancels — so it stays).
// The mock's "$45/session · Revenue $/mo" stats have no schema source: the
// price slot shows real credits/session and the third slot shows the term.
// Edit opens the effective-dated price/schedule editors; End class opens the
// handoff's red confirm panel (future-only end date, or terminate now).
// Server error codes render verbatim — the gate messages ARE the UX.
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import classService from '@/services/classService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import studentService from '@/services/studentService';
import roomService from '@/services/roomService';
import BydayEditor from './BydayEditor';
import Modal from '@/components/Modal';
import { isoToLocal, toUtcIso } from 'mobius-lms';
import { lookFor } from '@/lib/subjectLooks';
import { scheduleLabel } from '@/lib/recurrenceLabel';
import { tintFor } from '@/lib/rosterColors';
import { DateTime } from 'luxon';
import '@/css/attendance.css';
import '@/css/my-classes.css';
import '@/css/schedule.css';

// The three attendance outcomes a staff cancel can record (RSC-5). Money
// follows the outcome: only cancelled_late deducts (deductionEngine DEDUCTING).
const CANCEL_OPTIONS = [
  { value: 'instructor_cancelled', label: 'Tutor / academy cancelled', note: 'No credits deducted' },
  { value: 'cancelled_in_window', label: 'Family cancelled in time', note: 'No credits deducted' },
  { value: 'cancelled_late', label: 'Late cancel', note: 'Session credits are deducted' },
];
const fmt = (iso) => isoToLocal(iso).toFormat('ccc, LLL d · h:mm a');
const fmtDate = (d) => (d ? DateTime.fromISO(String(d).slice(0, 10)).toFormat('LLL d, yyyy') : null);
const initialsOf = (name) =>
  String(name || '?').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const SESSION_PILL = {
  scheduled: { bg: '#e3f1e8', fg: '#2e6f47' },
  completed: { bg: '#eef4f3', fg: '#5c4632' },
  reschedule_requested: { bg: '#f7ecd8', fg: '#8a5c14' },
};

function ClassDetail() {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollId, setEnrollId] = useState('');
  const [endOpen, setEndOpen] = useState(false);
  const [endsOn, setEndsOn] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [terminateOpen, setTerminateOpen] = useState(false);
  // Per-row cancel form: { sessionId, status, reason } while open, else null.
  const [cancel, setCancel] = useState(null);
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState({ cost: '', effective: '' });
  const [schedule, setSchedule] = useState({
    byday: [{ day: 'mon', start: '16:00', end: '17:00' }], effective: ''
  });

  const load = useCallback(() => {
    classService.getClass(classId)
      .then(setCls)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load class'));
  }, [classId]);

  useEffect(() => {
    load();
    studentService.getAllStudents().then(setStudents).catch(() => {});
    roomService.getAllRooms().then(setRooms).catch(() => {});
  }, [load]);

  useEffect(() => {
    if (cls && searchParams.get('edit') === 'capacity') {
      setCapacity(String(cls.student_limit));
      setEditOpen(true);
    }
  }, [cls, searchParams]);

  const run = (fn, successText) => async () => {
    setError('');
    setNotice('');
    try {
      const result = await fn();
      setNotice(typeof successText === 'function' ? successText(result) : (successText ?? JSON.stringify(result)));
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  };

  const terminate = async () => {
    setTerminateOpen(false);
    setEndOpen(false);
    await run(() => classService.terminateClass(classId), 'Class terminated — future sessions removed, roster cleared.')();
  };

  if (!cls) return <div className="hm-page">{error ? <div className="hm-error">{error}</div> : <div className="hm-loading">Loading…</div>}</div>;

  const look = lookFor(cls.subject ?? '');
  const roomName = new Map(rooms.map((r) => [r.room_id, r.name]));
  // Class-level room = the room its upcoming scheduled sessions meet in
  // (rooms are per-session in the schema; show the pattern's usual one).
  const upcoming = cls.sessions.filter((s) => s.status === 'scheduled');
  const roomCounts = new Map();
  for (const s of upcoming) if (s.room_id != null) roomCounts.set(s.room_id, (roomCounts.get(s.room_id) ?? 0) + 1);
  const usualRoomId = [...roomCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const usualRoom = usualRoomId != null ? roomName.get(usualRoomId) ?? `Room ${usualRoomId}` : null;

  const activeRoster = cls.roster.filter((r) => r.status === 'active');
  const full = activeRoster.length >= cls.student_limit;
  const pct = cls.student_limit ? Math.min(100, Math.round((activeRoster.length / cls.student_limit) * 100)) : 0;
  const seatText = `${activeRoster.length} of ${cls.student_limit}`;
  const meta = [cls.instructor, scheduleLabel(cls), usualRoom].filter(Boolean).join(' · ');
  const enrolledIds = new Set(activeRoster.map((r) => r.student_id));
  const enrollable = students.filter((s) => !enrolledIds.has(s.student_id ?? s.user_id));

  const statLabel = { fontSize: 10.5, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#c4a98e' };
  const statValue = { fontSize: 20, fontWeight: 600, marginTop: 4 };
  const fieldLabel = { display: 'block', fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#c4a98e', marginBottom: 6 };
  const fieldInput = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 10, border: '1px solid #ead9c8', fontFamily: 'inherit', fontSize: 13.5 };
  const editPanel = { padding: 16, background: '#fdfaf6', border: '1px solid #f5ebe1', borderRadius: 12 };

  // Edit opens prefilled with the class's REAL pattern — never a default the
  // save would silently rewrite the schedule to.
  const openEdit = () => {
    setCapacity(String(cls.student_limit));
    setPrice({ cost: '', effective: '' });
    setSchedule({
      byday: cls.recurrence_rule?.byday?.length
        ? cls.recurrence_rule.byday.map((r) => ({ ...r }))
        : [{ day: 'mon', start: '16:00', end: '17:00' }],
      effective: ''
    });
    setEditOpen(true);
  };

  return (
    <div className="hm-page">
      <Link to="/operations/classes" className="cd-back-link">
        <i className="fa-solid fa-chevron-left" />All classes
      </Link>

      {error && <div className="hm-error" style={{ marginBottom: 14 }}>{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)', wordBreak: 'break-word', marginBottom: 14 }}>{notice}</div>}

      <section className="hm-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ minHeight: 86, background: look.band, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '12px 24px', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 52, height: 52, borderRadius: 15, background: 'rgba(255,255,255,.85)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, color: look.accent }}>
              <i className={look.icon} />
            </span>
            <div>
              <div style={{ fontSize: 19, fontWeight: 600 }}>
                {cls.subject}
                {cls.status !== 'active' && (
                  <span style={{ fontSize: 11.5, fontWeight: 600, verticalAlign: 'middle', marginLeft: 10,
                    color: cls.status === 'pending' ? '#8a5c14' : '#7d6a5c',
                    background: 'rgba(255,255,255,.85)', padding: '4px 10px', borderRadius: 999, textTransform: 'capitalize' }}>
                    {cls.status}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: '#7d6a5c' }}>{meta}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <button type="button" className="hm-btn primary" style={{ height: 38 }} onClick={openEdit}>
              <i className="fa-solid fa-pen" style={{ marginRight: 7 }} />Edit
            </button>
            {cls.status === 'active' && (
              <button type="button" className="hm-btn" style={{ height: 38, color: '#9c3a31' }} onClick={() => setEndOpen(true)}>
                End class
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 4px', background: '#fdfaf6', borderTop: '1px solid #f5ebe1' }}>
          <div style={{ flex: 1, textAlign: 'center', padding: '0 18px', borderRight: '1px solid #f5ebe1' }}>
            <div style={statLabel}>Seats</div>
            <div style={statValue}>{seatText} filled</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '0 18px', borderRight: '1px solid #f5ebe1' }}>
            <div style={statLabel}>Price</div>
            <div style={statValue}>{cls.session_credit_cost} cr / session</div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: '0 18px' }}>
            <div style={statLabel}>Term</div>
            <div style={statValue}>{cls.ends_on ? `ends ${fmtDate(cls.ends_on)}` : 'Open-ended'}</div>
          </div>
        </div>
      </section>

      <div className="cd-grid">
        <section className="cd-roster hm-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="hm-card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f5ebe1', margin: 0 }}>
            <h2>Class roster</h2>
            <button type="button" className="hm-btn primary" style={{ height: 32, fontSize: 12.5 }} onClick={() => setEnrollOpen((v) => !v)}>
              <i className="fa-solid fa-user-plus" style={{ marginRight: 7 }} />Enroll student
            </button>
          </div>
          {enrollOpen && (
            <div style={{ display: 'flex', gap: 9, padding: '13px 20px', borderBottom: '1px solid #f5ebe1', background: '#fdfaf6' }}>
              <select value={enrollId} onChange={(e) => setEnrollId(e.target.value)}
                style={{ flex: 1, padding: 8, borderRadius: 10, border: '1px solid #ead9c8', fontFamily: 'inherit', fontSize: 13 }}>
                <option value="">— pick student —</option>
                {enrollable.map((s) => (
                  <option key={s.student_id ?? s.user_id} value={s.student_id ?? s.user_id}>{s.name}</option>
                ))}
              </select>
              <button type="button" className="hm-btn primary" style={{ height: 36 }} disabled={!enrollId}
                onClick={run(() => classService.enrollStudent(classId, Number(enrollId)).then((r) => { setEnrollId(''); setEnrollOpen(false); return r; }), 'Student enrolled.')}>
                Enroll
              </button>
            </div>
          )}
          {cls.roster.map((r) => {
            const tint = tintFor(r.name);
            const attendancePct = r.marked > 0 ? Math.round((r.attended / r.marked) * 100) : null;
            return (
              <div key={r.enrollment_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: '1px solid #f5ebe1' }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: tint.bg, color: tint.fg,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                  {initialsOf(r.name)}
                </span>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.25 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: '#7d6a5c' }}>
                    Enrolled {r.joined_at ? isoToLocal(r.joined_at).toFormat('LLL yyyy') : '—'}
                  </div>
                </div>
                {r.status !== 'active'
                  ? <span className="status-pill status-pill--warning">{r.status}</span>
                  : <span style={{ fontSize: 12.5, color: '#5c4632' }}>{attendancePct != null ? `Attendance ${attendancePct}%` : 'No sessions marked'}</span>}
              </div>
            );
          })}
          {cls.roster.length === 0 && (
            <div className="hm-empty" style={{ padding: '28px 20px' }}>No students enrolled yet.</div>
          )}
        </section>

        <section className="cd-weekly hm-card">
          <div className="hm-card-head"><h2>Weekly schedule</h2></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1px solid #f5ebe1', borderRadius: 12, background: '#fdfaf6' }}>
              <i className="fa-regular fa-calendar" style={{ color: '#c26a24' }} />
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{scheduleLabel(cls)}</div>
                <div style={{ fontSize: 11.5, color: '#7d6a5c' }}>{[usualRoom, cls.instructor].filter(Boolean).join(' · ')}</div>
              </div>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: '#f6ecdf', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${pct}%`, background: full ? '#8a6d1d' : '#d9772e' }} />
            </div>
            <div style={{ fontSize: 12, color: '#7d6a5c' }}>
              {seatText} seats filled · {cls.ends_on ? `term ends ${fmtDate(cls.ends_on)}` : 'open-ended'}
            </div>
          </div>
        </section>

        <section className="cd-sessions hm-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="hm-card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #f5ebe1', margin: 0 }}>
          <h2>Sessions</h2>
          <span style={{ fontSize: 12, color: '#7d6a5c' }}>{upcoming.length} upcoming</span>
        </div>
        {cls.sessions.map((s) => {
          const pill = SESSION_PILL[s.status] ?? { bg: '#f9e6e5', fg: '#a03634' };
          const cancelled = s.status.startsWith('cancelled');
          const hasEnded = isoToLocal(s.ends_at) <= DateTime.now();
          const hasAttendanceLog = s.status === 'completed';
          const cancelling = cancel?.sessionId === s.session_id;
          return (
            <div key={s.session_id} style={{ padding: '12px 20px', borderBottom: '1px solid #f5ebe1', opacity: cancelled ? 0.65 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 210, fontSize: 13.5 }}>
                  {fmt(s.starts_at)} – {isoToLocal(s.ends_at).toFormat('h:mm a')}
                  {s.room_id != null && <span style={{ color: '#7d6a5c' }}> · {roomName.get(s.room_id) ?? `Room ${s.room_id}`}</span>}
                </div>
                <span style={{ fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: pill.bg, color: pill.fg }}>
                  {s.status.replace(/_/g, ' ')}
                </span>
                {cancelled && (
                  <span style={{ fontSize: 12, color: '#7d6a5c', fontStyle: 'italic' }}>
                    {s.cancellation_reason ? `"${s.cancellation_reason}"` : 'No reason recorded'}
                  </span>
                )}
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {hasAttendanceLog && (
                    <Link className="hm-link" style={{ fontSize: 12.5 }} to={`/operations/attendance?session=${s.session_id}`}>
                      View attendance log
                    </Link>
                  )}
                  {hasEnded && s.status === 'scheduled' && (
                    <span style={{ fontSize: 12, color: 'var(--status-warning)' }}>Awaiting instructor</span>
                  )}
                  {s.status === 'scheduled' && !cancelling && (
                    <button type="button" className="hm-btn" style={{ height: 30, fontSize: 12, color: '#9c3a31' }}
                      onClick={() => setCancel({ sessionId: s.session_id, status: 'instructor_cancelled', reason: '' })}>
                      Cancel…
                    </button>
                  )}
                </span>
              </div>
              {cancelling && (
                <div style={{ marginTop: 12, padding: 14, background: '#fdfaf6', border: '1px solid #f5ebe1', borderRadius: 12,
                  display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Cancel this session — how should it count?</div>
                  {CANCEL_OPTIONS.map((o) => (
                    <label key={o.value} style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <input type="radio" name={`cancel-${s.session_id}`} checked={cancel.status === o.value}
                        onChange={() => setCancel((c) => ({ ...c, status: o.value }))} />
                      <span>
                        {o.label}
                        <span style={{ color: o.value === 'cancelled_late' ? '#9c3a31' : '#7d6a5c', marginLeft: 6, fontSize: 12 }}>
                          — {o.note}
                        </span>
                      </span>
                    </label>
                  ))}
                  <textarea rows={2} placeholder="Reason (required — families and the tutor are notified with it)"
                    value={cancel.reason} onChange={(e) => setCancel((c) => ({ ...c, reason: e.target.value }))}
                    style={{ padding: 8, borderRadius: 8, border: '1px solid #ead9c8', fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: 9, justifyContent: 'flex-end' }}>
                    <button type="button" className="hm-btn" style={{ height: 34 }} onClick={() => setCancel(null)}>Keep session</button>
                    <button type="button" disabled={!cancel.reason.trim()}
                      onClick={run(() => sessionServiceV2.staffCancel(s.session_id, { status: cancel.status, reason: cancel.reason.trim() })
                        .then((r) => { setCancel(null); return r; }), 'Session cancelled — families and the tutor were notified.')}
                      style={{ height: 34, padding: '0 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: '#9c3a31', color: '#fff',
                        opacity: cancel.reason.trim() ? 1 : 0.5 }}>
                      Cancel session
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {cls.sessions.length === 0 && <div className="hm-empty" style={{ padding: '28px 20px' }}>No sessions scheduled.</div>}
        </section>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
            <span style={{ width: 42, height: 42, borderRadius: 13, background: look.band, color: look.accent, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              <i className="fa-solid fa-pen" />
            </span>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Edit {cls.subject}</div>
              <div style={{ fontSize: 12.5, color: '#7d6a5c' }}>
                Capacity applies immediately; price and schedule changes are future-only.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {cls.class_type === 'group' && (
              <div id="capacity" style={editPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <span style={statLabel}>Capacity</span>
                  <span style={{ fontSize: 12, color: '#7d6a5c' }}>
                    {activeRoster.length} enrolled · currently {cls.student_limit} seats
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <label style={{ flex: 1 }}>
                    <span style={fieldLabel}>Student limit</span>
                    <input
                      type="number"
                      min={Math.max(2, activeRoster.length)}
                      step="1"
                      value={capacity}
                      onChange={(event) => setCapacity(event.target.value)}
                      style={fieldInput}
                    />
                  </label>
                  <button
                    type="button"
                    className="hm-btn primary"
                    style={{ height: 36, fontSize: 12.5, whiteSpace: 'nowrap' }}
                    disabled={!Number.isInteger(Number(capacity))
                      || Number(capacity) < Math.max(2, activeRoster.length)
                      || Number(capacity) === cls.student_limit}
                    onClick={run(
                      () => classService.setCapacity(classId, Number(capacity)),
                      (result) => result.warnings?.length
                        ? `Class limit updated. ${result.warnings.join(' ')}`
                        : 'Class limit updated.'
                    )}
                  >
                    Update limit
                  </button>
                </div>
                <div style={{ marginTop: 9, fontSize: 11.5, color: '#7d6a5c' }}>
                  The limit cannot be lower than the active roster. If a room is too small, Mobius will warn you after saving.
                </div>
              </div>
            )}

            <div style={editPanel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <span style={statLabel}>Price</span>
                <span style={{ fontSize: 12, color: '#7d6a5c' }}>currently {cls.session_credit_cost} cr / session</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <label style={{ flex: 1 }}>
                  <span style={fieldLabel}>Credits / session</span>
                  <input type="number" min="0" placeholder={String(cls.session_credit_cost)} value={price.cost}
                    onChange={(e) => setPrice((p) => ({ ...p, cost: e.target.value }))} style={fieldInput} />
                </label>
                <label style={{ flex: 1.5 }}>
                  <span style={fieldLabel}>Effective from</span>
                  <input type="datetime-local" value={price.effective}
                    onChange={(e) => setPrice((p) => ({ ...p, effective: e.target.value }))} style={fieldInput} />
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="hm-btn primary" style={{ height: 34, fontSize: 12.5 }}
                  disabled={!price.cost || !price.effective}
                  onClick={run(() => classService.setPrice(classId, Number(price.cost), toUtcIso(price.effective)), 'Price change scheduled.')}>
                  Set price
                </button>
              </div>
            </div>

            {cls.recurrence !== 'none' && (
              <div style={editPanel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <span style={statLabel}>Weekly pattern</span>
                  <span style={{ fontSize: 12, color: '#7d6a5c' }}>future sessions regenerate from the date you pick</span>
                </div>
                <BydayEditor byday={schedule.byday}
                  onChange={(byday) => setSchedule((s) => ({ ...s, byday }))} />
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 12 }}>
                  <label style={{ flex: 1 }}>
                    <span style={fieldLabel}>Effective from</span>
                    <input type="date" value={schedule.effective}
                      onChange={(e) => setSchedule((s) => ({ ...s, effective: e.target.value }))} style={fieldInput} />
                  </label>
                  <button type="button" className="hm-btn primary" style={{ height: 36, fontSize: 12.5, whiteSpace: 'nowrap' }}
                    disabled={!schedule.effective}
                    onClick={run(() => classService.updateSchedule(classId, {
                      recurrence_rule: {
                        timezone: cls.recurrence_rule?.timezone
                          || Intl.DateTimeFormat().resolvedOptions().timeZone,
                        byday: schedule.byday
                      },
                      effective_from: schedule.effective
                    }), 'New schedule applied.')}>
                    Apply new pattern
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="button" className="hm-btn" style={{ height: 38 }} onClick={() => setEditOpen(false)}>Close</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={endOpen} onClose={() => setEndOpen(false)}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
            <span style={{ width: 42, height: 42, borderRadius: 13, background: '#f9e6e5', color: '#9c3a31', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
              <i className="fa-solid fa-flag-checkered" />
            </span>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>End {cls.subject}</div>
              <div style={{ fontSize: 12.5, color: '#7d6a5c' }}>The class runs until the last day you pick.</div>
            </div>
          </div>
          <p style={{ fontSize: 13.5, color: '#5c4632', lineHeight: 1.55, margin: '0 0 16px' }}>
            Sessions after the last day are removed and enrolled families are notified.
            Everything up to it runs as scheduled, and nothing already billed changes.
          </p>
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#c4a98e', marginBottom: 6 }}>
              Last day
            </span>
            <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10,
                border: '1px solid #ead9c8', fontFamily: 'inherit', fontSize: 14 }} />
          </label>
          <div style={{ marginTop: 14, padding: '10px 13px', background: '#fdfaf6', border: '1px solid #f5ebe1', borderRadius: 10,
            fontSize: 12.5, color: '#7d6a5c', lineHeight: 1.5 }}>
            Need it gone today? <button type="button" onClick={() => { setEndOpen(false); setTerminateOpen(true); }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', fontWeight: 600, color: '#9c3a31', textDecoration: 'underline' }}>
              Terminate immediately</button> — that removes every future session and clears the roster.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 20 }}>
            <button type="button" className="hm-btn" style={{ height: 38 }} onClick={() => setEndOpen(false)}>Cancel</button>
            <button type="button" disabled={!endsOn}
              onClick={run(() => classService.endClass(classId, endsOn).then((r) => { setEndOpen(false); return r; }), 'End date set.')}
              style={{ height: 38, padding: '0 18px', borderRadius: 10, border: 'none', cursor: endsOn ? 'pointer' : 'default',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: '#9c3a31', color: '#fff', opacity: endsOn ? 1 : 0.45 }}>
              <i className="fa-solid fa-flag-checkered" style={{ marginRight: 7 }} />End class
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={terminateOpen} onClose={() => setTerminateOpen(false)}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
            <span style={{ width: 42, height: 42, borderRadius: 13, background: '#f9e6e5', color: '#9c3a31', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>
              <i className="fa-solid fa-triangle-exclamation" />
            </span>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 17, fontWeight: 600 }}>Terminate {cls.subject}?</div>
              <div style={{ fontSize: 12.5, color: '#9c3a31', fontWeight: 600 }}>Immediate — this cannot be undone.</div>
            </div>
          </div>
          <p style={{ fontSize: 13.5, color: '#5c4632', lineHeight: 1.55, margin: '0 0 4px' }}>
            Every future session is removed and the roster is cleared right now.
            Past attendance and billing already recorded are not affected.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 20 }}>
            <button type="button" className="hm-btn" style={{ height: 38 }} onClick={() => setTerminateOpen(false)}>Cancel</button>
            <button type="button" onClick={terminate}
              style={{ height: 38, padding: '0 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: '#9c3a31', color: '#fff' }}>
              Terminate now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ClassDetail;
