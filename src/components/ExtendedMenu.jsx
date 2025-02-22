// src/components/ExtendedMenu.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ExtendedMenu() {
  // Define your menu structure.
  const menuItems = [
    {
      label: 'Schedueling',
      icon: 'fa-regular fa-calendar',
      link: '#',
      submenu: null,
    },
    {
      label: 'Roster',
      icon: 'fa-solid fa-user-group',
      link: '#',
      submenu: [
        { label: 'Student Roster', link: '#' },
        { label: 'Instrutor Roster', link: '#' },
        { label: 'Staff Roster', link: '#' },
      ],
    },
    {
      label: 'Financial Dashboard',
      icon: 'fa-solid fa-dollar-sign',
      link: '#',
      submenu: [
        { label: 'Overview', link: '#' },
        { label: 'Income Breakdown', link: '#' },
        { label: 'Cost Breakdown', link: '#' },
        { label: 'Profitability Insights', link: '#' },
        { label: 'Forecasting', link: '#' },
      ],
    },
    {
      label: 'Instruture Browser',
      icon: 'fa-solid fa-user-group',
      link: '#',
      submenu: null,
    },
  ];

  // State to track the active main menu item (null initially means no active item)
  const [activeMain, setActiveMain] = useState(null);
  // State to track whether the active main item's submenu is open.
  const [submenuOpen, setSubmenuOpen] = useState(false);
  // State for the active submenu item (if any)
  const [activeSub, setActiveSub] = useState(null);

  // Handle main menu item clicks.
  const handleMainClick = (index, hasSubmenu, e) => {
    e.preventDefault(); // Prevent default anchor navigation
    if (activeMain === index && hasSubmenu) {
      // Toggle submenu if clicking the same item
      setSubmenuOpen(!submenuOpen);
    } else {
      setActiveMain(index);
      setSubmenuOpen(hasSubmenu ? true : false);
      setActiveSub(null);
    }
  };

  // Handle submenu item clicks.
  const handleSubClick = (subIndex, e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the main item handler from firing
    setActiveSub(subIndex);
  };

  return (
    <div className="navbar-extended">
      <div className="menu">
        <p className="menu-title">Operations</p>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className={activeMain === index ? 'active' : ''}>
              <a
                href={item.link}
                onClick={(e) => handleMainClick(index, !!item.submenu, e)}
              >
                <i className={item.icon}></i>
                <span className="text">{item.label}</span>
              </a>
              {item.submenu && (
                <AnimatePresence>
                  {activeMain === index && submenuOpen && (
                    <motion.div
                      className="sub-menu-wrapper"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="submenu-content">
                        <ul>
                          {item.submenu.map((subItem, subIndex) => (
                            <li
                              key={subIndex}
                              className={activeSub === subIndex ? 'active' : ''}
                            >
                              <a
                                href={subItem.link}
                                onClick={(e) => handleSubClick(subIndex, e)}
                              >
                                <span className="text">{subItem.label}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ExtendedMenu;
