import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@/css/TogglePage.css';

export default function TogglePage() {
  const navigate = useNavigate();
  const [toggleState, setToggleState] = useState(false);

  const handleToggle = () => {
    setToggleState(!toggleState);
  };

  const handleLetsGo = () => {
    if (toggleState) {
      navigate('/auth/fork');
    }
  };

  return (
    <div className="toggle-page-container">
      {/* Main Content */}
      <div className="toggle-page-content">
        <h1 className="toggle-page-title">
          Hyperoptimize your student management
        </h1>
        
        <div className="toggle-page-subtitle">
          Let real AI w
          <div 
            className={`toggle-switch ${toggleState ? 'toggle-on' : 'toggle-off'}`}
            onClick={handleToggle}
          >
            <div className="toggle-handle"></div>
          </div>
          rk for you
        </div>

        {toggleState && (
          <button 
            className="lets-go-button"
            onClick={handleLetsGo}
          >
            Let's Go
          </button>
        )}
      </div>
    </div>
  );
}
