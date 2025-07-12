import React from 'react';
import { useLocation } from 'react-router-dom';
import authService from '../services/authService';

function Header({ variant = 'default' }) {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/auth/');
  const user = authService.getCurrentUser();
  const isStaff = user?.role === 'staff';

  // Function to get the title based on the current path
  const getPageTitle = () => {
    const path = location.pathname;
    
    // Map routes to their titles
    const routeTitles = {
      '/home': 'Home',
      '/academics/InstructorHome': 'Instructor Dashboard',
      '/academics/assignments': 'Assignments',
      '/academics/red-pen-review': 'Red Pen Review',
      '/academics/testing': 'Testing',
      '/academics/performance': 'Performance',
      '/operations/scheduling': 'MCal Scheduling',
      '/operations/schedule': 'MCal Schedule',
      '/operations/roster/students': 'Student Roster',
      '/operations/roster/instructors': 'Instructor Roster',
      '/operations/roster/staff': 'Staff Roster',
      '/operations/roster/classes': 'Class Roster',
      '/operations/finance/overview': 'Financial Overview',
      '/operations/finance/income': 'Income Breakdown',
      '/operations/finance/costs': 'Cost Breakdown',
      '/operations/finance/payments': 'Payments',
      '/profile': 'Profile Settings',
    };

    return routeTitles[path] || 'Møbius Academy';
  };

  // Determine title color based on variant
  const titleColorClass = variant === 'teal' ? 'title--teal' : 'title--orange';

  if (variant === 'auth') {
    return (
      <header
        className="header header--auth"
        style={{
          width: '100%',
          background: '#eaf9fc',
          padding: '24px 0 16px 0',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 40 }}>
          <img src="/logo.png" alt="Mobius Logo" style={{ height: 40 }} />
        </div>
      </header>
    );
  }

  // Default header (existing app header)
  return (
    <header className={`header ${isAuthRoute ? 'header--auth' : ''}`}>
      {/* Logo - Always show */}
      <div className="logo">
        <img
          src="/logo.png"
          alt="Mobius Logo"
          className="logo-img"
        />
      </div>

      {/* Title Section - Show differently based on route type */}
      {isAuthRoute ? (
        <div className="auth-title">
          <h1>{getPageTitle()}</h1>
        </div>
      ) : (
        <div className="title-section">
          <h1 className={`title ${titleColorClass}`}>{getPageTitle()}</h1>

          <div className="search-bar">
            <input type="text" placeholder="Search" />
          </div>

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
      )}
    </header>
  );
}

export default Header;