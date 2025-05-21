// SideNav.jsx
import React from 'react';
import Navbar from './Navbar';
import ExtendedMenu from './ExtendedMenu';

function SideNav() {
  return (
    <nav className="side-nav-container">
      <Navbar />
      <ExtendedMenu />
    </nav>
  );
}

export default SideNav;
