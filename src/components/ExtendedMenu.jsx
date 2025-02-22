 // src/components/ExtendedMenu.jsx
import React, { useState } from 'react';

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
    e.preventDefault(); // Prevent the default anchor navigation
    // If clicking the same item that has a submenu, toggle its open state.
    if (activeMain === index && hasSubmenu) {
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
    console.log("Submenu item clicked:", subIndex);
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
              {item.submenu && activeMain === index && submenuOpen && (
                <ul className="sub-menu">
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
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ExtendedMenu;

