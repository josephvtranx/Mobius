// src/components/ProfileCard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import uploadService from '../services/uploadService';

function ProfileCard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());

  // Listen for changes in user data (e.g., when profile picture is updated)
  useEffect(() => {
    const checkUserUpdate = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && (!user || currentUser.profile_pic_url !== user.profile_pic_url)) {
        setUser(currentUser);
      }
    };

    // Check for updates more frequently
    const interval = setInterval(checkUserUpdate, 500);

    // Listen for custom profile update events
    const handleProfileUpdate = () => {
      const updatedUser = authService.getCurrentUser();
      setUser(updatedUser);
    };

    // Listen for storage events (when localStorage is updated from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        const updatedUser = JSON.parse(e.newValue);
        setUser(updatedUser);
      }
    };

    // Add event listeners
    window.addEventListener('profile-updated', handleProfileUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('profile-updated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/profile');
  };

  if (!user) {
    return null;
  }

  // Format role for display (e.g., "staff" -> "Staff @ Møbius Academy")
  const formatRole = (role) => {
    const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);
    return `${formattedRole} @ Møbius Academy`;
  };

  // Debug logging
  console.log('ProfileCard user data:', user);
  console.log('Profile picture URL:', user.profile_pic_url);

  // Get the full URL for the profile picture
  const profilePictureUrl = uploadService.getProfilePictureUrl(user.profile_pic_url) || '/me.jpg';

  return (
    <div className="profile-card">
      <div className="profile-header">
        <img 
          src={profilePictureUrl} 
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
