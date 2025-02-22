// src/components/Navbar.jsx
import React, { useState } from 'react';

function Navbar() {
  // State for the slider's position and for whether the compass is active.
  const [sliderTransform, setSliderTransform] = useState('translateY(0px)');
  const [compassActive, setCompassActive] = useState(false);

  // When the compass is clicked, mark it as active.
  const handleCompassClick = () => {
    setCompassActive(true);
  };

  // When a toggle button is clicked, update the slider position and deactivate the compass.
  const handleToggleClick = (transformValue) => {
    setSliderTransform(transformValue);
    setCompassActive(false);
  };

  return (
    <div className="navbar">
      {/* Compass button */}
      <a href="#">
        <button
          className={`nav-btn ${compassActive ? 'active' : ''}`}
          id="btn-compass"
          onClick={handleCompassClick}
        >
          <i className="fa-regular fa-compass"></i>
        </button>
      </a>
      <div className="button-box">
        {/* Slider element that indicates active position */}
        <div
          id="btn"
          style={{
            transform: sliderTransform,
            background: 'white' // Always visible
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
  );
}

export default Navbar;
