// src/components/ExtendedMenu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function ExtendedMenu({ variant = 'operations' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [prevVariant, setPrevVariant] = useState(variant);
  
  // State for active items and open submenu
  const [activeMain, setActiveMain] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  // Check if we should show the menu based on the current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setIsVisible(false);
    } else if (path.startsWith('/instructor-home') || path.startsWith('/academics')) {
      setIsVisible(true);
    } else if (path.startsWith('/operations')) {
      setIsVisible(true);
    }
  }, [location.pathname]);

  // Reset states when switching between operations/academic sections
  useEffect(() => {
    if (variant !== prevVariant) {
      setOpenSubmenu(null);
      setActiveMain(null);
      setActiveSub(null);
      setPrevVariant(variant);
    }
  }, [variant, prevVariant]);

  // If we're on the home page, don't render the menu
  if (!isVisible) {
    return null;
  }

  // Define menu structures for both variants
  const menuStructures = {
    operations: [
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
      }
    ],
    academic: [
      {
        label: 'Academic Hub',
        icon: 'fa-solid fa-book-open',
        path: '/academics',
        submenu: [
          { label: 'Assignments', path: '/academics/assignments' },
          { label: 'Red Pen Review', path: '/academics/red-pen-review' },
          { label: 'Testing', path: '/academics/testing' },
        ],
      },
      {
        label: 'Performance',
        icon: 'fa-solid fa-chart-line',
        path: '/academics/performance',
        submenu: null,
      }
    ]
  };

  // Get the current menu items based on variant
  const menuItems = menuStructures[variant];

  // Handle main menu item clicks
  const handleMainClick = (e, index, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Clicked menu item:', {
      label: item.label,
      index,
      hasSubmenu: !!item.submenu,
      currentOpenSubmenu: openSubmenu,
      currentActiveMain: activeMain
    });
    
    if (item.submenu) {
      // For items with submenu
      setActiveMain(index);
      setOpenSubmenu(openSubmenu === index ? null : index);
      console.log('Setting submenu state:', { 
        newOpenSubmenu: openSubmenu === index ? null : index,
        newActiveMain: index 
      });
    } else {
      // For items without submenu
      navigate(item.path);
      setActiveMain(index);
      setOpenSubmenu(null); // Close any open submenu
      setActiveSub(null);   // Clear active submenu item
    }
  };

  // Handle submenu item clicks
  const handleSubClick = (e, mainIndex, subIndex, path) => {
    e.preventDefault();
    e.stopPropagation();
    
    navigate(path);
    setActiveSub(subIndex);
    setActiveMain(mainIndex);
    setOpenSubmenu(mainIndex); // Keep the parent submenu open
  };

  // Helper function to determine if a menu item is active
  const isMenuItemActive = (index, item) => {
    if (item.submenu) {
      // Menu item with submenu is active if it's open or has an active submenu item
      return openSubmenu === index || (activeMain === index && activeSub !== null);
    } else {
      // Menu item without submenu is active if it's the current active main item
      // and there's no active submenu item
      return activeMain === index && activeSub === null;
    }
  };

  // Helper function to determine if a submenu item is active
  const isSubmenuItemActive = (mainIndex, subIndex) => {
    return activeMain === mainIndex && activeSub === subIndex;
  };

  return (
    <div className={`navbar-extended ${variant}-menu ${!isVisible ? 'hidden' : ''}`}>
      <div className="menu">
        <h3 className="menu-title">{variant === 'operations' ? 'Operations' : 'Academic'}</h3>
        <div className="menu-items">
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className={`menu-item ${item.submenu ? 'has-submenu' : ''}`}
            >
              <button
                type="button"
                onClick={(e) => handleMainClick(e, index, item)}
                className={`menu-item-btn ${isMenuItemActive(index, item) ? 'active' : ''}`}
                aria-expanded={item.submenu ? openSubmenu === index : undefined}
              >
                <div className="menu-item-content">
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </div>
                {item.submenu && (
                  <i className={`submenu-arrow fa-solid fa-chevron-${openSubmenu === index ? 'up' : 'down'}`} />
                )}
              </button>
              
              {item.submenu && (
                <AnimatePresence>
                  {openSubmenu === index && (
                    <motion.div
                      className="sub-menu-wrapper"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="submenu-content">
                        <div className="sub-menu">
                          {item.submenu.map((subItem, subIndex) => (
                            <button
                              key={subIndex}
                              type="button"
                              onClick={(e) => handleSubClick(e, index, subIndex, subItem.path)}
                              className={`menu-item-btn ${isSubmenuItemActive(index, subIndex) ? 'active' : ''}`}
                            >
                              <span>{subItem.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExtendedMenu;