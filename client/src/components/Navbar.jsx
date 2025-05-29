// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ variant = 'teal' }) {
  const location = useLocation();
  const [activeButton, setActiveButton] = useState('none');
  const [compassActive, setCompassActive] = useState(false);

  // Update active states based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveButton('none');
      setCompassActive(true);
    } else if (path.startsWith('/instructor-home')) {
      setCompassActive(false);
      setActiveButton('top');
    } else if (path.startsWith('/operations')) {
      setCompassActive(false);
      setActiveButton('bottom');
    }
  }, [location.pathname]);

  const handleCompassClick = () => {
    setActiveButton('none');
    setCompassActive(true);
  };

  const handleToggleClick = (position) => {
    setCompassActive(false);
    setActiveButton(position);
  };

  // Determine classes based on variant
  const navbarClass = `navbar navbar--${variant}`;
  const buttonBoxClass = `button-box button-box--light${variant}`;

  return (
    <div className="navbar-extended-home">
      <nav className="side-nav-container">
        <div className={navbarClass}>
          {/* Compass button */}
          <Link to="/">
            <button
              className={`nav-btn nav-btn--light${variant} ${compassActive ? 'active' : ''}`}
              id="btn-compass"
              onClick={handleCompassClick}
            >
              <i className="fa-regular fa-compass"></i>
            </button>
          </Link>

          <div className={buttonBoxClass}>
            {/* Slider indicator */}
            <div
              id="btn"
              className={activeButton === 'bottom' ? 'bottom' : ''}
              style={{
                opacity: activeButton === 'none' ? 0 : 1
              }}
            />

            {/* Toggle buttons container */}
            <div className="toggle-buttons-container">
              <Link to="/instructor-home">
                <button
                  type="button"
                  className={`toggle-btn ${activeButton === 'top' ? 'active' : ''}`}
                  onClick={() => handleToggleClick('top')}
                >
                  <i className="fa-solid fa-graduation-cap"></i>
                </button>
              </Link>
              
              <Link to="/operations/scheduling">
                <button
                  type="button"
                  className={`toggle-btn ${activeButton === 'bottom' ? 'active' : ''}`}
                  onClick={() => handleToggleClick('bottom')}
                >
                  <i className="fa-solid fa-wrench"></i>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
