// Shared-shell profile card (pinned to the sidebar bottom): avatar + name +
// "Role @ Academy" + Settings/Logout. Avatar is initials-on-gradient per the
// design handoff ("no raster images"); a real uploaded profile picture, when
// present, still wins.
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import uploadService from '../services/uploadService';

const initialsOf = (name) =>
  String(name || '').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

function ProfileCard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [imgBroken, setImgBroken] = useState(false);

  // Re-read the stored user when the profile page announces an update or
  // another tab writes it — no polling.
  useEffect(() => {
    const handleProfileUpdate = () => { setUser(authService.getCurrentUser()); setImgBroken(false); };
    const handleStorageChange = (e) => {
      if (e.key === 'user') handleProfileUpdate();
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const roleLabel = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  const subtitle = user.institution_name ? `${roleLabel} @ ${user.institution_name}` : roleLabel;
  const photoUrl = user.profile_pic_url ? uploadService.getProfilePictureUrl(user.profile_pic_url) : null;

  return (
    <div className="profile-card">
      <div className="profile-header">
        {photoUrl && !imgBroken ? (
          <img src={photoUrl} alt={`${user.name}'s profile`} className="profile-pic"
            onError={() => setImgBroken(true)} />
        ) : (
          <span className="profile-pic profile-pic--initials" aria-hidden="true">{initialsOf(user.name)}</span>
        )}
        <div className="profile-info">
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-role">{subtitle}</p>
        </div>
        <div className="online-indicator"></div>
      </div>

      <div className="profile-buttons">
        <button className="btn setting-btn" onClick={() => navigate('/profile')}>
          <i className="fa-solid fa-gear"></i>
          <span>Settings</span>
        </button>
        <button className="btn logout-btn" onClick={handleLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
