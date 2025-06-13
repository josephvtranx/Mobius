// src/components/ExtendedMenu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../services/authService';

function ExtendedMenu({ variant = 'operations' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [prevVariant, setPrevVariant] = useState(variant);
  const user = authService.getCurrentUser();
  const isStaff = user?.role === 'staff';
  
  // State for active items and open submenus (now an array to track multiple open submenus)
  const [activeMain, setActiveMain] = useState(null);
  const [openSubmenus, setOpenSubmenus] = useState([]);
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
      setOpenSubmenus([]);
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
      ...(isStaff ? [
      {
        label: 'Scheduling',
        icon: 'fa-regular fa-calendar',
        path: '/operations/scheduling',
        submenu: null,
        }
      ] : [
        {
          label: 'Schedule',
          icon: 'fa-regular fa-calendar',
          path: '/operations/schedule',
          submenu: null,
        }
      ]),
      {
        label: 'Roster',
        icon: 'fa-solid fa-user-group',
        path: '/operations/roster',
        submenu: [
          { label: 'Student Roster', path: '/operations/roster/students' },
          { label: 'Instructor Roster', path: '/operations/roster/instructors' },
          { label: 'Staff Roster', path: '/operations/roster/staff' },
          { label: 'Class Roster', path: '/operations/roster/classes' },
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
        label: 'Instructor Home',
        icon: 'fa-solid fa-chart-line',
        path: '/academics/InstructorHome',
        submenu: null,
      },
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
    
    if (item.submenu) {
      // Toggle this submenu's open state
      setOpenSubmenus(prev => {
        const isCurrentlyOpen = prev.includes(index);
        if (isCurrentlyOpen) {
          return prev.filter(i => i !== index);
        } else {
          return [...prev, index];
        }
      });
      setActiveMain(index);
    } else {
      // For items without submenu
      navigate(item.path);
      setActiveMain(index);
      setActiveSub(null);
    }
  };

  // Handle submenu item clicks
  const handleSubClick = (e, mainIndex, subIndex, path) => {
    e.preventDefault();
    e.stopPropagation();
    
    navigate(path);
    setActiveSub(subIndex);
    setActiveMain(mainIndex);
  };

  // Helper function to determine if a menu item is active
  const isMenuItemActive = (index, item) => {
    if (item.submenu) {
      // Menu item with submenu is active if it's open or has an active submenu item
      return openSubmenus.includes(index) || (activeMain === index && activeSub !== null);
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
                aria-expanded={item.submenu ? openSubmenus.includes(index) : undefined}
              >
                <div className="menu-item-content">
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </div>
                {item.submenu && (
                  <i className={`submenu-arrow fa-solid fa-chevron-${openSubmenus.includes(index) ? 'up' : 'down'}`} />
                )}
              </button>
              
              {item.submenu && (
                <AnimatePresence>
                  {openSubmenus.includes(index) && (
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