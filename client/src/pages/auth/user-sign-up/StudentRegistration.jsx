import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../../services/authService';
import '../../../css/registration.css';

function StudentRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;
  
  const [formData, setFormData] = useState({
    email: emailFromState || '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'student',
    status: 'enrolled',
    age: '',
    grade: '',
    gender: '',
    school: '',
    pa_code: '',
    guardians: [
      { name: '', phone: '', email: '', relationship: '' }
    ]
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('guardians[')) {
      const matches = name.match(/guardians\[(\d+)\]\.(\w+)/);
      if (matches) {
        const [, index, field] = matches;
        setFormData(prev => ({
          ...prev,
          guardians: prev.guardians.map((guardian, i) =>
            i === parseInt(index) ? { ...guardian, [field]: value } : guardian
          )
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addGuardian = () => {
    setFormData(prev => ({
      ...prev,
      guardians: [
        ...prev.guardians,
        { name: '', phone: '', email: '', relationship: '' }
      ]
    }));
  };

  const removeGuardian = (index) => {
    if (formData.guardians.length > 1) {
      setFormData(prev => ({
        ...prev,
        guardians: prev.guardians.filter((_, i) => i !== index)
      }));
    }
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
        role: 'student',
        status: formData.status,
        age: parseInt(formData.age),
        grade: parseInt(formData.grade),
        gender: formData.gender,
        school: formData.school,
        pa_code: formData.pa_code,
        guardians: formData.guardians
      };
      await authService.register(registrationData);
      alert('Registration successful! Please login to continue.');
      navigate('/login');
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
        {/* Left column: Student registration form */}
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
            Student Registration
          </div>
          <div style={{ color: '#6b7280', fontSize: 16, marginBottom: 24, textAlign: 'left' }}>
            Create your student account
          </div>
          {error && (
            <div style={{ background: '#fff5f5', color: '#e53e3e', padding: 14, borderRadius: 10, marginBottom: 20, textAlign: 'center', fontSize: 14, border: '1px solid #feb2b2' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="form-group">
                <label htmlFor="email">Email address*</label>
                {emailFromState ? (
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="form-input"
                    style={{ background: '#f8f9fa', color: '#6c757d' }}
                  />
                ) : (
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password*</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength="8"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Create a password (minimum 8 characters)"
                />
                <small className="form-text text-muted">
                  Password must be at least 8 characters long
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password*</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength="8"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name*</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="form-section">
              <h2>Student Information</h2>
              <div className="form-group">
                <label htmlFor="age">Age*</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min="5"
                  max="18"
                  value={formData.age}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your age"
                />
              </div>

              <div className="form-group">
                <label htmlFor="grade">Grade*</label>
                <select
                  id="grade"
                  name="grade"
                  required
                  value={formData.grade}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select your grade</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender*</label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select your gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="school">School*</label>
                <input
                  id="school"
                  name="school"
                  type="text"
                  required
                  value={formData.school}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your school name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pa_code">PA Code</label>
                <input
                  id="pa_code"
                  name="pa_code"
                  type="text"
                  value={formData.pa_code}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter PA code (if applicable)"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h2>Guardian Information</h2>
                <button
                  type="button"
                  onClick={addGuardian}
                  className="add-guardian-button"
                >
                  Add Another Guardian
                </button>
              </div>

              {formData.guardians.map((guardian, index) => (
                <div key={index} className="guardian-section">
                  <div className="guardian-header">
                    <h3>Guardian {index + 1}</h3>
                    {formData.guardians.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGuardian(index)}
                        className="remove-guardian-button"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`guardians[${index}].name`}>Guardian Name*</label>
                    <input
                      id={`guardians[${index}].name`}
                      name={`guardians[${index}].name`}
                      type="text"
                      required
                      value={guardian.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter guardian's name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`guardians[${index}].phone`}>Guardian Phone*</label>
                    <input
                      id={`guardians[${index}].phone`}
                      name={`guardians[${index}].phone`}
                      type="tel"
                      required
                      value={guardian.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter guardian's phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`guardians[${index}].email`}>Guardian Email</label>
                    <input
                      id={`guardians[${index}].email`}
                      name={`guardians[${index}].email`}
                      type="email"
                      value={guardian.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter guardian's email"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`guardians[${index}].relationship`}>Relationship to Student*</label>
                    <select
                      id={`guardians[${index}].relationship`}
                      name={`guardians[${index}].relationship`}
                      required
                      value={guardian.relationship}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select relationship</option>
                      <option value="parent">Parent</option>
                      <option value="guardian">Legal Guardian</option>
                      <option value="grandparent">Grandparent</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
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

export default StudentRegistration; 