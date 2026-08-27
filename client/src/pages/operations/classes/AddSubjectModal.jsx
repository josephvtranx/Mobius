// Add a subject — student-locked placement modal (UX decided 2026-08-20):
// the student is CONTEXT (header line), never a dropdown; step 1 picks the
// subject and the format, and the format branches step 2 — group shows the
// real open classes to join, private paints availability and matches real
// instructors. Private supports recurring (1–4×/week, open-ended class) or
// a single instance (one-off 1:1 class, staff-created and active — not the
// family's pending self-serve booking). Money is never collected here:
// step 3 previews the credit runway against the wallet and links to
// Payments on a shortfall; the server gates stay the enforcement and their
// errors render verbatim. Full group classes offer a waitlist membership
// request behind an explicit confirm (never a silent side effect).
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '@/components/Modal';
import subjectService from '@/services/subjectService';
import classService from '@/services/classService';
import walletService from '@/services/walletService';
import roomService from '@/services/roomService';
import onboardingService from '@/services/onboardingService';
import { scheduleLabel } from '@/lib/recurrenceLabel';
import { lookFor } from '@/lib/subjectLooks';
import { tintFor } from '@/lib/rosterColors';
import { isoToLocal } from 'mobius-lms';
import '@/css/roster.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEY = { Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat', Sun: 'sun' };
const PART_HOURS = { am: [8, 9, 10, 11, 12], pm: [16, 17, 18, 19, 20] };
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const label = { display: 'block', fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#c4a98e', marginBottom: 6 };
const clock = (h) => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`;
const initialsOf = (n) => String(n || '?').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

const chipStyle = (on) => ({
  padding: '8px 15px', borderRadius: 999, fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  border: `1px solid ${on ? '#d9772e' : '#f0e3d8'}`, background: on ? '#f2a83d' : '#fff', color: on ? '#fff' : '#5c4632',
});

function AddSubjectModal({ isOpen, onClose, onDone, student, studentSessions = [] }) {
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [settings, setSettings] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [format, setFormat] = useState('group');       // 'group' | 'private'
  const [cadence, setCadence] = useState(1);           // 'single' | 1..4
  const [chosenClass, setChosenClass] = useState(null);
  const [waitlistFor, setWaitlistFor] = useState(null); // full class awaiting confirm
  const [dayPart, setDayPart] = useState('pm');
  const [avail, setAvail] = useState({});
  const [matches, setMatches] = useState(null);
  const [instrSel, setInstrSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!isOpen || !student) return;
    setStep(1); setSubjectId(null); setFormat('group'); setCadence(1);
    setChosenClass(null); setWaitlistFor(null); setAvail({}); setMatches(null);
    setInstrSel(null); setError(''); setDone(null);
    subjectService.getAllSubjects().then(setSubjects).catch(() => {});
    classService.getAllClasses().then(setClasses).catch(() => {});
    roomService.getAllRooms().then(setRooms).catch(() => {});
    onboardingService.getSettings().then(setSettings).catch(() => {});
    walletService.getWallet(student.student_id).then(setWallet).catch(() => {});
  }, [isOpen, student]);

  // ---- context derived from the student's REAL schedule ------------------
  const currentClasses = useMemo(() => {
    const seen = new Map();
    for (const s of studentSessions) {
      if (!seen.has(s.class_id)) seen.set(s.class_id, s.subject);
    }
    return [...seen.values()];
  }, [studentSessions]);

  // Busy (weekday, hour) pairs from real upcoming sessions — pre-blocks
  // paint cells and flags conflicting group classes.
  const busyHours = useMemo(() => {
    const set = new Set();
    for (const s of studentSessions) {
      const d = isoToLocal(s.starts_at);
      const end = isoToLocal(s.ends_at);
      for (let h = d.hour; h < Math.max(end.hour, d.hour + 1); h++) set.add(`${DAYS[d.weekday - 1]}-${h}`);
    }
    return set;
  }, [studentSessions]);

  const conflictOf = (cls) => {
    for (const b of cls.recurrence_rule?.byday ?? []) {
      const day = DAYS[['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(b.day)];
      const start = Number(b.start.slice(0, 2));
      const end = Number(b.end.slice(0, 2));
      for (let h = start; h < end; h++) {
        if (busyHours.has(`${day}-${h}`)) return `Clashes with an existing session · ${day} ${clock(h)}`;
      }
    }
    return null;
  };

  const subjectName = subjects.find((s) => s.subject_id === subjectId)?.name ?? '';
  const groupOptions = classes.filter((c) => c.status === 'active' && c.class_type === 'group' && c.subject_id === subjectId);
  const openGroups = groupOptions.filter((c) => c.enrolled < c.student_limit);
  const perWeek = cadence === 'single' ? 1 : cadence;
  const paintedCount = (part) => Object.keys(avail).filter((k) => k.startsWith(`${part}:`) && avail[k]).length;
  const totalPainted = paintedCount('am') + paintedCount('pm');
  const chosen = matches != null && instrSel != null ? matches[instrSel] : null;
  const creditCost = format === 'group'
    ? (chosenClass?.session_credit_cost ?? null)
    : (settings?.default_one_on_one_credit_cost ?? 5);
  // Runway preview mirrors the gate's shape: single = 1 session; open-ended
  // = the runway-window setting. Fixed-end group classes need the remaining-
  // session count only the server knows — flagged approximate.
  const runwaySessions = cadence === 'single' && format === 'private'
    ? 1 : (settings?.enrollment_runway_sessions ?? 4);
  const required = creditCost != null ? creditCost * runwaySessions : null;
  const balance = wallet?.available ?? wallet?.balance ?? null;
  const shortfall = required != null && balance != null ? Math.max(0, required - balance) : 0;

  const availabilityWindows = useMemo(() => {
    const windows = [];
    for (const part of ['am', 'pm']) {
      for (const day of DAYS) {
        const hours = PART_HOURS[part].filter((_, i) => avail[`${part}:${day}-${i}`]);
        if (!hours.length) continue;
        let start = hours[0];
        let prev = hours[0];
        for (const h of hours.slice(1).concat([null])) {
          if (h !== prev + 1) {
            windows.push({ day: DAY_KEY[day], start: `${String(start).padStart(2, '0')}:00`, end: `${String(prev + 1).padStart(2, '0')}:00` });
            start = h;
          }
          prev = h;
        }
      }
    }
    return windows;
  }, [avail]);

  const runMatch = async () => {
    setMatches(null);
    setInstrSel(null);
    setError('');
    try {
      const r = await onboardingService.match({ subject_id: subjectId, per_week: perWeek, availability: availabilityWindows, tz: TZ });
      setMatches(r.matches);
    } catch (err) {
      setError(err.response?.data?.message || 'Match failed');
    }
  };

  const fileWaitlist = async (cls) => {
    setBusy(true);
    setError('');
    try {
      await classService.createMembershipRequest(cls.class_id, { kind: 'join', student_id: student.student_id });
      setDone({
        icon: 'fa-hourglass-half',
        title: 'Waitlist request filed',
        body: `${student.name} is queued for ${cls.subject} (${scheduleLabel(cls)}). When a seat opens, approve it from Requests.`,
      });
      onDone?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not file the request');
      setWaitlistFor(null);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      if (format === 'group') {
        await classService.enrollStudent(chosenClass.class_id, student.student_id);
        setDone({
          icon: 'fa-check',
          title: 'Enrolled',
          body: `${student.name} joined ${chosenClass.subject} — ${scheduleLabel(chosenClass)} with ${chosenClass.instructor}.`,
        });
      } else {
        const slots = cadence === 'single' ? [chosen.slots[0]] : chosen.slots;
        const startDate = isoToLocal(slots.map((s) => s.starts_at).sort()[0]);
        const roomOrder = [...rooms].filter((r) => r.is_active !== false).sort((a, b) => a.capacity - b.capacity);
        let created = null;
        let lastErr = null;
        for (const room of roomOrder) {
          try {
            created = await classService.createClass({
              class_type: 'one_on_one',
              subject_id: subjectId,
              instructor_id: chosen.instructor_id,
              student_limit: 1,
              session_credit_cost: creditCost,
              starts_on: startDate.toISODate(),
              default_room_id: room.room_id,
              ...(cadence === 'single'
                ? { recurrence: 'none', sessions: [{ starts_at: slots[0].starts_at, ends_at: slots[0].ends_at }] }
                : {
                  recurrence: 'weekly',
                  recurrence_rule: {
                    timezone: TZ,
                    byday: slots.map((s) => {
                      const d = isoToLocal(s.starts_at);
                      return { day: DAY_KEY[DAYS[d.weekday - 1]], start: d.toFormat('HH:mm'), end: d.plus({ hours: 1 }).toFormat('HH:mm') };
                    }),
                  },
                }),
            });
            break;
          } catch (err) {
            lastErr = err;
            if (!/conflict/i.test(err.response?.data?.message ?? '')) throw err;
          }
        }
        if (!created) throw lastErr;
        const classId = created.class?.class_id ?? created.class_id;
        await classService.enrollStudent(classId, student.student_id);
        setDone({
          icon: 'fa-check',
          title: cadence === 'single' ? 'Session booked' : 'Private class created',
          body: cadence === 'single'
            ? `${student.name} has a ${subjectName} session with ${chosen.name} on ${isoToLocal(slots[0].starts_at).toFormat('ccc, LLL d · h:mm a')}.`
            : `${student.name} is enrolled in weekly ${subjectName} with ${chosen.name} — ${slots.map((s) => isoToLocal(s.starts_at).toFormat('ccc h:mm a')).join(' · ')}, open-ended.`,
        });
      }
      onDone?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen || !student) return null;

  const stepValid = {
    1: subjectId != null && (format === 'group' ? true : cadence != null),
    2: format === 'group' ? !!chosenClass : (!!chosen && totalPainted >= perWeek),
    3: true,
  }[step];

  const pill = (n, name) => {
    const active = n === step;
    const complete = n < step;
    return (
      <span key={n} style={{ padding: '7px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap',
        background: active ? '#d9772e' : complete ? '#fdeedd' : '#f6f1ec',
        color: active ? '#fff' : complete ? '#b95f1d' : '#a99a8c' }}>
        {n} · {name}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="asw-root">
        {done ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 14, padding: 24 }}>
            <span style={{ width: 62, height: 62, borderRadius: 19, background: '#fdeedd', color: '#c26a24',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              <i className={`fa-solid ${done.icon}`} />
            </span>
            <div style={{ fontSize: 19, fontWeight: 600 }}>{done.title}</div>
            <p style={{ margin: 0, fontSize: 13.5, color: '#5c4632', maxWidth: '46ch', lineHeight: 1.55 }}>{done.body}</p>
            <button type="button" className="hm-btn primary" style={{ height: 38, marginTop: 8 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Add a subject — {student.name}</div>
              <div style={{ fontSize: 12.5, color: '#a98d76', marginTop: 2 }}>
                {currentClasses.length ? `Currently in ${currentClasses.join(', ')}` : 'No current classes'}
                {balance != null && <> · <strong style={{ color: '#5c4632' }}>{balance} cr</strong> available</>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 12, borderBottom: '1px solid #f5ebe1', flexWrap: 'wrap' }}>
              {pill(1, 'Subject')}
              {pill(2, format === 'group' ? 'Class' : 'Match')}
              {pill(3, 'Confirm')}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 2px' }}>
              {error && <div className="hm-error" style={{ marginBottom: 12 }}>{error}</div>}

              {/* ---------------- STEP 1: subject + format ---------------- */}
              {step === 1 && (
                <div style={{ display: 'grid', gap: 18 }}>
                  <div>
                    <span style={label}>Subject</span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {subjects.map((s) => (
                        <button key={s.subject_id} type="button" style={chipStyle(subjectId === s.subject_id)}
                          onClick={() => { setSubjectId(s.subject_id); setChosenClass(null); setMatches(null); }}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {subjectId != null && (
                    <div>
                      <span style={label}>Format</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <button type="button" onClick={() => openGroups.length && setFormat('group')}
                          style={{ textAlign: 'left', fontFamily: 'inherit', cursor: openGroups.length ? 'pointer' : 'default',
                            borderRadius: 12, padding: '13px 15px', opacity: openGroups.length ? 1 : 0.55,
                            border: `1px solid ${format === 'group' ? '#d9772e' : '#f0e3d8'}`,
                            background: format === 'group' ? '#fdf1e3' : '#fff' }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}><i className="fa-solid fa-users" style={{ marginRight: 8, color: '#c26a24' }} />Join a group class</div>
                          <div style={{ fontSize: 12, color: '#7d6a5c', marginTop: 4 }}>
                            {openGroups.length
                              ? `${openGroups.length} ${subjectName} class${openGroups.length === 1 ? '' : 'es'} with open seats`
                              : groupOptions.length ? 'All full — waitlist from the next step, or go private' : `No ${subjectName} group classes yet`}
                          </div>
                        </button>
                        <button type="button" onClick={() => setFormat('private')}
                          style={{ textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', borderRadius: 12, padding: '13px 15px',
                            border: `1px solid ${format === 'private' ? '#d9772e' : '#f0e3d8'}`,
                            background: format === 'private' ? '#fdf1e3' : '#fff' }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}><i className="fa-solid fa-user" style={{ marginRight: 8, color: '#c26a24' }} />Private 1:1</div>
                          <div style={{ fontSize: 12, color: '#7d6a5c', marginTop: 4 }}>Match an instructor to the family's schedule</div>
                        </button>
                      </div>
                    </div>
                  )}
                  {subjectId != null && format === 'private' && (
                    <div>
                      <span style={label}>Cadence</span>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button type="button" style={chipStyle(cadence === 'single')} onClick={() => setCadence('single')}>Single session</button>
                        {[1, 2, 3, 4].map((n) => (
                          <button key={n} type="button" style={chipStyle(cadence === n)} onClick={() => setCadence(n)}>{n}× / week</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- STEP 2A: pick a group class ---------------- */}
              {step === 2 && format === 'group' && (
                <div style={{ display: 'grid', gap: 10 }}>
                  {groupOptions.map((c) => {
                    const full = c.enrolled >= c.student_limit;
                    const conflict = conflictOf(c);
                    const on = chosenClass?.class_id === c.class_id;
                    const look = lookFor(c.subject);
                    const confirming = waitlistFor?.class_id === c.class_id;
                    return (
                      <div key={c.class_id}>
                        <button type="button"
                          onClick={() => (full ? setWaitlistFor(c) : (setChosenClass(c), setWaitlistFor(null)))}
                          style={{ width: '100%', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer',
                            borderRadius: 12, padding: '13px 15px', opacity: full && !confirming ? 0.6 : 1,
                            border: `1px solid ${on ? '#d9772e' : '#f0e3d8'}`, boxShadow: on ? '0 0 0 1px #d9772e' : 'none',
                            background: '#fff', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <span style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: look.band, color: look.accent,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>
                            <i className={look.icon} />
                          </span>
                          <div style={{ flex: 1, minWidth: 180, lineHeight: 1.35 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{scheduleLabel(c)} · {c.instructor}</div>
                            <div style={{ fontSize: 12, color: '#7d6a5c' }}>{c.enrolled} of {c.student_limit} seats · {c.session_credit_cost} cr / session</div>
                            {conflict && !full && (
                              <div style={{ fontSize: 11.5, color: '#9c3a31', marginTop: 3 }}>
                                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 5 }} />{conflict}
                              </div>
                            )}
                          </div>
                          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                            background: full ? '#fff4e0' : '#e9f5ee', color: full ? '#9c6a1d' : '#2c8a5b' }}>
                            {full ? 'Full' : `${c.student_limit - c.enrolled} seat${c.student_limit - c.enrolled === 1 ? '' : 's'} open`}
                          </span>
                          <i className={`fa-regular ${on ? 'fa-circle-dot' : 'fa-circle'}`} style={{ color: on ? '#d9772e' : '#c9baa9' }} />
                        </button>
                        {confirming && (
                          <div style={{ margin: '8px 0 4px', padding: '11px 13px', background: '#fdfaf6', border: '1px solid #f5ebe1',
                            borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12.5, color: '#5c4632', flex: 1, minWidth: 200 }}>
                              <strong>{c.subject}</strong> is full ({c.enrolled}/{c.student_limit}). File a waitlist request for {student.name}?
                              When a seat opens, you'll approve it from Requests.
                            </span>
                            <button type="button" className="hm-btn" style={{ height: 32, fontSize: 12 }} onClick={() => setWaitlistFor(null)}>Cancel</button>
                            <button type="button" className="hm-btn primary" style={{ height: 32, fontSize: 12 }} disabled={busy}
                              onClick={() => fileWaitlist(c)}>
                              File request
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {groupOptions.length === 0 && (
                    <div className="hm-empty" style={{ textAlign: 'center', padding: '36px 20px' }}>
                      No {subjectName} group classes — go back and choose Private 1:1.
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- STEP 2B: paint + match (private) ---------------- */}
              {step === 2 && format === 'private' && (
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <span style={label}>Family availability — dark cells are {student.name.split(' ')[0]}'s existing sessions</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['am', 'pm'].map((p) => {
                          const on = dayPart === p;
                          const n = paintedCount(p);
                          return (
                            <button key={p} type="button" onClick={() => setDayPart(p)}
                              style={{ padding: '5px 12px', borderRadius: 999, fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                border: `1px solid ${on ? '#d9772e' : '#f0e3d8'}`, background: on ? '#d9772e' : '#fff', color: on ? '#fff' : '#5c4632' }}>
                              {p === 'am' ? 'Morning' : 'Afternoon'}{n > 0 && ` · ${n}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '52px repeat(7, 1fr)', gap: 4 }}>
                      <span />
                      {DAYS.map((d) => <span key={d} style={{ fontSize: 11, fontWeight: 600, color: '#a99a8c', textAlign: 'center' }}>{d}</span>)}
                      {PART_HOURS[dayPart].map((h, ri) => (
                        [<span key={`h${h}`} style={{ fontSize: 11, color: '#a99a8c', alignSelf: 'center' }}>{clock(h)}</span>,
                          ...DAYS.map((d) => {
                            const key = `${dayPart}:${d}-${ri}`;
                            const blocked = busyHours.has(`${d}-${h}`);
                            const on = !blocked && !!avail[key];
                            return (
                              <button key={key} type="button" disabled={blocked}
                                aria-label={`${d} ${clock(h)}${blocked ? ' (busy)' : ''}`}
                                title={blocked ? 'Existing session' : undefined}
                                onClick={() => setAvail((a) => ({ ...a, [key]: !a[key] }))}
                                style={{ height: 38, borderRadius: 8, cursor: blocked ? 'not-allowed' : 'pointer',
                                  background: blocked ? '#d8cfc4' : on ? '#fbdcac' : '#f7f9fa',
                                  border: `1px solid ${blocked ? '#c9bcab' : on ? '#e0a13d' : '#eef2f4'}` }} />
                            );
                          })]
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12.5, color: totalPainted >= perWeek ? '#7d6a5c' : '#9c6a1d', flex: 1 }}>
                        {totalPainted >= perWeek
                          ? `${totalPainted} block${totalPainted === 1 ? '' : 's'} painted.`
                          : `Paint at least ${perWeek} block${perWeek === 1 ? '' : 's'} (${totalPainted} so far).`}
                      </span>
                      <button type="button" className="hm-btn primary" style={{ height: 34, fontSize: 12.5 }}
                        disabled={totalPainted < perWeek} onClick={runMatch}>
                        Find instructors
                      </button>
                    </div>
                  </div>

                  {matches && (
                    <div style={{ display: 'grid', gap: 10 }}>
                      <span style={label}>{matches.length} instructor{matches.length === 1 ? '' : 's'} match</span>
                      {matches.map((m, i) => {
                        const on = instrSel === i;
                        const tint = tintFor(m.name);
                        return (
                          <button key={m.instructor_id} type="button" onClick={() => setInstrSel(i)}
                            style={{ textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', background: '#fff',
                              border: `1px solid ${on ? '#d9772e' : '#f0e3d8'}`, boxShadow: on ? '0 0 0 1px #d9772e' : 'none',
                              borderRadius: 12, padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' }}>
                              <span className="rt-avatar" style={{ background: tint.bg, color: tint.fg }}>{initialsOf(m.name)}</span>
                              <div style={{ flex: 1, minWidth: 140 }}>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                                <div style={{ fontSize: 11.5, color: '#7d6a5c' }}>{m.employment_type === 'full_time' ? 'Full-time' : 'Part-time'}</div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 999,
                                background: m.auto_confirms ? '#1f7a6b' : '#fff', color: m.auto_confirms ? '#fff' : '#9c6a1d',
                                border: m.auto_confirms ? 'none' : '1px solid #e0a13d' }}>
                                {m.auto_confirms ? 'Auto-confirms ✓' : 'Needs confirmation'}
                              </span>
                              <i className={`fa-regular ${on ? 'fa-circle-dot' : 'fa-circle'}`} style={{ color: on ? '#d9772e' : '#c9baa9' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 9 }}>
                              {(cadence === 'single' ? m.slots.slice(0, 1) : m.slots).map((s) => (
                                <span key={s.starts_at} style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 8,
                                  background: on ? '#fbdcac' : '#f7f1ea', color: '#5c4632' }}>
                                  {isoToLocal(s.starts_at).toFormat('ccc, LLL d · h:mm a')}
                                </span>
                              ))}
                              {cadence !== 'single' && m.coverage < perWeek && (
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#9c6a1d', alignSelf: 'center' }}>
                                  + {perWeek - m.coverage} more slot{perWeek - m.coverage === 1 ? '' : 's'} needed
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {matches.length === 0 && (
                        <div className="hm-empty" style={{ textAlign: 'center', padding: '32px 20px' }}>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>No instructor fits</div>
                          <div style={{ fontSize: 13, color: '#7d6a5c', marginTop: 6 }}>Widen the availability or lower the cadence.</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ---------------- STEP 3: confirm ---------------- */}
              {step === 3 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
                  <div>
                    <div style={{ ...label, marginBottom: 10 }}>Summary</div>
                    {(format === 'group'
                      ? [
                        ['Student', student.name],
                        ['Subject', `${chosenClass.subject} · group`],
                        ['Class', `${scheduleLabel(chosenClass)} · ${chosenClass.instructor}`],
                        ['Seats', `${chosenClass.enrolled + 1} of ${chosenClass.student_limit} after joining`],
                        ['Credits', `${chosenClass.session_credit_cost} cr / session`],
                      ]
                      : [
                        ['Student', student.name],
                        ['Subject', `${subjectName} · private 1:1${cadence === 'single' ? ' · single session' : ` · ${cadence}× / week`}`],
                        ['Instructor', `${chosen.name}${chosen.auto_confirms ? ' · auto-confirms' : ' · needs confirmation'}`],
                        ['Schedule', (cadence === 'single' ? chosen.slots.slice(0, 1) : chosen.slots)
                          .map((s) => isoToLocal(s.starts_at).toFormat('ccc, LLL d · h:mm a')).join(' · ')],
                        ['Credits', `${creditCost} cr / session`],
                      ]
                    ).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0',
                        borderBottom: '1px solid #f5ebe1', fontSize: 13 }}>
                        <span style={{ color: '#7d6a5c', whiteSpace: 'nowrap' }}>{k}</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ ...label, marginBottom: 10 }}>Credit check</div>
                    <div style={{ padding: '13px 15px', borderRadius: 12,
                      background: shortfall > 0 ? '#fff4e0' : '#e9f5ee',
                      border: `1px solid ${shortfall > 0 ? '#e0a13d' : '#bfe0cc'}` }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: shortfall > 0 ? '#9c6a1d' : '#2c8a5b' }}>
                        <i className={`fa-solid ${shortfall > 0 ? 'fa-triangle-exclamation' : 'fa-check'}`} style={{ marginRight: 7 }} />
                        {shortfall > 0
                          ? `${shortfall} cr short of the runway`
                          : 'Wallet covers the runway'}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#5c4632', marginTop: 5, lineHeight: 1.5 }}>
                        {student.name.split(' ')[0]} has <strong>{balance ?? '—'} cr</strong> available;
                        the gate needs ~<strong>{required ?? '—'} cr</strong> ({runwaySessions} session{runwaySessions === 1 ? '' : 's'} × {creditCost} cr).
                        {shortfall > 0 && <> Collect a package on <Link className="hm-link" to="/operations/finance/payments">Payments</Link> first — enrolling now will be blocked by the credit gate.</>}
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#a98d76', marginTop: 10, lineHeight: 1.5 }}>
                      The server re-checks seats, room capacity and credits at enrollment — any gate failure shows here verbatim.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 9, paddingTop: 12, borderTop: '1px solid #f5ebe1' }}>
              <button type="button" className="hm-btn" style={{ height: 40 }} disabled={busy}
                onClick={() => (step === 1 ? onClose() : setStep((s) => s - 1))}>
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              {step < 3 ? (
                <button type="button" className="hm-btn primary" style={{ flex: 1, height: 40, justifyContent: 'center', opacity: stepValid ? 1 : 0.5 }}
                  disabled={!stepValid} onClick={() => setStep((s) => s + 1)}>
                  Next <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} />
                </button>
              ) : (
                <button type="button" className="hm-btn primary" style={{ flex: 1, height: 40, justifyContent: 'center', opacity: busy ? 0.5 : 1 }}
                  disabled={busy} onClick={confirm}>
                  {busy ? 'Enrolling…' : 'Enroll'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default AddSubjectModal;
