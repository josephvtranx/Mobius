// src/components/Navbar.jsx
import React, { useState } from 'react';

function Navbar() {
  const [sliderTransform, setSliderTransform] = useState('translateY(0px)');
  const [compassActive, setCompassActive] = useState(false);

  const handleCompassClick = () => {
    setCompassActive(true);
  };

  const handleToggleClick = (transformValue) => {
    setSliderTransform(transformValue);
    setCompassActive(false);
  };

  return (
    <div className="navbar-extended-home">
      <nav className="side-nav-container">
        <div className="navbar2">
          {/* Compass button */}
          <a href="#">
            <button
              className={`nav-btn2 ${compassActive ? 'active' : ''}`}
              id="btn-compass"
              onClick={handleCompassClick}
            >
              <i className="fa-regular fa-compass"></i>
            </button>
          </a>

          <div className="button-box2">
            {/* Slider indicator */}
            <div
              id="btn"
              style={{
                transform: sliderTransform,
                background: 'white',
                transition: 'transform 0.3s ease',
              }}
            ></div>

            {/* Toggle buttons */}
            <a href="#">
              <button
                type="button"
                className="toggle-btn"
                onClick={() => handleToggleClick('translateY(0px)')}
              >
                <i className="fa-solid fa-graduation-cap"></i>
              </button>
            </a>
            <a href="#">
              <button
                type="button"
                className="toggle-btn"
                onClick={() => handleToggleClick('translateY(125%)')}
              >
                <i className="fa-solid fa-wrench"></i>
              </button>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
