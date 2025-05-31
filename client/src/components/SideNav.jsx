// SideNav.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ExtendedMenu from './ExtendedMenu';

function SideNav() {
  const location = useLocation();
  
  // Determine which variant to show based on the current route
  const getVariant = () => {
    if (location.pathname === '/') return null;
    if (location.pathname.startsWith('/academics')) {
      return 'academic';
    }
    if (location.pathname.startsWith('/operations')) {
      return 'operations';
    }
    return null;
  };

  const variant = getVariant();

  return (
    <nav className="side-nav-container">
      <Navbar variant={variant === 'academic' ? 'teal' : 'orange'} />
      {variant && <ExtendedMenu variant={variant} />}
    </nav>
  );
}

export default SideNav;
