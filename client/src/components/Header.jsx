import React from 'react';
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  // Function to get the title based on the current path
  const getPageTitle = () => {
    const path = location.pathname;
    
    // Map routes to their titles
    const routeTitles = {
      '/academics/InstructorHome': 'Instructor Dashboard',
      '/academics/assignments': 'Assignments',
      '/academics/red-pen-review': 'Red Pen Review',
      '/academics/testing': 'Testing',
      '/academics/performance': 'Performance',
      '/operations/scheduling': 'MCal Schedule',
      '/operations/roster/students': 'Student Roster',
      '/operations/roster/instructors': 'Instructor Roster',
      '/operations/roster/staff': 'Staff Roster',
      '/operations/finance/overview': 'Financial Overview',
      '/operations/finance/income': 'Income Breakdown',
      '/operations/finance/costs': 'Cost Breakdown'
    };

    return routeTitles[path] || 'Møbius Academy'; // Default title if route not found
  };

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo">
        <img
          src="/logo.png"
          alt="Mobius Logo"
          className="logo-img"
        />
      </div>

      {/* Title Section */}
      <div className="title-section">
        <h1 className="title">{getPageTitle()}</h1>

        {/* Search Bar */}
        <div className="search-bar">
          <input type="text" placeholder="Search" />
        </div>

        {/* Icon Section */}
        <div className="icon-section">
          <ul className="icons">
            <li>
              <button className="icon-button">
                <i className="fa-regular fa-message"></i>
              </button>
            </li>
            <li>
              <button className="icon-button">
                <i className="fa-regular fa-bell"></i>
              </button>
            </li>
            <li>
              <button className="icon-button">
                <i className="fas fa-shopping-cart"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Header;