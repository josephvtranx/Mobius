// SideNav.jsx — shared shell sidebar (wordmark + icon rail + menu panel + profile card)
// Parameterized by role: teal (student), mauve (guardian), indigo (instructor), orange (staff).
import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import staffTaskService from '../services/staffTaskService';
import messageService from '../services/messageService';
import ProfileCard from './ProfileCard';
import { getShellNav, sectionMatchesPath } from '../config/shellNav';

function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const role = user?.role;

  const sections = useMemo(() => getShellNav(role, user), [role, user?.user_id]);

  const initialSectionIndex = Math.max(
    0,
    sections.findIndex((s) => sectionMatchesPath(s, location.pathname))
  );
  const [activeIndex, setActiveIndex] = useState(initialSectionIndex === -1 ? 0 : initialSectionIndex);
  const [openChildren, setOpenChildren] = useState(null);
  const [taskCount, setTaskCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const matchIndex = sections.findIndex((s) => sectionMatchesPath(s, location.pathname));
    if (matchIndex !== -1) setActiveIndex(matchIndex);
  }, [location.pathname, sections]);

  // Live open-task count for the staff "Task inbox" badge. Refetched on
  // navigation and on a 'staff-tasks-changed' event (dispatched by the
  // Task inbox when a task is resolved) so the badge stays in sync without
  // a full reload.
  useEffect(() => {
    if (role !== 'staff') return undefined;
    const refresh = () => staffTaskService.getOpenCount().then(setTaskCount).catch(() => {});
    refresh();
    window.addEventListener('staff-tasks-changed', refresh);
    return () => window.removeEventListener('staff-tasks-changed', refresh);
  }, [role, location.pathname]);

  // Unread-message count for nav items flagged unreadBadge (design: red count
  // pill on the Inbox rail tile AND the Messages menu item). Polled at the
  // same cadence Messages uses; opening a conversation clears unread
  // server-side, so the badge catches up on the next poll or navigation.
  const wantsUnread = sections.some((s) => s.items.some((it) => it.unreadBadge));
  useEffect(() => {
    if (!wantsUnread) return undefined;
    const refresh = () =>
      messageService.getConversations()
        .then((convos) => setUnreadCount((convos || []).filter((c) => c.unread).length))
        .catch(() => {});
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, [wantsUnread, location.pathname]);

  if (!role || sections.length === 0) return null;

  const activeSection = sections[activeIndex];
  const railBadgeFor = (section) =>
    section.items.some((it) => it.unreadBadge) && unreadCount > 0 ? unreadCount : 0;

  const handleRailClick = (index) => {
    setActiveIndex(index);
    const firstItem = sections[index].items[0];
    if (firstItem) navigate(firstItem.path);
  };

  const isItemActive = (item) =>
    location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  const isChildActive = (child) => location.pathname === child.path;

  return (
    <aside className="shell-sidebar">
      <div className="shell-wordmark">
        möb<i className="fa-solid fa-pen-ruler shell-wordmark-icon" aria-hidden="true"></i>us
      </div>

      <div className="shell-body">
        <nav className="shell-rail" aria-label="Sections">
          {/* The first section (Home/Overview) always stands alone in its
              own pill; every other section is grouped together in a
              second pill below it — matches the design handoff's rail
              across all four role apps, rather than one shared pill. */}
          <div className="shell-rail-pill">
            {sections.slice(0, 1).map((section, index) => (
              <button
                key={section.label}
                type="button"
                className={`shell-rail-tile ${index === activeIndex ? 'active' : ''}`}
                aria-label={section.label}
                aria-current={index === activeIndex ? 'true' : undefined}
                title={section.label}
                onClick={() => handleRailClick(index)}
              >
                <i className={section.icon} aria-hidden="true"></i>
              </button>
            ))}
          </div>
          {sections.length > 1 && (
            <div className="shell-rail-pill">
              {sections.slice(1).map((section, i) => {
                const index = i + 1;
                const railBadge = railBadgeFor(section);
                return (
                  <button
                    key={section.label}
                    type="button"
                    className={`shell-rail-tile ${index === activeIndex ? 'active' : ''}`}
                    aria-label={section.label}
                    aria-current={index === activeIndex ? 'true' : undefined}
                    title={section.label}
                    onClick={() => handleRailClick(index)}
                  >
                    <i className={section.icon} aria-hidden="true"></i>
                    {railBadge > 0 && <span className="shell-rail-badge">{railBadge}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        <div className="shell-menu">
          <h3 className="shell-menu-header">
            {activeSection.headerIcon !== false && <i className={activeSection.icon} aria-hidden="true"></i>}
            {activeSection.label}
          </h3>
          <div className="shell-menu-items">
            {activeSection.items.map((item) => (
              <div key={item.path} className="shell-menu-group">
                {item.children ? (
                  <>
                    {/* Parent rows never take the active pill — the chevron and
                        the active child's pill carry the state (highlighting the
                        parent bolds the label and can wrap it oddly). */}
                    <button
                      type="button"
                      className="shell-menu-item"
                      aria-expanded={openChildren === item.path}
                      onClick={() =>
                        setOpenChildren((prev) => (prev === item.path ? null : item.path))
                      }
                    >
                      <i className={item.icon} aria-hidden="true"></i>
                      <span>{item.label}</span>
                      <i
                        className={`shell-menu-chevron fa-solid fa-chevron-${openChildren === item.path ? 'up' : 'down'}`}
                        aria-hidden="true"
                      ></i>
                    </button>
                    {openChildren === item.path && (
                      <div className="shell-menu-children">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={`shell-menu-item shell-menu-item--child ${isChildActive(child) ? 'active' : ''}`}
                          >
                            <span>{child.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={`shell-menu-item ${isItemActive(item) ? 'active' : ''}`}
                  >
                    <i className={item.icon} aria-hidden="true"></i>
                    <span>{item.label}</span>
                    {(() => {
                      const badge = item.unreadBadge ? unreadCount
                        : item.path === '/operations/tasks' ? taskCount
                        : item.badge;
                      return typeof badge === 'number' && badge > 0
                        ? <span className="shell-menu-badge">{badge}</span>
                        : null;
                    })()}
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProfileCard />
    </aside>
  );
}

export default SideNav;
