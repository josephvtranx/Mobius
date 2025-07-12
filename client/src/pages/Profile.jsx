import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import authService from '../services/authService';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    // Get current user from auth service
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setUser(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone || ''
      });
    } catch (err) {
      setError('Failed to fetch profile data');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.patch('/users/profile', formData);
      setUser(response.data.user || response.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="body body--home">
      <div className="page-container">
        {/* Main dashboard content */}
        <main className="main main--home">
          <div className="dashboard-container">
            <div className="dashboard-main">
              {/* Dashboard content */}
              <div className="dashboard-content">
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="success-message">
                    {success}
                  </div>
                )}

                {/* Profile Picture Upload Section */}
                <div className="profile-section">
                  <h2 className="section-title">Profile Picture</h2>
                  <div className="card">
                    <ProfilePictureUpload 
                      currentUser={currentUser}
                      onUploadSuccess={(imageUrl) => {
                        setCurrentUser(prev => ({ ...prev, profile_pic_url: imageUrl }));
                      }}
                    />
                  </div>
                </div>

                {/* Profile Information Section */}
                <div className="profile-section">
                  <div className="section-header">
                    <h2 className="section-title">Profile Information</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-edit"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="card">
                      <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group">
                          <label htmlFor="name" className="form-label">
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="email" className="form-label">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="phone" className="form-label">
                            Phone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-input"
                          />
                        </div>

                        <div className="form-actions">
                          <button
                            type="submit"
                            className="btn-primary"
                          >
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                name: user.name,
                                email: user.email,
                                phone: user.phone || ''
                              });
                            }}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="card">
                      <div className="profile-info">
                        <div className="info-row">
                          <span className="info-label">Name</span>
                          <span className="info-value">{user.name}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Email</span>
                          <span className="info-value">{user.email}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Phone</span>
                          <span className="info-value">{user.phone || 'Not provided'}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Role</span>
                          <span className="info-value capitalize">{user.role}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile; 