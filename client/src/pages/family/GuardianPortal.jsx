// v2 guardian portal (Mobius Guardian.dc.html Home view; server: spec 05
// GRD-1/GRD-5). Per-child cards, needs-action, notifications — all straight
// off guardianPortalService.getPortal(), same call the pre-redesign page
// used. Wallets stay per-student, never pooled (mirrors the design's own
// "canonical shared records" comment). Notification prefs live on the
// Settings page now (Profile.jsx) rather than a bare <select> here.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import guardianPortalService from '@/services/guardianPortalService';
import { walletStatus } from '@/lib/derive';
import { isoToLocal } from 'mobius-lms';
import '@/css/home.css';

const label = (s) => String(s ?? '').replace(/_/g, ' ');
const day = (iso) => isoToLocal(iso).toFormat('ccc, LLL d');
const time = (iso) => isoToLocal(iso).toFormat('h:mm a');

const Empty = ({ children }) => <div className="hm-empty">{children}</div>;
const Loading = () => <div className="hm-loading">Loading your family portal…</div>;

function Card({ title, children, className = '' }) {
  return (
    <section className={`hm-card ${className}`}>
      {title && (
        <div className="hm-card-head">
          <h2>{title}</h2>
        </div>
      )}
      {children}
    </section>
  );
}

function ChildCard({ child }) {
  const status = walletStatus({ balance: child.balance, committed: child.committed, available: child.available });
  const low = status !== 'healthy';
  const base = `/family/students/${child.student_id}`;

  return (
    <Card className={low ? 'low' : ''} title={`${child.name}${child.is_primary ? ' · primary contact' : ''}`}>
      <div className="hm-wallet">
        <div><span className="hm-kpi-value">{child.balance}</span><span className="hm-kpi-label">Balance</span></div>
        <div><span className="hm-kpi-value">{child.committed}</span><span className="hm-kpi-label">Committed</span></div>
        <div><span className="hm-kpi-value">{child.available}</span><span className="hm-kpi-label">Available</span></div>
      </div>
      {status === 'negative' && <div className="hm-warn-note">Balance is negative — top up to keep booking.</div>}
      {status === 'low' && <div className="hm-warn-note">Available credits are running low.</div>}

      <p className="hm-kpi-label" style={{ marginTop: 14 }}>Next sessions</p>
      {child.next_sessions.length ? (
        <ul className="hm-list">
          {child.next_sessions.map((s) => (
            <li key={s.session_id}>
              <span>{day(s.starts_at)} {time(s.starts_at)} — {s.subject}</span>
            </li>
          ))}
        </ul>
      ) : <Empty>None scheduled</Empty>}

      <p className="hm-kpi-label" style={{ marginTop: 10 }}>
        {child.last_note_at ? `Last note ${isoToLocal(child.last_note_at).toFormat('LLL d')}` : 'No notes yet'}
      </p>

      <div className="hm-card-foot">
        <Link className="hm-btn primary" to={`${base}/schedule`}>Schedule</Link>
        <Link className="hm-btn" to={`${base}/record`}>Progress</Link>
        <Link className="hm-btn" to={`${base}/billing`}>Billing</Link>
        <Link className="hm-btn" to={`${base}/requests`}>Requests</Link>
      </div>
    </Card>
  );
}

function GuardianPortal() {
  const [portal, setPortal] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    guardianPortalService.getPortal().then(setPortal)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load portal'));
  }, []);

  if (error) return <div className="hm-error">{error}</div>;
  if (!portal) return <Loading />;

  const needsActionCount = portal.needs_action.payment_links.length + portal.needs_action.low_balance.length;
  const upcomingCount = portal.children.reduce((sum, c) => sum + c.next_sessions.length, 0);

  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>My children</h1>
        <p>{DateTime.now().toFormat('cccc, LLLL d')}</p>
      </header>

      <div className="hm-kpis">
        <div className="hm-kpi"><span className="hm-kpi-value">{portal.children.length}</span><span className="hm-kpi-label">Linked children</span></div>
        <div className="hm-kpi"><span className="hm-kpi-value">{upcomingCount}</span><span className="hm-kpi-label">Upcoming sessions</span></div>
        <div className={`hm-kpi ${needsActionCount ? 'alert' : ''}`}><span className="hm-kpi-value">{needsActionCount}</span><span className="hm-kpi-label">Needs your attention</span></div>
      </div>

      {portal.children.length ? (
        <div className="hm-children-grid">
          {portal.children.map((c) => <ChildCard key={c.student_id} child={c} />)}
        </div>
      ) : <Card title="My children"><Empty>No linked students yet.</Empty></Card>}

      <div className="hm-grid">
        <Card title="Needs your attention">
          {needsActionCount ? (
            <ul className="hm-list">
              {portal.needs_action.low_balance.map((lb, i) => (
                <li key={`lb-${i}`}>
                  <span>{lb.student_name}: low balance ({lb.balance} credits) for {lb.subject} ({lb.cost}/session)</span>
                </li>
              ))}
              {portal.needs_action.payment_links.map((pl) => (
                <li key={pl.link_id}>
                  <span>Payment link ({pl.amount}) — expires {isoToLocal(pl.expires_at).toFormat('LLL d')}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Nothing needs your attention.</Empty>}
        </Card>

        <Card title="Recent notifications">
          {portal.notifications.length ? (
            <ul className="hm-list">
              {portal.notifications.slice(0, 6).map((n) => (
                <li key={n.notification_id}>
                  <span>{label(n.event_type)}</span>
                  <span className="hm-age">{isoToLocal(n.created_at).toFormat('LLL d')}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>None yet.</Empty>}
        </Card>
      </div>
    </div>
  );
}

export default GuardianPortal;
