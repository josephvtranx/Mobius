import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '@/services/authService';
import '@/css/registration.css';

function InstructorRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;
  
  const [formData, setFormData] = useState({
    email: emailFromState || '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'instructor',
    age: '',
    gender: '',
    college_attended: '',
    major: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        role: 'instructor',
        age: parseInt(formData.age),
        gender: formData.gender,
        college_attended: formData.college_attended,
        major: formData.major
      };
      await authService.register(registrationData);
      alert('Registration successful! Please login to continue.');
      navigate('/auth/login');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#eaf9fc', position: 'relative', paddingTop: 50 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          maxWidth: 1350,
          width: '95vw',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: 0,
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(30,58,76,0.08)',
          overflow: 'hidden',
          minHeight: 700,
          position: 'relative',
        }}
      >
        {/* Left column: Instructor registration form */}
        <div
          style={{
            flex: 1,
            padding: '40px 80px 40px 160px',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a4c', marginBottom: 18, textAlign: 'left' }}>
            Instructor Registration
          </div>
          <div style={{ color: '#6b7280', fontSize: 16, marginBottom: 24, textAlign: 'left' }}>
            Create your instructor account
          </div>
          {error && (
            <div style={{ background: '#fff5f5', color: '#e53e3e', padding: 14, borderRadius: 10, marginBottom: 20, textAlign: 'center', fontSize: 14, border: '1px solid #feb2b2' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="email" style={{ color: '#4a5568', fontSize: 14, fontWeight: 500, marginBottom: 4, display: 'block' }}>Email address*</label>
              {emailFromState ? (
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    borderRadius: 18,
                    border: '2px solid #e2e8f0',
                    fontSize: 14,
                    marginBottom: 0,
                    marginTop: 2,
                    outline: 'none',
                    color: '#6c757d',
                    background: '#f8f9fa',
                    transition: 'border 0.2s',
                  }}
                />
              ) : (
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    borderRadius: 18,
                    border: '2px solid #e2e8f0',
                    fontSize: 14,
                    marginBottom: 0,
                    marginTop: 2,
                    outline: 'none',
                    color: '#1e3a4c',
                    background: '#fafdff',
                    transition: 'border 0.2s',
                  }}
                  placeholder="Enter your email"
                />
              )}
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="password" style={{ color: '#4a5568', fontSize: 14, fontWeight: 500, marginBottom: 4, display: 'block' }}>Password*</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  borderRadius: 18,
                  border: '2px solid #e2e8f0',
                  fontSize: 14,
                  marginBottom: 0,
                  marginTop: 2,
                  outline: 'none',
                  color: '#1e3a4c',
                  background: '#fafdff',
                  transition: 'border 0.2s',
                }}
                placeholder="Create a password"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="confirmPassword" style={{ color: '#4a5568', fontSize: 14, fontWeight: 500, marginBottom: 4, display: 'block' }}>Confirm Password*</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  borderRadius: 18,
                  border: '2px solid #e2e8f0',
                  fontSize: 14,
                  marginBottom: 0,
                  marginTop: 2,
                  outline: 'none',
                  color: '#1e3a4c',
                  background: '#fafdff',
                  transition: 'border 0.2s',
                }}
                placeholder="Confirm your password"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="name" style={{ color: '#4a5568', fontSize: 14, fontWeight: 500, marginBottom: 4, display: 'block' }}>Full Name*</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  borderRadius: 18,
                  border: '2px solid #e2e8f0',
                  fontSize: 14,
                  marginBottom: 0,
                  marginTop: 2,
                  outline: 'none',
                  color: '#1e3a4c',
                  background: '#fafdff',
                  transition: 'border 0.2s',
                }}
                placeholder="Enter your full name"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="phone" style={{ color: '#4a5568', fontSize: 14, fontWeight: 500, marginBottom: 4, display: 'block' }}>Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  borderRadius: 18,
                  border: '2px solid #e2e8f0',
                  fontSize: 14,
                  marginBottom: 0,
                  marginTop: 2,
                  outline: 'none',
                  color: '#1e3a4c',
                  background: '#fafdff',
                  transition: 'border 0.2s',
                }}
                placeholder="Enter your phone number"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="age" style={{ color: '#4a5568', fontSize: 14, fontWeight: 500, marginBottom: 4, display: 'block' }}>Age*</label>
              <input
                id="age"
                name="age"
                type="number"
                required
                min="18"
                value={formData.age}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  borderRadius: 18,
                  border: '2px solid #e2e8f0',
                  fontSize: 14,
                  marginBottom: 0,
                  marginTop: 2,
                  outline: 'none',
                  color: '#1e3a4c',
                  background: '#fafdff',
                  transition: 'border 0.2s',
                }}
                placeholder="Enter your age"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="gender" style={{ color: '#4a5568', fontSize: 14, fontWeight: 500, marginBottom: 4, display: 'block' }}>Gender*</label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  borderRadius: 18,
                  border: '2px solid #e2e8f0',
                  fontSize: 14,
                  marginBottom: 0,
                  marginTop: 2,
                  outline: 'none',
                  color: '#1e3a4c',
                  background: '#fafdff',
                  transition: 'border 0.2s',
                }}
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="college_attended" style={{ color: '#4a5568', fontSize: 14, fontWeight: 500, marginBottom: 4, display: 'block' }}>College/University*</label>
              <input
                id="college_attended"
                name="college_attended"
                type="text"
                required
                value={formData.college_attended}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  borderRadius: 18,
                  border: '2px solid #e2e8f0',
                  fontSize: 14,
                  marginBottom: 0,
                  marginTop: 2,
                  outline: 'none',
                  color: '#1e3a4c',
                  background: '#fafdff',
                  transition: 'border 0.2s',
                }}
                placeholder="Enter your college or university name"
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="major" style={{ color: '#4a5568', fontSize: 14, fontWeight: 500, marginBottom: 4, display: 'block' }}>Major/Field of Study*</label>
              <input
                id="major"
                name="major"
                type="text"
                required
                value={formData.major}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  borderRadius: 18,
                  border: '2px solid #e2e8f0',
                  fontSize: 14,
                  marginBottom: 0,
                  marginTop: 2,
                  outline: 'none',
                  color: '#1e3a4c',
                  background: '#fafdff',
                  transition: 'border 0.2s',
                }}
                placeholder="Enter your major or field of study"
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                background: '#44C3C3',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 18,
                padding: '15px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: 'pointer',
                marginBottom: 18,
                boxShadow: '0 2px 8px rgba(62,212,223,0.08)',
                transition: 'background 0.2s',
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
        {/* Right column: Welcome message */}
        <div
          style={{
            flex: 1,
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
            marginTop: '-80px',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1e3a4c', marginBottom: 18 }}>
            Welcome to Möbius
          </div>
          <div style={{ color: '#6b7280', fontSize: 16, lineHeight: 1.7, maxWidth: 440 }}>
            <p>Möbius is a radically new type of educational resource. Built on an entirely new type of data architecture to increase operational efficiency, you’ll have scheduling systems, studen profiles and records of every performance metric within your  institution workspace in minutes, always live updated in real-time.</p>
            <p>You’ll be able to hyperoptimize your student management 
            exactly as you want it.</p>
            <p style={{ marginTop: 18, fontWeight: 500 }}>Let’s begin.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstructorRegistration; 