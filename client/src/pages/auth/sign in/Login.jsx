import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import authService from '../../../services/authService';
import '../../../css/login.css';

export default function Login() {
  const [step, setStep] = useState(1); // 1: Institution Code, 2: Credentials
  const [formData, setFormData] = useState({
    institutionCode: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingInstitution, setIsCheckingInstitution] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    if (formData.institutionCode.trim()) {
      setIsCheckingInstitution(true);
      setError('');
      try {
        await authService.setInstitutionCode(formData.institutionCode.trim());
        setStep(2);
      } catch (err) {
        setError('Invalid institution code. Please try again.');
      } finally {
        setIsCheckingInstitution(false);
      }
    } else {
      setStep(2);
    }
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
        'Invalid email or password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (step === 2) {
      navigate('/auth/role-select');
    }
    // Optionally, add a different action for step 1 if needed
  };

  return (
    <div className="login-saas-bg">
      <div className="login-saas-container">
        {/* Left column */}
        <div className="login-saas-left">
          <form
            className="login-saas-form"
            onSubmit={step === 1 ? handleContinue : handleSignIn}
            autoComplete="off"
          >
            <div className="login-saas-progress">
              <div className="login-saas-pill active"></div>
              <div className={`login-saas-pill${step === 2 ? ' active' : ''}`}></div>
        </div>
            <div className="login-saas-heading">Sign in to your institution’s workspace.</div>
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
                    <label htmlFor="institutionCode" className="login-saas-input-label">Institution Code <span style={{ color: '#b0b4c0', fontWeight: 400, fontSize: '0.95em' }}>(optional)</span></label>
                    <input
                      id="institutionCode"
                      name="institutionCode"
                      type="text"
                      value={formData.institutionCode}
                      onChange={handleChange}
                      className="login-saas-input"
                      placeholder="Enter your institution code"
                      autoComplete="organization"
                    />
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
          <button
            type="submit"
            disabled={isLoading || isCheckingInstitution}
            className="login-saas-signin-btn"
          >
            {isLoading || isCheckingInstitution
              ? (step === 1 ? 'Checking...' : 'Signing in...')
              : (step === 1 ? (<><span>Continue</span> <FaArrowRight style={{ fontSize: 20 }} /></>) : (<><span>Sign in</span> <FaArrowRight style={{ fontSize: 20 }} /></>))}
          </button>
                  <button type="button" className="login-saas-register-btn" onClick={handleRegisterClick}>
                    <span>{step === 1 ? 'Register your institution as a new Möbius Workspace' : 'New user?'}</span>
                    <span className="login-saas-register-arrow"><FaArrowRight /></span>
          </button>
                </div>
              </motion.div>
            </AnimatePresence>
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