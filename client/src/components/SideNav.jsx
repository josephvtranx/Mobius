// SideNav.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ExtendedMenu from './ExtendedMenu';

function SideNav() {
  const location = useLocation();
  
  // Determine which variant to show based on the current route
  const getVariant = () => {
    if (location.pathname === '/' || location.pathname === '/home') return 'home'; // Home page uses 'home' variant
    if (location.pathname.startsWith('/academics')) return 'teal';
    if (location.pathname.startsWith('/operations')) return 'orange';
    return null;
  };

  const variant = getVariant();
  console.log('SideNav pathname:', location.pathname, 'variant:', variant);

  const navbarClass = `navbar navbar--${variant === 'home' ? 'teal' : variant}`;

  return (
    <nav className="side-nav-container">
      <Navbar variant={variant} />
      {(variant === 'teal' || variant === 'orange') && <ExtendedMenu variant={variant === 'teal' ? 'academic' : 'operations'} />}
    </nav>
  );
}

export default SideNav;
