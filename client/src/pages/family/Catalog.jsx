// v2 group catalog (template — spec 03 SCH-3): browse open group classes and
// request a seat. No self-serve join — the request is the demand signal;
// staff vet and execute (level-matched placement).
import { useEffect, useState } from 'react';
import classService from '@/services/classService';
import authService from '@/services/authService';

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
    <div style={{ padding: 24 }}>
      <h1>Class catalog</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {notice && <p style={{ color: 'green' }}>{notice}</p>}
      {!isStudent && (
        <p>
          Requesting for student id:{' '}
          <input type="number" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        </p>
      )}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {catalog.map((c) => (
          <div key={c.class_id} style={{ border: '1px solid #ccc', padding: 12, minWidth: 240 }}>
            <h2>{c.subject}</h2>
            <p>with {c.instructor}</p>
            <p>{c.recurrence} · {c.session_credit_cost} credits/session</p>
            <p>{c.full ? 'Full' : `${c.seats_left} seat${c.seats_left === 1 ? '' : 's'} left`}</p>
            <button onClick={() => requestJoin(c)}>
              {c.full ? 'Full — join waitlist' : 'Request to join'}
            </button>
          </div>
        ))}
        {catalog.length === 0 && !error && <p>No open group classes right now.</p>}
      </div>
    </div>
  );
}

export default Catalog;
