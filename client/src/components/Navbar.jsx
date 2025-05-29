// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ variant = 'teal' }) {
  const location = useLocation();
  const [sliderTransform, setSliderTransform] = useState('translateY(0px)');
  const [compassActive, setCompassActive] = useState(false);

  // Update active states based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setCompassActive(true);
      setSliderTransform('translateY(0px)');
    } else if (path.startsWith('/instructor-home')) {
      setCompassActive(false);
      setSliderTransform('translateY(0px)');
    } else if (path.startsWith('/operations')) {
      setCompassActive(false);
      setSliderTransform('translateY(125%)');
    }
  }, [location.pathname]);

  const handleCompassClick = () => {
    setCompassActive(true);
    setSliderTransform('translateY(0px)');
  };

  const handleToggleClick = (transformValue) => {
    setSliderTransform(transformValue);
    setCompassActive(false);
  };

  // Determine classes based on variant
  const navbarClass = `navbar navbar--${variant}`;
  const navBtnClass = `nav-btn nav-btn--light${variant} ${compassActive ? 'active' : ''}`;
  const buttonBoxClass = `button-box button-box--light${variant}`;

  return (
    <div className="navbar-extended-home">
      <nav className="side-nav-container">
        <div className={navbarClass}>
          {/* Compass button */}
          <Link to="/">
            <button
              className={navBtnClass}
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
              style={{
                transform: sliderTransform,
                background: compassActive ? 'transparent' : 'white',
                transition: 'transform 0.3s ease, background 0.3s ease',
              }}
            ></div>

            {/* Toggle buttons */}
            <Link to="/instructor-home">
              <button
                type="button"
                className="toggle-btn"
                onClick={() => handleToggleClick('translateY(0px)')}
              >
                <i className="fa-solid fa-graduation-cap"></i>
              </button>
            </Link>
            {/* Operations button */}
            <Link to="/operations/scheduling">
              <button
                type="button"
                className="toggle-btn"
                onClick={() => handleToggleClick('translateY(125%)')}
              >
                <i className="fa-solid fa-wrench"></i>
              </button>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
