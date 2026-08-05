// SideNav.jsx — shared shell sidebar (wordmark + icon rail + menu panel + profile card)
// Parameterized by role: teal (student/guardian), indigo (instructor), orange (staff).
import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
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

  useEffect(() => {
    const matchIndex = sections.findIndex((s) => sectionMatchesPath(s, location.pathname));
    if (matchIndex !== -1) setActiveIndex(matchIndex);
  }, [location.pathname, sections]);

  if (!role || sections.length === 0) return null;

  const activeSection = sections[activeIndex];

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
          <div className="shell-rail-pill">
            {sections.map((section, index) => (
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
        </nav>

        <div className="shell-menu">
          <h3 className="shell-menu-header">{activeSection.label}</h3>
          <div className="shell-menu-items">
            {activeSection.items.map((item) => (
              <div key={item.path} className="shell-menu-group">
                {item.children ? (
                  <>
                    <button
                      type="button"
                      className={`shell-menu-item ${isItemActive(item) ? 'active' : ''}`}
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
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="shell-menu-badge">{item.badge}</span>
                    )}
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
