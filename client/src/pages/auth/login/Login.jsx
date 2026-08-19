import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      // guardians' dashboard IS the portal — everyone else gets /home
      const role = authService.getCurrentUser()?.role;
      navigate(role === 'guardian' ? '/portal' : '/home');
    } catch (err) {
      // The server's !req.db guard ("No institution selected or DB
      // unavailable.") fires for any email with no directory row — from this
      // single-step form that just means the credentials didn't match, so
      // show the normal auth error instead of the internal guard message.
      const raw = err.response?.data?.message || err.response?.data?.error;
      const internal = err.response?.status === 400 && /no institution selected/i.test(raw || '');
      setError(!raw || internal ? 'Invalid email or password. Please try again.' : raw);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-saas-bg">
      <div className="login-solo-card">
        <form className="login-saas-form" onSubmit={handleSignIn} autoComplete="off" style={{ maxWidth: 'none' }}>
          <div className="login-saas-heading">Sign in</div>
          <div className="login-saas-input-group" style={{ marginTop: 28 }}>
            <label htmlFor="email" className="login-saas-input-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="login-saas-input"
              placeholder="you@institution.edu"
              autoComplete="email"
              required
            />
          </div>
          <div className="login-saas-input-group">
            <div className="login-saas-password-row">
              <label htmlFor="password" className="login-saas-input-label">Password</label>
              <Link to="/auth/reset" className="login-saas-input-label">Forgot password?</Link>
            </div>
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
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <p className="login-solo-footer" style={{ marginTop: 20 }}>
            New here? <Link to="/auth/register/user/role-select">Register with an institution code</Link>
          </p>
        </form>
      </div>
      <p className="login-solo-footer">
        Setting up a new institution? <Link to="/auth/register/institution">Request a workspace</Link>
      </p>
    </div>
  );
}
