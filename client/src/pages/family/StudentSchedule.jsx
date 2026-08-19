// v2 family schedule: weekly calendar grid (design handoff, Mobius
// Student.dc.html "SCHEDULE" view) — 56px gutter + 7 day columns, 64px/hour
// 8 AM–7 PM, blocks colored Confirmed (teal) / Awaiting confirmation (amber)
// / Past (grey), read-only until tapped. Tapping opens the session detail
// modal -> Request reschedule -> tutor-suggested slots -> confirm. No reason
// field, no preferred-window input — 3 steps, not 4. The original session
// stays booked until the instructor confirms (INV-2).
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import messageService from '@/services/messageService';
import studentViewService from '@/services/studentViewService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import instructorCalendarService from '@/services/instructorCalendarService';
import instructorService from '@/services/instructorService';
import Modal from '@/components/Modal';
import { isoToLocal } from 'mobius-lms';
import '@/css/schedule.css';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const fmt = (iso) => isoToLocal(iso).toFormat('ccc, LLL d · h:mm a');
const fmtTime = (iso) => isoToLocal(iso).toFormat('h:mm a');

// Grid geometry + status palettes (verbatim from the design's weekData).
const HOUR_START = 8, HOUR_END = 19, PX_PER_HOUR = 64;
const GRID_H = (HOUR_END - HOUR_START) * PX_PER_HOUR;
const PALETTE = {
  teal: { bg: '#eafaf6', bd: '#c7ebe2', accent: '#2e9d8d', fg: '#16303a', metaFg: '#4a8a80' },
  amber: { bg: '#fff6e6', bd: '#f0dcae', accent: '#e0a83e', fg: '#7a5a16', metaFg: '#9c6a1d' },
  past: { bg: '#f4f6f5', bd: '#e2e8e6', accent: '#c8d6d2', fg: '#8a9c98', metaFg: '#a8b6b2' },
};
// Luxon weekday is Mon=1..Sun=7; the design's week runs SUN..SAT.
const sundayOf = (dt) => dt.startOf('day').minus({ days: dt.weekday % 7 });

function StudentSchedule() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [weekStart, setWeekStart] = useState(() => sundayOf(DateTime.now()));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [detailFor, setDetailFor] = useState(null);   // session shown in the detail modal
  const [step, setStep] = useState('detail');          // detail | pick | done
  const [slots, setSlots] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [tutorName, setTutorName] = useState('');
  const [result, setResult] = useState(null);

  const load = useCallback(() => {
    studentViewService.getSchedule(studentId, {
      from: weekStart.toUTC().toISO(),
      to: weekStart.plus({ days: 7 }).toUTC().toISO(),
    }).then(setSchedule)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load schedule'));
  }, [studentId, weekStart]);
  useEffect(load, [load]);

  const openDetail = (session) => {
    setDetailFor(session);
    setStep('detail');
    setSlots(null);
    setChosen(null);
    setResult(null);
    setError('');
    // Tutor name for the detail rows (design: person row shows the tutor).
    setTutorName('');
    instructorService.getInstructorById(session.instructor_id)
      .then((ins) => setTutorName(ins?.name ?? ''))
      .catch(() => {});
  };
  const closeModal = () => setDetailFor(null);

  const messageTutor = async () => {
    try {
      await messageService.startConversation(detailFor.instructor_id);
      navigate('/messages');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start conversation');
    }
  };

  const cancel = async () => {
    if (!window.confirm('Cancel this session? Inside the change window the credit is forfeited (you can appeal).')) return;
    setError('');
    try {
      const res = await sessionServiceV2.cancelSession(detailFor.session_id, Number(studentId));
      setNotice(`Cancelled — ${res.money_effect === 'credit_forfeited'
        ? 'past the change deadline: credit will not be used (a review request was filed for staff)'
        : 'credit will not be used'}`);
      closeModal();
      load();
    } catch (err) {
      setError(`${err.response?.data?.code ?? ''} ${err.response?.data?.message ?? 'Cancel failed'}`.trim());
    }
  };

  const startReschedule = async () => {
    setStep('pick');
    setError('');
    setSlots(null);
    try {
      const [{ slots: openSlots }, instructor] = await Promise.all([
        instructorCalendarService.getOpenSlots(
          detailFor.instructor_id,
          DateTime.utc().toISO(),
          DateTime.utc().plus({ days: 14 }).toISO(),
          BROWSER_TZ
        ),
        instructorService.getInstructorById(detailFor.instructor_id).catch(() => null),
      ]);
      setSlots(openSlots);
      setTutorName(instructor?.name ?? 'your tutor');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load open slots');
    }
  };

  const confirmReschedule = async () => {
    if (!chosen) return;
    setError('');
    const durationMs = DateTime.fromISO(detailFor.ends_at).diff(DateTime.fromISO(detailFor.starts_at)).toMillis();
    try {
      const start = DateTime.fromISO(chosen.starts_at);
      const res = await sessionServiceV2.requestReschedule(detailFor.session_id, {
        proposed_starts_at: start.toUTC().toISO(),
        proposed_ends_at: start.plus({ milliseconds: durationMs }).toUTC().toISO(),
      });
      setResult(res);
      setStep('done');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Reschedule request failed');
    }
  };

  if (error && !schedule) return <div className="hm-error">{error}</div>;
  if (!schedule) return <div className="hm-loading">Loading…</div>;

  // ---- weekly grid model ----
  const now = DateTime.now();
  const days = Array.from({ length: 7 }, (_, i) => weekStart.plus({ days: i }));
  const cols = days.map(() => []);
  for (const s of schedule.sessions) {
    const start = isoToLocal(s.starts_at), end = isoToLocal(s.ends_at);
    const dayIdx = Math.round(start.startOf('day').diff(weekStart, 'days').days);
    if (dayIdx < 0 || dayIdx > 6) continue;
    const startH = Math.max(start.hour + start.minute / 60, HOUR_START);
    const endH = Math.min(end.hour + end.minute / 60, HOUR_END);
    if (endH <= startH) continue;
    const isPast = s.status === 'completed' || end < now;
    const pal = isPast ? PALETTE.past : s.status === 'reschedule_requested' ? PALETTE.amber : PALETTE.teal;
    cols[dayIdx].push({
      session: s, isPast, pal,
      top: (startH - HOUR_START) * PX_PER_HOUR,
      height: (endH - startH) * PX_PER_HOUR - 6,
      // Design's compact block time: meridiem on the end only ("4:00 – 5:00 PM")
      time: `${start.toFormat('h:mm')} – ${end.toFormat('h:mm a')}`,
    });
  }
  const weekEnd = weekStart.plus({ days: 6 });
  const rangeLabel = weekStart.month === weekEnd.month
    ? `${weekStart.toFormat('LLL d')} – ${weekEnd.toFormat('d, yyyy')}`
    : `${weekStart.toFormat('LLL d')} – ${weekEnd.toFormat('LLL d, yyyy')}`;
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => {
    const h = HOUR_START + i;
    return { top: i * PX_PER_HOUR, label: DateTime.now().set({ hour: h, minute: 0 }).toFormat('h a').toUpperCase() };
  });
  const legendDot = (c) => ({ width: 10, height: 10, borderRadius: 3, background: c });

  return (
    <div className="hm-page" style={{ maxWidth: 1220, margin: '0 auto' }}>
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)', marginBottom: 14 }}>{notice}</div>}
      {error && <div className="hm-error" style={{ marginBottom: 14 }}>{error}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-.01em' }}>{rangeLabel}</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="hm-btn" aria-label="Previous week"
            style={{ width: 38, height: 38, padding: 0, justifyContent: 'center' }}
            onClick={() => setWeekStart((w) => w.minus({ days: 7 }))}>
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button type="button" className="hm-btn" style={{ height: 38 }}
            onClick={() => setWeekStart(sundayOf(DateTime.now()))}>Today</button>
          <button type="button" className="hm-btn" aria-label="Next week"
            style={{ width: 38, height: 38, padding: 0, justifyContent: 'center' }}
            onClick={() => setWeekStart((w) => w.plus({ days: 7 }))}>
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, fontSize: 12.5, color: '#64827e' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={legendDot('#2e9d8d')} />Confirmed</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={legendDot('#e0a83e')} />Awaiting confirmation</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={legendDot('#c8d6d2')} />Past</span>
        </div>
      </div>

      <section className="hm-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7,1fr)', borderBottom: '1px solid #e3eeec' }}>
          <div />
          {days.map((d) => {
            const isToday = d.hasSame(now, 'day');
            return (
              <div key={d.toISODate()} style={{ padding: '12px 8px', textAlign: 'center',
                borderLeft: '1px solid #eef5f3', background: isToday ? '#f2faf8' : '#fff' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', color: '#9fb4b0', textTransform: 'uppercase' }}>
                  {d.toFormat('ccc').toUpperCase()}
                </div>
                <div style={{ marginTop: 3, fontSize: 16, fontWeight: 600, color: isToday ? '#2e9d8d' : '#16303a' }}>
                  {d.day}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '56px repeat(7,1fr)', height: GRID_H }}>
          <div style={{ position: 'relative' }}>
            {hours.map((h) => (
              <div key={h.label} style={{ position: 'absolute', left: 0, right: 0, top: h.top, height: 1 }}>
                <span style={{ position: 'absolute', right: 8, top: -7, fontSize: 10.5, color: '#9fb4b0' }}>{h.label}</span>
              </div>
            ))}
          </div>
          {cols.map((blocks, i) => (
            <div key={i} style={{ position: 'relative', borderLeft: '1px solid #eef5f3',
              backgroundImage: 'repeating-linear-gradient(#f2f7f6 0 1px,transparent 1px 64px)', backgroundPosition: '0 0' }}>
              {blocks.map((b) => (
                <button key={b.session.session_id} type="button"
                  onClick={b.isPast ? undefined : () => openDetail(b.session)}
                  style={{ position: 'absolute', left: 5, right: 5, top: b.top, height: b.height,
                    border: `1px solid ${b.pal.bd}`, borderLeft: `3px solid ${b.pal.accent}`,
                    background: b.pal.bg, borderRadius: 9, padding: '7px 9px', textAlign: 'left',
                    cursor: b.isPast ? 'default' : 'pointer', overflow: 'hidden', fontFamily: 'inherit' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: b.pal.fg, lineHeight: 1.2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.session.subject}</div>
                  <div style={{ fontSize: 10.5, color: b.pal.metaFg, marginTop: 2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />{b.time}
                  </div>
                  {b.session.room && (
                    <div style={{ fontSize: 10.5, color: b.pal.metaFg, marginTop: 1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <i className="fa-solid fa-location-dot" style={{ marginRight: 4 }} />{b.session.room}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>

      <Modal isOpen={!!detailFor} onClose={closeModal}>
        {detailFor && step === 'detail' && (() => {
          const pending = detailFor.status === 'reschedule_requested';
          const tint = pending ? PALETTE.amber : PALETTE.teal;
          const infoRow = (icon, text) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: '12px 14px' }}>
              <i className={icon} style={{ color: '#2e9d8d', width: 16 }} />
              <span style={{ fontSize: 13.5 }}>{text}</span>
            </div>
          );
          return (
            <div className="sc-modal">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
                <span style={{ width: 48, height: 48, borderRadius: 13, flexShrink: 0, display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 18, background: tint.bg, color: tint.accent }}>
                  <i className="fa-solid fa-calendar" />
                </span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600 }}>{detailFor.subject}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64827e' }}>
                    {detailFor.room || detailFor.class_type.replace('_', ' ')}
                  </p>
                </div>
                {pending && <span className="hm-badge warn" style={{ marginLeft: 'auto' }}>Awaiting confirmation</span>}
              </div>
              {error && <div className="hm-error" style={{ marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#eef5f3',
                border: '1px solid #eef5f3', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                {infoRow('fa-regular fa-clock',
                  `${isoToLocal(detailFor.starts_at).toFormat('ccc, LLL d')} · ${isoToLocal(detailFor.starts_at).toFormat('h:mm')} – ${isoToLocal(detailFor.ends_at).toFormat('h:mm a')}`)}
                {infoRow('fa-regular fa-user', tutorName || 'Assigned tutor')}
                {detailFor.room && infoRow('fa-solid fa-location-dot', detailFor.room)}
              </div>
              {pending ? (
                <p style={{ margin: 0, fontSize: 13.5, color: '#64827e' }}>
                  A reschedule request is already pending — your current session stays booked until your tutor confirms.
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {detailFor.class_type === 'one_on_one' && (
                      <button type="button" className="hm-btn primary" onClick={startReschedule}
                        style={{ flex: 1, justifyContent: 'center' }}>
                        <i className="fa-regular fa-calendar" style={{ marginRight: 7 }} />Request reschedule
                      </button>
                    )}
                    <button type="button" className="hm-btn" onClick={messageTutor}
                      style={detailFor.class_type === 'one_on_one' ? undefined : { flex: 1, justifyContent: 'center' }}>
                      <i className="fa-regular fa-comment-dots" style={{ marginRight: 7 }} />Message tutor
                    </button>
                  </div>
                  <button type="button" onClick={cancel}
                    style={{ marginTop: 12, border: 'none', background: 'none', padding: 0, cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 12.5, color: '#9c3a31', textDecoration: 'underline' }}>
                    Cancel this session
                  </button>
                </>
              )}
            </div>
          );
        })()}

        {detailFor && step === 'pick' && (
          <div className="sc-modal">
            <h2>Move this session</h2>
            <p className="at-subtitle">Suggested times {tutorName} has open. Pick one — they'll confirm.</p>
            {error && <div className="hm-error">{error}</div>}
            {slots === null ? (
              <div className="hm-loading">Loading open times…</div>
            ) : (
              <div className="sc-slot-grid">
                {slots.map((sl, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`sc-slot ${chosen === sl ? 'active' : ''}`}
                    onClick={() => setChosen(sl)}
                  >
                    {fmt(sl.starts_at)}
                  </button>
                ))}
                {slots.length === 0 && <div className="hm-empty">No open times in the next 14 days.</div>}
              </div>
            )}
            <div className="hm-actions">
              <button type="button" className="hm-btn" onClick={() => setStep('detail')}>Back</button>
              <button type="button" className="hm-btn primary" disabled={!chosen} onClick={confirmReschedule}>
                Confirm
              </button>
            </div>
          </div>
        )}

        {detailFor && step === 'done' && result && (
          <div className="sc-modal">
            <h2>Request sent</h2>
            <p>
              We asked {tutorName} to move {detailFor.subject} to {fmt(chosen.starts_at)}.
              You'll get a message once it's confirmed — your current session stays booked until then.
            </p>
            <div className="hm-actions">
              <button type="button" className="hm-btn primary" onClick={closeModal}>Done</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default StudentSchedule;
