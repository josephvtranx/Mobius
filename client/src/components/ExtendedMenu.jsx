// src/components/ExtendedMenu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function ExtendedMenu({ variant = 'operations' }) {
  console.log('ExtendedMenu rendering with variant:', variant); // Debug log

  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  
  // Check if we should show the menu based on the current route
  useEffect(() => {
    const path = location.pathname;
    console.log('Current path:', path); // Debug log
    if (path === '/') {
      setIsVisible(false);
    } else if (path.startsWith('/instructor-home') || path.startsWith('/academics')) {
      setIsVisible(true);
    } else if (path.startsWith('/operations')) {
      setIsVisible(true);
    }
  }, [location.pathname]);

  // If we're on the home page, don't render the menu
  if (!isVisible) {
    console.log('Menu is not visible'); // Debug log
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
      },
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
    },
    ],
  };

  // Get the current menu items based on variant
  const menuItems = menuStructures[variant];
  console.log('Current menu items:', menuItems); // Debug log
  
  // State for active items and open submenu
  const [activeMain, setActiveMain] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
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
          setOpenSubmenu(mainIndex);
          setActiveSub(subIndex);
        }
      }
    }
  }, [location.pathname, menuItems]);

  // Handle main menu item clicks
  const handleMainClick = (e, index, item) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (item.submenu) {
      // Only toggle submenu if it has a submenu
      setOpenSubmenu(openSubmenu === index ? null : index);
    } else {
      // Navigate only if it doesn't have a submenu
      navigate(item.path);
    }
      setActiveMain(index);
    if (!item.submenu) {
      setActiveSub(null);
    }
  };

  // Handle submenu item clicks
  const handleSubClick = (e, mainIndex, subIndex, path) => {
    e.preventDefault();
    e.stopPropagation();
    
    navigate(path);
    setActiveMain(mainIndex);
    setActiveSub(subIndex);
  };

  return (
    <div 
      className={`navbar-extended ${variant}-menu ${!isVisible ? 'hidden' : ''}`}
      onClick={(e) => {
        console.log('Navbar extended clicked');
        e.stopPropagation();
      }}
    >
      <div 
        className="menu"
        onClick={(e) => {
          console.log('Menu container clicked');
          e.stopPropagation();
        }}
      >
        <h3 className="menu-title">{variant === 'operations' ? 'Operations' : 'Academic'}</h3>
        <div 
          className="menu-items"
          onClick={(e) => {
            console.log('Menu items container clicked');
            e.stopPropagation();
          }}
        >
          {menuItems.map((item, index) => (
            <div 
              key={index} 
              className={`menu-item ${item.submenu ? 'has-submenu' : ''}`}
              onClick={(e) => {
                console.log('Menu item container clicked:', index);
                e.stopPropagation();
              }}
            >
              <button
                type="button"
                onClick={(e) => handleMainClick(e, index, item)}
                className={`menu-item-btn ${activeMain === index ? 'active' : ''}`}
                aria-expanded={item.submenu ? openSubmenu === index : undefined}
              >
                <div 
                  className="menu-item-content"
                  onClick={(e) => {
                    console.log('Menu item content clicked');
                    e.stopPropagation();
                  }}
              >
                <i className={item.icon}></i>
                  <span>{item.label}</span>
                </div>
                {item.submenu && (
                  <i 
                    className={`submenu-arrow fa-solid fa-chevron-${openSubmenu === index ? 'up' : 'down'}`}
                    onClick={(e) => {
                      console.log('Submenu arrow clicked');
                      e.stopPropagation();
                    }}
                  />
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
                      onClick={(e) => {
                        console.log('Submenu wrapper clicked');
                        e.stopPropagation();
                      }}
                    >
                      <div 
                        className="submenu-content"
                        onClick={(e) => {
                          console.log('Submenu content clicked');
                          e.stopPropagation();
                        }}
                      >
                        <div 
                          className="sub-menu"
                          onClick={(e) => {
                            console.log('Sub-menu clicked');
                            e.stopPropagation();
                          }}
                        >
                          {item.submenu.map((subItem, subIndex) => (
                            <button
                              key={subIndex}
                              type="button"
                              onClick={(e) => handleSubClick(e, index, subIndex, subItem.path)}
                              className={`menu-item-btn ${activeSub === subIndex && activeMain === index ? 'active' : ''}`}
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
