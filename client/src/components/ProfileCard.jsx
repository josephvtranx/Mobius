// src/components/ProfileCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function ProfileCard() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/profile/settings');
  };

  if (!user) {
    return null;
  }

  // Format role for display (e.g., "staff" -> "Staff @ Møbius Academy")
  const formatRole = (role) => {
    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
    return `${formattedRole} @ Møbius Academy`;
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <img 
          src={user.profile_pic || '/default-avatar.png'} 
          alt={`${user.name}'s profile`} 
          className="profile-pic" 
        />
        <div className="profile-info">
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-role">{formatRole(user.role)}</p>
        </div>
        <div className="online-indicator"></div>
      </div>

      <div className="profile-buttons">
        <button 
          className="btn setting-btn" 
          onClick={handleSettings}
        >
          <i className="fa-solid fa-gear"></i>
          <span>Settings</span>
        </button>
        <button 
          className="btn logout-btn" 
          onClick={handleLogout}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
