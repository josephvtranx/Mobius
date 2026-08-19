// v2 group catalog (spec 03 SCH-3), card design per the handoff (Mobius
// Student.dc.html "CATALOG" view): filter chips + tinted-banner course cards
// with seats row and Request to join / Join waitlist CTA. No self-serve join —
// the request is the demand signal; staff vet and execute. Already-enrolled
// classes (student view) render the design's "Enrolled / View class" state.
// The prototype's bookmark button is a no-op there and is omitted here.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classService from '@/services/classService';
import authService from '@/services/authService';
import studentViewService from '@/services/studentViewService';
import '@/css/my-classes.css';

const SUBJECT_LOOKS = [
  { match: /math|algebra|calc|geometr/i, cat: 'Math', icon: 'fa-solid fa-square-root-variable', band: '#e6f3f0', accent: '#2e9d8d' },
  { match: /chem/i, cat: 'Science', icon: 'fa-solid fa-flask', band: '#eef1fb', accent: '#5b6bc0' },
  { match: /physic|science|bio/i, cat: 'Science', icon: 'fa-solid fa-atom', band: '#e6f3f0', accent: '#2e9d8d' },
  { match: /english|lit|read/i, cat: 'English', icon: 'fa-solid fa-book-open', band: '#fbeef1', accent: '#b95a76' },
  { match: /essay|writ/i, cat: 'English', icon: 'fa-solid fa-pen-nib', band: '#fbeef1', accent: '#b95a76' },
  { match: /sat|test|prep/i, cat: 'Test prep', icon: 'fa-solid fa-bullseye', band: '#fff4e0', accent: '#9c6a1d' },
];
const lookFor = (subject) =>
  SUBJECT_LOOKS.find((l) => l.match.test(subject)) ??
  { cat: 'Other', icon: 'fa-solid fa-bookmark', band: '#e6f3f0', accent: '#2e9d8d' };

function Catalog() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(null);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [studentId, setStudentId] = useState('');
  const user = authService.getCurrentUser();
  const isStudent = user?.role === 'student';

  useEffect(() => {
    classService.getCatalog().then(setCatalog)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load catalog'));
    if (isStudent) {
      studentViewService.getSchedule(user.user_id)
        .then((s) => setEnrolledIds(new Set(s.sessions.map((x) => x.class_id))))
        .catch(() => {});
    }
  }, [isStudent, user?.user_id]);

  const requestJoin = async (cls) => {
    setError('');
    setNotice('');
    const sid = isStudent ? user.user_id : Number(studentId);
    if (!sid) {
      setError('Enter the student id to request for (guardians: see your portal for your children\'s ids).');
      return;
    }
    try {
      const res = await classService.createMembershipRequest(cls.class_id, { kind: 'join', student_id: sid });
      setNotice(res.request.is_waitlist
        ? 'Class is full — you were added to the waitlist; staff will follow up when a seat frees.'
        : 'Join request sent — staff will confirm placement.');
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  };

  if (error && catalog === null) return <div className="hm-error">{error}</div>;
  if (catalog === null) return <div className="hm-loading">Loading…</div>;

  const cards = catalog.map((c) => ({ ...c, look: lookFor(c.subject), enrolled: enrolledIds.has(c.class_id) }));
  const filters = ['All', ...[...new Set(cards.map((c) => c.look.cat))]];
  const shown = filter === 'All' ? cards : cards.filter((c) => c.look.cat === filter);

  return (
    <div className="hm-page" style={{ maxWidth: 1160, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-.01em' }}>Class catalog</h1>
        <p style={{ margin: '7px 0 0', fontSize: 14, color: '#64827e' }}>
          Browse classes offered this term. Request to join — your academy confirms your spot.
        </p>
      </div>
      {error && <div className="hm-error" style={{ margin: '10px 0' }}>{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)', margin: '10px 0', padding: '12px 16px' }}>{notice}</div>}
      {!isStudent && (
        <p className="at-subtitle">
          Requesting for student id:{' '}
          <input type="number" value={studentId} onChange={(e) => setStudentId(e.target.value)}
            style={{ padding: 6, borderRadius: 6, border: '1px solid var(--shell-border)' }} />
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '18px 0 20px' }}>
        {filters.map((f) => {
          const on = filter === f;
          return (
            <button key={f} type="button" onClick={() => setFilter(f)}
              style={{ padding: '8px 16px', borderRadius: 999, fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                cursor: 'pointer', border: `1px solid ${on ? '#2e9d8d' : '#e3eeec'}`,
                background: on ? '#2e9d8d' : '#fff', color: on ? '#fff' : '#4a635f' }}>
              {f === 'All' ? 'All classes' : f}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 18 }}>
        {shown.map((c) => (
          <div key={c.class_id} className="hm-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 78, background: c.look.band, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '0 18px' }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,.85)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, color: c.look.accent }}>
                <i className={c.look.icon} />
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: c.look.accent,
                background: 'rgba(255,255,255,.85)', padding: '5px 11px', borderRadius: 999 }}>Group</span>
            </div>
            <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{c.subject}</div>
              <div style={{ fontSize: 12.5, color: '#64827e', marginTop: 3 }}>{c.instructor}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '14px 0 16px', fontSize: 12.5, color: '#4a635f' }}>
                {c.recurrence && (
                  <span><i className="fa-regular fa-calendar" style={{ width: 18, color: '#9fb4b0', marginRight: 4 }} />{c.recurrence}</span>
                )}
                <span>
                  <i className="fa-solid fa-users" style={{ width: 18, color: '#9fb4b0', marginRight: 4 }} />
                  {c.enrolled ? 'Enrolled'
                    : c.full ? 'Waitlist only'
                    : `${c.seats_left} of ${c.student_limit} seats left`}
                </span>
                <span>
                  <i className="fa-solid fa-coins" style={{ width: 18, color: '#9fb4b0', marginRight: 4 }} />
                  {c.session_credit_cost} credit{Number(c.session_credit_cost) === 1 ? '' : 's'} / session
                </span>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: 9 }}>
                {c.enrolled ? (
                  <button type="button" className="hm-btn" onClick={() => navigate(`/family/students/${user.user_id}/classes`)}
                    style={{ flex: 1, justifyContent: 'center', height: 40 }}>View class</button>
                ) : (
                  <button type="button" className="hm-btn primary" onClick={() => requestJoin(c)}
                    style={{ flex: 1, justifyContent: 'center', height: 40 }}>
                    {c.full ? 'Join waitlist' : 'Request to join'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {shown.length === 0 && <div className="hm-empty">No open group classes right now.</div>}
      </div>
    </div>
  );
}

export default Catalog;
