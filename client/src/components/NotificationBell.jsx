// Header notification bell + in-app feed dropdown. Backed by
// /api/notifications (notification_log channel='in_app'). Shows an unread
// count badge, polls it every 30s, and marks everything read when opened.
import { useEffect, useRef, useState } from 'react';
import notificationService from '../services/notificationService';
import { isoToLocal } from 'mobius-lms';

const POLL_MS = 30000;

// event_type -> human line. payload carries the specifics; keep these
// terse and safe if a field is missing.
function describe(n) {
  const p = n.payload || {};
  switch (n.event_type) {
    case 'wallet_credited': return `Your wallet was credited${p.amount ? ` (+${p.amount})` : ''}.`;
    case 'low_balance': return 'Your credit balance is running low.';
    case 'balance_negative': return 'Your balance has gone negative — please top up.';
    case 'price_change': return 'A class price was updated.';
    case 'schedule_changed': return 'A class schedule was changed.';
    case 'session_cancelled_by_instructor': return 'A session was cancelled by the instructor.';
    case 'class_terminated': return 'A class was terminated.';
    case 'join_request_approved': return 'A join request was approved.';
    case 'join_request_rejected': return 'A join request was declined.';
    case 'leave_request_approved': return 'A leave request was approved.';
    case 'leave_request_rejected': return 'A leave request was declined.';
    default: return String(n.event_type || 'Notification').replace(/_/g, ' ');
  }
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const refresh = () => notificationService.getUnreadCount().then(setUnread).catch(() => {});
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        const { notifications } = await notificationService.getNotifications();
        setItems(notifications);
        if (notifications.some((n) => !n.read)) {
          await notificationService.markRead();
          setUnread(0);
        }
      } catch {
        setItems([]);
      }
    }
  };

  return (
    <div className="shell-bell-wrap" ref={ref} style={{ position: 'relative' }}>
      <button className="shell-bell" aria-label="Notifications" type="button" onClick={toggle}>
        <i className="fa-regular fa-bell" aria-hidden="true"></i>
        {unread > 0 && <span className="shell-bell-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="shell-notif-pop" role="menu">
          <div className="shell-notif-head">Notifications</div>
          <div className="shell-notif-list">
            {items === null && <div className="shell-notif-empty">Loading…</div>}
            {items && items.length === 0 && <div className="shell-notif-empty">You're all caught up.</div>}
            {items && items.map((n) => (
              <div key={n.notification_id} className={`shell-notif-row ${n.read ? '' : 'unread'}`}>
                <div className="shell-notif-text">{describe(n)}</div>
                <div className="shell-notif-time">{isoToLocal(n.created_at).toRelative()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
