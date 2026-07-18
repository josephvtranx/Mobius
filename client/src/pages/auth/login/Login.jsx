import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import '@/css/login.css';

// Single-step login: email + password locate the institution via the global
// registry directory — no institution-code entry (registration still uses a
// code on its own pages).
export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await authService.login({
        email: formData.email,
        password: formData.password,
      });
      navigate('/home');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-saas-bg">
      <div className="login-saas-container">
        {/* Left column */}
        <div className="login-saas-left">
          <form className="login-saas-form" onSubmit={handleSignIn} autoComplete="off">
            <div className="login-saas-heading">Sign in to your institution’s workspace.</div>
            <div className="login-saas-input-group">
              <label htmlFor="email" className="login-saas-input-label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="login-saas-input"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>
            <div className="login-saas-input-group">
              <label htmlFor="password" className="login-saas-input-label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="login-saas-input"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            {error && <div className="login-saas-error">{error}</div>}
            <div className="login-saas-btn-group">
              <button type="submit" disabled={isLoading} className="login-saas-signin-btn">
                {isLoading
                  ? 'Signing in...'
                  : (<><span>Sign in</span> <FaArrowRight style={{ fontSize: 20 }} /></>)}
              </button>
              <button
                type="button"
                className="login-saas-register-btn"
                onClick={() => navigate('/auth/register/user/role-select')}
              >
                <span>New user? Register with your institution code</span>
                <span className="login-saas-register-arrow"><FaArrowRight /></span>
              </button>
            </div>
          </form>
        </div>
        {/* Right column: Image */}
        <div className="login-saas-right">
          <img src="/sign-in.png" alt="Sign in illustration" className="login-saas-image" />
        </div>
      </div>
    </div>
  );
}
