import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '@/css/login.css';

export default function InstitutionRegistration() {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Contact Info, 3: Pending Approval
  const [formData, setFormData] = useState({
    // Step 1 fields
    institutionName: '',
    institutionLocation: '',
    institutionSize: '',
    instructors: '',
    students: '',
    staff: '',
    // Step 2 fields
    phone: '',
    email: '',
    website: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    
    // Validate step 1 fields
    if (step === 1) {
      if (!formData.institutionName.trim()) {
        setError('Institution name is required.');
        return;
      }
      
      if (!formData.institutionLocation.trim()) {
        setError('Institution location is required.');
        return;
      }
      
      if (!formData.institutionSize.trim()) {
        setError('Institution size is required.');
        return;
      }

      setStep(2);
      setError('');
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      handleContinue(e);
      return;
    }

    if (step === 2) {
      // Validate step 2 fields
      if (!formData.phone.trim()) {
        setError('Phone number is required.');
        return;
      }
      
      if (!formData.email.trim()) {
        setError('Email is required.');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const res = await fetch('/api/register-institution', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Failed');
        setStep(3);          // pending approval screen
        setIsLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'Failed to register institution. Please try again.'
        );
        setIsLoading(false);
      }
      return;
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth/login');
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setError('');
    } else if (step === 3) {
      setStep(2);
      setError('');
    }
  };

  return (
    <div className="login-saas-bg">
      <div className="login-saas-container">
        {/* Left column */}
        <div className="login-saas-left">
          <form
            className="login-saas-form"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="login-saas-progress">
              <div className={`login-saas-pill${step >= 1 ? ' active' : ''}`}></div>
              <div className={`login-saas-pill${step >= 2 ? ' active' : ''}`}></div>
              <div className={`login-saas-pill${step >= 3 ? ' active' : ''}`}></div>
            </div>
            
            <div className="login-saas-heading">
              {step === 3 
                ? "Your registration request is pending approval by Mobius team"
                : "Register your institution as a new Mobius workspace"
              }
            </div>
            
            <AnimatePresence mode="wait" initial={false}>
              {step === 1 && (
                <motion.div
                  key="step1-content"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.77, 0, 0.18, 1] }}
                  style={{ width: '100%' }}
                >
                  <div className="login-saas-input-group">
                    <label htmlFor="institutionName" className="login-saas-input-label">
                      What is the name of your institution?
                    </label>
                    <input
                      id="institutionName"
                      name="institutionName"
                      type="text"
                      value={formData.institutionName}
                      onChange={handleChange}
                      className="login-saas-input"
                      placeholder="Enter institution name"
                      autoComplete="organization"
                    />
                  </div>
                  
                  <div className="login-saas-input-group">
                    <label htmlFor="institutionLocation" className="login-saas-input-label">
                      Where is your institution?
                    </label>
                    <input
                      id="institutionLocation"
                      name="institutionLocation"
                      type="text"
                      value={formData.institutionLocation}
                      onChange={handleChange}
                      className="login-saas-input"
                      placeholder="Enter institution location"
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="login-saas-input-group">
                    <label htmlFor="institutionSize" className="login-saas-input-label">
                      How many people are in your institution?
                    </label>
                    <input
                      id="institutionSize"
                      name="institutionSize"
                      type="text"
                      value={formData.institutionSize}
                      onChange={handleChange}
                      className="login-saas-input"
                      placeholder="Enter approximate size"
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="login-saas-input-group">
                    <label className="login-saas-input-label">
                      User distribution
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      width: '100%'
                    }}>
                      <input
                        name="instructors"
                        type="number"
                        value={formData.instructors}
                        onChange={handleChange}
                        className="login-saas-input"
                        placeholder="Instructors"
                        style={{ 
                          flex: 1,
                          textAlign: 'center',
                          borderRadius: '25px',
                          minWidth: '0'
                        }}
                        autoComplete="off"
                      />
                      <input
                        name="students"
                        type="number"
                        value={formData.students}
                        onChange={handleChange}
                        className="login-saas-input"
                        placeholder="Students"
                        style={{ 
                          flex: 1,
                          textAlign: 'center',
                          borderRadius: '25px',
                          minWidth: '0'
                        }}
                        autoComplete="off"
                      />
                      <input
                        name="staff"
                        type="number"
                        value={formData.staff}
                        onChange={handleChange}
                        className="login-saas-input"
                        placeholder="Staff"
                        style={{ 
                          flex: 1,
                          textAlign: 'center',
                          borderRadius: '25px',
                          minWidth: '0'
                        }}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2-content"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.77, 0, 0.18, 1] }}
                  style={{ width: '100%' }}
                >
                  <div className="login-saas-input-group">
                    <label htmlFor="phone" className="login-saas-input-label">
                      Contact information of your institution
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="login-saas-input"
                      placeholder="Phone"
                      autoComplete="tel"
                    />
                  </div>
                  
                  <div className="login-saas-input-group">
                    <label htmlFor="email" className="login-saas-input-label">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="login-saas-input"
                      placeholder="Email"
                      autoComplete="email"
                    />
                  </div>
                  
                  <div className="login-saas-input-group">
                    <label htmlFor="website" className="login-saas-input-label">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      className="login-saas-input"
                      placeholder="Website (optional)"
                      autoComplete="url"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3-content"
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -40, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.77, 0, 0.18, 1] }}
                  style={{ width: '100%' }}
                >
                  <div className="login-saas-input-group" style={{ textAlign: 'center', marginTop: '40px' }}>
                    <p style={{ 
                      fontSize: '16px', 
                      color: '#666',
                      lineHeight: '1.5',
                      marginBottom: '32px'
                    }}>
                      We've received your institution registration and will review it shortly. 
                      You'll receive an email notification once your workspace is approved.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {error && <div className="login-saas-error">{error}</div>}
            
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`button-group-${step}`}
                initial={{ y: -24 }}
                animate={{ y: 0 }}
                exit={{ y: 24 }}
                transition={{ duration: 0.32, ease: [0.77, 0, 0.18, 1] }}
                style={{ width: '100%' }}
              >
                <div className="login-saas-btn-group">
                  {step !== 3 && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="login-saas-signin-btn"
                    >
                      {isLoading ? (
                        'Creating workspace...'
                      ) : step === 1 ? (
                        <>
                          <span>Continue</span>
                          <FaArrowRight style={{ fontSize: 20 }} />
                        </>
                      ) : (
                        <>
                          <span>Create workspace</span>
                          <FaArrowRight style={{ fontSize: 20 }} />
                        </>
                      )}
                    </button>
                  )}
                  
                  {step === 1 ? (
                    <button 
                      type="button" 
                      className="login-saas-register-btn" 
                      onClick={handleBackToLogin}
                    >
                      <span>Back to sign in</span>
                      <span className="login-saas-register-arrow">
                        <FaArrowRight />
                      </span>
                    </button>
                  ) : step === 3 ? (
                    <button 
                      type="button" 
                      className="login-saas-register-btn" 
                      onClick={handleBackToLogin}
                    >
                      <span>Back to sign in</span>
                      <span className="login-saas-register-arrow">
                        <FaArrowRight />
                      </span>
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      className="login-saas-register-btn" 
                      onClick={handleBack}
                    >
                      <span>Back</span>
                      <span className="login-saas-register-arrow">
                        <FaArrowRight />
                      </span>
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </form>
        </div>
        
        {/* Right column: Image */}
        <div className="login-saas-right">
          <img src="/sign-in.png" alt="Institution registration illustration" className="login-saas-image" />
        </div>
      </div>
    </div>
  );
} 