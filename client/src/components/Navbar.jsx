// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ variant = 'teal' }) {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleCompassClick = (e) => {
    e.preventDefault();
    setActiveButton('none');
    setCompassActive(true);
    navigate('/');
  };

  const handleToggleClick = (e, position, path) => {
    e.preventDefault();
    setCompassActive(false);
    setActiveButton(position);
    navigate(path);
  };

  // Determine classes based on variant
  const navbarClass = `navbar navbar--${variant}`;
  const buttonBoxClass = `button-box button-box--light${variant}`;

  return (
    <div className={navbarClass}>
          {/* Compass button */}
            <button
        className={`nav-btn nav-btn--light${variant} ${compassActive ? 'active' : ''}`}
              id="btn-compass"
              onClick={handleCompassClick}
            >
              <i className="fa-regular fa-compass"></i>
            </button>

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
              <button
                type="button"
            className={`toggle-btn ${activeButton === 'top' ? 'active' : ''}`}
            onClick={(e) => handleToggleClick(e, 'top', '/instructor-home')}
              >
                <i className="fa-solid fa-graduation-cap"></i>
              </button>
          
              <button
                type="button"
            className={`toggle-btn ${activeButton === 'bottom' ? 'active' : ''}`}
            onClick={(e) => handleToggleClick(e, 'bottom', '/operations/scheduling')}
              >
                <i className="fa-solid fa-wrench"></i>
              </button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
