// v2 guardian portal (template — spec 05 GRD-1/GRD-5): per-child cards,
// needs-action, notifications, per-child notification prefs.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import guardianPortalService from '@/services/guardianPortalService';
import { isoToLocal } from '@/lib/time';

const PREF_MODES = ['all', 'billing_only', 'digest'];

function GuardianPortal() {
  const [portal, setPortal] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => {
    guardianPortalService.getPortal().then(setPortal)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load portal'));
  };
  useEffect(load, []);

  const setMode = async (studentId, mode) => {
    setNotice('');
    try {
      await guardianPortalService.setPrefs(studentId, { mode });
      setNotice(`Notification mode for student ${studentId} set to ${mode}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prefs');
    }
  };

  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!portal) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>My children</h1>
      {notice && <p style={{ color: 'green' }}>{notice}</p>}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {portal.children.map((c) => (
          <div key={c.student_id} style={{ border: '1px solid #ccc', padding: 12, minWidth: 260 }}>
            <h2>{c.name} {c.is_primary ? '(you are primary contact)' : ''}</h2>
            <p>Balance {c.balance} · Committed {c.committed} · Available {c.available}</p>
            <p>Last note: {c.last_note_at ? isoToLocal(c.last_note_at) : '—'}</p>
            <b>Next sessions</b>
            <ul>
              {c.next_sessions.map((s) => (
                <li key={s.session_id}>{isoToLocal(s.starts_at)} — {s.subject}</li>
              ))}
              {c.next_sessions.length === 0 && <li>None scheduled</li>}
            </ul>
            <p>
              <Link to={`/family/students/${c.student_id}/schedule`}>schedule</Link> ·{' '}
              <Link to={`/family/students/${c.student_id}/record`}>record</Link> ·{' '}
              <Link to={`/family/students/${c.student_id}/book`}>book a session</Link>
            </p>
            <label>
              notifications:{' '}
              <select defaultValue="all" onChange={(e) => setMode(c.student_id, e.target.value)}>
                {PREF_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          </div>
        ))}
        {portal.children.length === 0 && <p>No linked students.</p>}
      </div>

      <h2>Needs action</h2>
      <ul>
        {portal.needs_action.payment_links.map((pl) => (
          <li key={pl.link_id}>Payment link ({pl.amount}) — expires {isoToLocal(pl.expires_at)}</li>
        ))}
        {portal.needs_action.low_balance.map((lb, i) => (
          <li key={i} style={{ color: 'darkorange' }}>
            {lb.student_name}: low balance ({lb.balance} credits) for {lb.subject} ({lb.cost}/session)
          </li>
        ))}
        {portal.needs_action.payment_links.length === 0 && portal.needs_action.low_balance.length === 0 &&
          <li>Nothing needs your attention.</li>}
      </ul>

      <h2>Recent notifications</h2>
      <ul>
        {portal.notifications.map((n) => (
          <li key={n.notification_id}>
            {isoToLocal(n.created_at)} — {n.event_type}
          </li>
        ))}
        {portal.notifications.length === 0 && <li>None yet.</li>}
      </ul>
    </div>
  );
}

export default GuardianPortal;
