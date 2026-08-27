import React from 'react';
import { useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { getActiveSectionLabel, getActiveItemLabel } from '../config/shellNav';
import NotificationBell from './NotificationBell';

const ROUTE_TITLES = {
  '/home': 'Home',
  '/operations/scheduling': 'Scheduling',
  '/operations/schedule': 'Schedule',
  '/operations/attendance': 'Attendance',
  '/operations/classes': 'Classes',
  '/operations/classes/new': 'New class',
  '/operations/requests': 'Requests',
  '/operations/wallets': 'Wallets',
  '/operations/payroll': 'Payroll',
  '/operations/reports': 'Reports',
  '/operations/tasks': 'Task inbox',
  '/operations/roster/students': 'Student roster',
  '/operations/roster/instructors': 'Instructor roster',
  '/operations/roster/staff': 'Staff roster',
  '/operations/roster/classes': 'Class roster',
  '/operations/finance/overview': 'Financial dashboard',
  '/operations/finance/income': 'Income breakdown',
  '/operations/finance/costs': 'Cost breakdown',
  '/operations/finance/payments': 'Payments',
  '/catalog': 'Class catalog',
  '/portal': 'My children',
  '/inbox': 'Inbox',
  '/messages': 'Messages',
  '/instructor/classes': 'My classes',
  '/instructor/feedback': 'Feedback',
  '/instructor/availability': 'Availability',
  '/instructor/pay': 'Pay',
  '/profile': 'Settings',
};

function getPageTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/family/') && pathname.endsWith('/schedule')) return 'My schedule';
  if (pathname.startsWith('/family/') && pathname.endsWith('/classes')) return 'My classes';
  if (pathname.startsWith('/family/') && pathname.endsWith('/record')) return 'My record';
  if (pathname.startsWith('/family/') && pathname.endsWith('/feedback')) return 'Feedback';
  if (pathname.startsWith('/family/') && pathname.endsWith('/book')) return 'Book a session';
  if (pathname.startsWith('/family/') && pathname.endsWith('/billing')) return 'Billing';
  if (pathname.startsWith('/family/') && pathname.endsWith('/requests')) return 'Requests';
  if (/^\/operations\/classes\/[^/]+$/.test(pathname)) return 'Class detail';
  if (/\/sessions\/[^/]+\/attendance$/.test(pathname)) return 'Take attendance';
  return 'Møbius Academy';
}

function Header({ variant = 'default' }) {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/auth/');
  const user = authService.getCurrentUser();

  if (variant === 'auth') {
    return (
      <header className="shell-topbar shell-topbar--auth">
        <div className="shell-topbar-left">
          <img src="/logo.png" alt="Mobius Logo" style={{ height: 40 }} />
        </div>
      </header>
    );
  }

  const role = user?.role;
  const breadcrumb = role ? getActiveSectionLabel(role, user, location.pathname) : '';
  const navLabel = !isAuthRoute && role ? getActiveItemLabel(role, user, location.pathname) : null;
  const title = navLabel || getPageTitle(location.pathname);

  return (
    <header className={`shell-topbar ${isAuthRoute ? 'shell-topbar--auth' : ''}`}>
      <div className="shell-topbar-left">
        {breadcrumb && <div className="shell-breadcrumb">{breadcrumb}</div>}
        <h1 className="shell-title">{title}</h1>
      </div>

      {/* Topbar search removed until it's a real global navigator — a dead
          input here made every page-level search read as a duplicate. */}
      {!isAuthRoute && (
        <div className="shell-topbar-right">
          <NotificationBell />
        </div>
      )}
    </header>
  );
}

export default Header;
