import React from 'react';

function Header() {
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
        <h1 className="title">MCal Schedule</h1>

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