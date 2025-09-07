import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import '@/css/ForkPage.css';

export default function ForkPage() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth/login');
  };

  const handleRegister = () => {
    navigate('/auth/register/institution');
  };

  const handleNewUser = () => {
    navigate('/auth/register/user/role-select');
  };

  return (
    <div className="fork-page-container">
      <Header variant="auth" />
      {/* Main Content */}
      <div className="fork-page-content">
        <div className="buttons-container">
          {/* Sign In Card */}
          <div
            onClick={handleSignIn}
            className="fork-card fork-card-signin"
          >
            Sign in
          </div>

          {/* Register Card */}
          <div
            onClick={handleRegister}
            className="fork-card fork-card-default"
          >
            Register
          </div>

          {/* New User Card */}
          <div
            onClick={handleNewUser}
            className="fork-card fork-card-default"
          >
            New User
          </div>
        </div>
      </div>
    </div>
  );
}
