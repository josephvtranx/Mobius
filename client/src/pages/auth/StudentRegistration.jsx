import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

function StudentRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    age: '',
    grade: '',
    gender: '',
    school: '',
    pa_code: '',
    status: 'enrolled',
    guardian: {
      name: '',
      phone: '',
      email: '',
      relationship: ''
    }
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('guardian.')) {
      const guardianField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          [guardianField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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
      // Register base user first
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        role: 'student'
      };

      const userResponse = await authService.register(userData, 'student');

      // Complete student registration with additional details
      const studentData = {
        age: parseInt(formData.age),
        grade: parseInt(formData.grade),
        gender: formData.gender,
        school: formData.school,
        pa_code: formData.pa_code,
        status: formData.status,
        guardian: formData.guardian
      };

      await authService.completeRoleRegistration(studentData, 'student');
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '600px' }}>
        <div className="login-header">
          <h1>Student Registration</h1>
          <p>Create your student account</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
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
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Confirm your password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
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
              placeholder="Enter your phone number (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              id="age"
              name="age"
              type="number"
              required
              value={formData.age}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your age"
              min="5"
              max="18"
            />
          </div>

          <div className="form-group">
            <label htmlFor="grade">Grade</label>
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
            <label htmlFor="gender">Gender</label>
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
            <label htmlFor="school">School</label>
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
              required
              value={formData.pa_code}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your PA code"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Enrollment Status</label>
            <select
              id="status"
              name="status"
              required
              value={formData.status}
              onChange={handleChange}
              className="form-input"
            >
              <option value="enrolled">Enrolled</option>
              <option value="on_trial">On Trial</option>
            </select>
          </div>

          {/* Guardian Information */}
          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1.2em', fontWeight: '500' }}>Guardian Information</h2>
          </div>

          <div className="form-group">
            <label htmlFor="guardian.name">Guardian's Name</label>
            <input
              id="guardian.name"
              name="guardian.name"
              type="text"
              required
              value={formData.guardian.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter guardian's name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="guardian.phone">Guardian's Phone</label>
            <input
              id="guardian.phone"
              name="guardian.phone"
              type="tel"
              value={formData.guardian.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter guardian's phone number (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="guardian.email">Guardian's Email</label>
            <input
              id="guardian.email"
              name="guardian.email"
              type="email"
              value={formData.guardian.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter guardian's email (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="guardian.relationship">Relationship to Guardian</label>
            <select
              id="guardian.relationship"
              name="guardian.relationship"
              value={formData.guardian.relationship}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select relationship (optional)</option>
              <option value="parent">Parent</option>
              <option value="grandparent">Grandparent</option>
              <option value="aunt-uncle">Aunt/Uncle</option>
              <option value="legal-guardian">Legal Guardian</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="form-switch">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="switch-button"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentRegistration; 