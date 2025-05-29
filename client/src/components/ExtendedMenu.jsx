// src/components/ExtendedMenu.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function ExtendedMenu() {
  const location = useLocation();
  
  // Define your menu structure with proper routes
  const menuItems = [
    {
      label: 'Scheduling',
      icon: 'fa-regular fa-calendar',
      path: '/operations/scheduling',
      submenu: null,
    },
    {
      label: 'Roster',
      icon: 'fa-solid fa-user-group',
      path: '/operations/roster',
      submenu: [
        { label: 'Student Roster', path: '/operations/roster/students' },
        { label: 'Instructor Roster', path: '/operations/roster/instructors' },
        { label: 'Staff Roster', path: '/operations/roster/staff' },
      ],
    },
    {
      label: 'Financial Dashboard',
      icon: 'fa-solid fa-dollar-sign',
      path: '/operations/finance',
      submenu: [
        { label: 'Overview', path: '/operations/finance/overview' },
        { label: 'Income Breakdown', path: '/operations/finance/income' },
        { label: 'Cost Breakdown', path: '/operations/finance/costs' },
      ],
    },
  ];

  // State management
  const [activeMain, setActiveMain] = useState(null);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [activeSub, setActiveSub] = useState(null);

  // Update active states based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find matching main menu item
    const mainIndex = menuItems.findIndex(item => 
      currentPath.startsWith(item.path)
    );
    
    if (mainIndex !== -1) {
      setActiveMain(mainIndex);
      
      // Check for submenu match
      const item = menuItems[mainIndex];
      if (item.submenu) {
        const subIndex = item.submenu.findIndex(subItem => 
          currentPath === subItem.path
        );
        if (subIndex !== -1) {
          setSubmenuOpen(true);
          setActiveSub(subIndex);
        }
      }
    }
  }, [location.pathname]);

  // Handle main menu item clicks
  const handleMainClick = (index, hasSubmenu, e) => {
    if (hasSubmenu) {
      e.preventDefault(); // Prevent navigation for items with submenu
      if (activeMain === index) {
        setSubmenuOpen(!submenuOpen); // Toggle submenu
      } else {
        setActiveMain(index);
        setSubmenuOpen(true);
        setActiveSub(null);
      }
    } else {
      setActiveMain(index);
      setSubmenuOpen(false);
      setActiveSub(null);
    }
  };

  // Handle submenu item clicks
  const handleSubClick = (mainIndex, subIndex) => {
    setActiveMain(mainIndex);
    setActiveSub(subIndex);
    // Keep submenu open when item is selected
    setSubmenuOpen(true);
  };

  return (
    <div className="navbar-extended">
      <div className="menu">
        <p className="menu-title">Operations</p>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className={activeMain === index ? 'active' : ''}>
              <Link
                to={item.submenu ? '#' : item.path}
                onClick={(e) => handleMainClick(index, !!item.submenu, e)}
              >
                <i className={item.icon}></i>
                <span className="text">{item.label}</span>
              </Link>
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
                        <ul className="sub-menu">
                          {item.submenu.map((subItem, subIndex) => (
                            <li
                              key={subIndex}
                              className={activeSub === subIndex ? 'active' : ''}
                            >
                              <Link
                                to={subItem.path}
                                onClick={() => handleSubClick(index, subIndex)}
                              >
                                <span className="text">{subItem.label}</span>
                              </Link>
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
