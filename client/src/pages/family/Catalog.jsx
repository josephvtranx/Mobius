// v2 group catalog (template — spec 03 SCH-3): browse open group classes and
// request a seat. No self-serve join — the request is the demand signal;
// staff vet and execute (level-matched placement).
import { useEffect, useState } from 'react';
import classService from '@/services/classService';
import authService from '@/services/authService';
import '@/css/my-classes.css';

function Catalog() {
  const [catalog, setCatalog] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [studentId, setStudentId] = useState('');
  const user = authService.getCurrentUser();
  const isStudent = user?.role === 'student';

  useEffect(() => {
    classService.getCatalog().then(setCatalog)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load catalog'));
  }, []);

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

  return (
    <div className="hm-page">
      <h1 className="at-title">Class catalog</h1>
      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)' }}>{notice}</div>}
      {!isStudent && (
        <p className="at-subtitle">
          Requesting for student id:{' '}
          <input type="number" value={studentId} onChange={(e) => setStudentId(e.target.value)}
            style={{ padding: 6, borderRadius: 6, border: '1px solid var(--shell-border)' }} />
        </p>
      )}
      <div className="mc-list" style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {catalog.map((c) => (
          <section key={c.class_id} className="hm-card mc-card" style={{ minWidth: 240, flex: '1 1 260px' }}>
            <div className="hm-card-head">
              <h2>{c.subject}</h2>
              <span className={`hm-badge ${c.full ? 'error' : 'success'}`}>
                {c.full ? 'Full' : `${c.seats_left} seat${c.seats_left === 1 ? '' : 's'} left`}
              </span>
            </div>
            <p className="at-subtitle">with {c.instructor}</p>
            <p className="at-subtitle">{c.recurrence} · {c.session_credit_cost} credits/session</p>
            <div className="hm-card-foot">
              <button type="button" className="hm-btn primary" onClick={() => requestJoin(c)}>
                {c.full ? 'Join waitlist' : 'Request to join'}
              </button>
            </div>
          </section>
        ))}
        {catalog.length === 0 && !error && <div className="hm-empty">No open group classes right now.</div>}
      </div>
    </div>
  );
}

export default Catalog;
