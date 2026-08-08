// Role -> shared-shell theme + navigation config.
// Sections mirror the design handoff's per-app nav groupings (README.md ->
// "Student app" / "Instructor app" / "Staff app" nav lines). Paths point at
// real routes where they exist; a few point at routes not built yet
// (later tasks fill those in) — App.jsx's catch-all sends unbuilt paths
// back to /home rather than a blank screen.

export const ROLE_THEME = {
  student: 'teal',
  guardian: 'mauve',
  instructor: 'indigo',
  staff: 'orange',
};

export function getShellNav(role, user) {
  const uid = user?.user_id;

  switch (role) {
    case 'student':
      return [
        {
          label: 'Learn',
          icon: 'fa-solid fa-book-open',
          items: [
            { label: 'Home', icon: 'fa-solid fa-house', path: '/home' },
            { label: 'My schedule', icon: 'fa-regular fa-calendar', path: `/family/students/${uid}/schedule` },
            { label: 'My classes', icon: 'fa-solid fa-chalkboard', path: `/family/students/${uid}/classes` },
            { label: 'My wallet', icon: 'fa-solid fa-wallet', path: `/family/students/${uid}/billing` },
            { label: 'Class catalog', icon: 'fa-solid fa-store', path: '/catalog' },
          ],
        },
        {
          label: 'Stay in touch',
          icon: 'fa-regular fa-comments',
          items: [
            { label: 'Messages', icon: 'fa-regular fa-message', path: '/messages' },
            // No separate feedback data source exists — StudentRecord already
            // shows instructor notes inline with the record timeline, so
            // "Feedback" points at the same real page rather than a dead link.
            { label: 'Feedback', icon: 'fa-regular fa-star', path: `/family/students/${uid}/record` },
          ],
        },
        {
          label: 'Settings',
          icon: 'fa-solid fa-gear',
          items: [
            { label: 'Settings', icon: 'fa-solid fa-gear', path: '/profile' },
          ],
        },
      ];

    case 'guardian':
      // Schedule/Progress/Billing/Requests are per-child, and shellNav has no
      // notion of "currently selected child" — those live as links on each
      // child's card on the Home page (portal.children[i]) rather than as
      // sidebar items, same pattern GuardianPortal.jsx already used pre-redesign.
      return [
        {
          label: 'Overview',
          icon: 'fa-solid fa-compass',
          items: [
            { label: 'My children', icon: 'fa-solid fa-house', path: '/portal' },
            { label: 'Class catalog', icon: 'fa-solid fa-store', path: '/catalog' },
          ],
        },
        {
          label: 'Inbox',
          icon: 'fa-regular fa-comments',
          items: [
            { label: 'Messages', icon: 'fa-regular fa-message', path: '/messages' },
          ],
        },
        {
          label: 'Settings',
          icon: 'fa-solid fa-gear',
          items: [
            { label: 'Settings', icon: 'fa-solid fa-gear', path: '/profile' },
          ],
        },
      ];

    case 'instructor':
      return [
        {
          label: 'Overview',
          icon: 'fa-solid fa-compass',
          items: [
            { label: 'Today', icon: 'fa-solid fa-house', path: '/home' },
          ],
        },
        {
          label: 'Teach',
          icon: 'fa-solid fa-chalkboard-user',
          items: [
            { label: 'My schedule', icon: 'fa-regular fa-calendar', path: '/operations/schedule' },
            { label: 'My classes', icon: 'fa-solid fa-chalkboard', path: '/instructor/classes' },
            { label: 'Inbox', icon: 'fa-solid fa-inbox', path: '/inbox' },
            { label: 'Feedback', icon: 'fa-regular fa-star', path: '/instructor/feedback' },
          ],
        },
        {
          label: 'Me',
          icon: 'fa-regular fa-id-badge',
          items: [
            { label: 'Messages', icon: 'fa-regular fa-message', path: '/messages' },
            { label: 'Availability', icon: 'fa-regular fa-clock', path: '/instructor/availability' },
            { label: 'Pay', icon: 'fa-solid fa-sack-dollar', path: '/instructor/pay' },
          ],
        },
      ];

    case 'staff':
      return [
        {
          label: 'Overview',
          icon: 'fa-solid fa-compass',
          items: [
            { label: 'Dashboard', icon: 'fa-solid fa-house', path: '/home' },
            { label: 'Task inbox', icon: 'fa-solid fa-inbox', path: '/operations/tasks' },
            { label: 'Messages', icon: 'fa-regular fa-message', path: '/messages' },
            { label: 'Settings', icon: 'fa-solid fa-gear', path: '/profile' },
          ],
        },
        {
          label: 'Operations',
          icon: 'fa-solid fa-wrench',
          items: [
            { label: 'Scheduling', icon: 'fa-regular fa-calendar', path: '/operations/scheduling' },
            { label: 'Attendance', icon: 'fa-solid fa-clipboard-check', path: '/operations/attendance' },
            {
              label: 'Roster',
              icon: 'fa-solid fa-user-group',
              path: '/operations/roster/students',
              children: [
                { label: 'Student roster', path: '/operations/roster/students' },
                { label: 'Instructor roster', path: '/operations/roster/instructors' },
                { label: 'Staff roster', path: '/operations/roster/staff' },
                { label: 'Class roster', path: '/operations/roster/classes' },
              ],
            },
            { label: 'Classes', icon: 'fa-solid fa-chalkboard', path: '/operations/classes' },
            { label: 'Requests', icon: 'fa-solid fa-envelope-open-text', path: '/operations/requests' },
          ],
        },
        {
          label: 'Finance',
          icon: 'fa-solid fa-sack-dollar',
          items: [
            {
              label: 'Financial dashboard',
              icon: 'fa-solid fa-dollar-sign',
              path: '/operations/finance/overview',
              children: [
                { label: 'Overview', path: '/operations/finance/overview' },
                { label: 'Income breakdown', path: '/operations/finance/income' },
                { label: 'Cost breakdown', path: '/operations/finance/costs' },
                { label: 'Payments', path: '/operations/finance/payments' },
              ],
            },
            { label: 'Wallets', icon: 'fa-solid fa-wallet', path: '/operations/wallets' },
            { label: 'Payroll', icon: 'fa-regular fa-money-bill-1', path: '/operations/payroll' },
            { label: 'Reports', icon: 'fa-solid fa-chart-line', path: '/operations/reports' },
          ],
        },
      ];

    default:
      return [];
  }
}

export function sectionMatchesPath(section, pathname) {
  return section.items.some((item) =>
    pathname === item.path ||
    pathname.startsWith(item.path + '/') ||
    (item.children && item.children.some((c) => pathname === c.path || pathname.startsWith(c.path + '/')))
  );
}

export function getActiveSectionLabel(role, user, pathname) {
  const sections = getShellNav(role, user);
  const match = sections.find((s) => sectionMatchesPath(s, pathname));
  return match ? match.label : sections[0]?.label ?? '';
}

// The page title should say whatever this role's own sidebar calls the
// page (staff's /home is "Dashboard", instructor's is "Today", student's
// is "Home") rather than one hardcoded string per route — Header.jsx used
// to hardcode '/home' -> 'Home' for every role, which drifted from the
// sidebar label as soon as a role used a different word for the same page.
export function getActiveItemLabel(role, user, pathname) {
  const sections = getShellNav(role, user);
  for (const section of sections) {
    for (const item of section.items) {
      if (pathname === item.path) return item.label;
      if (item.children) {
        const child = item.children.find((c) => pathname === c.path);
        if (child) return child.label;
      }
    }
  }
  for (const section of sections) {
    for (const item of section.items) {
      if (pathname.startsWith(item.path + '/')) return item.label;
      if (item.children) {
        const child = item.children.find((c) => pathname.startsWith(c.path + '/'));
        if (child) return child.label;
      }
    }
  }
  return null;
}
