import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaArrowRight } from 'react-icons/fa';

function RoleSelect() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const roles = [
    {
      id: 'student',
      name: 'Student',
      icon: FaUserGraduate,
    },
    {
      id: 'instructor',
      name: 'Instructor',
      icon: FaChalkboardTeacher,
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: FaUserShield,
    },
  ];

  const handleContinue = (e) => {
    e.preventDefault();
    const state = { email };
    if (selectedRole === 'student') navigate('/auth/register/user/student', { state });
    else if (selectedRole === 'instructor') navigate('/auth/register/user/instructor', { state });
    else if (selectedRole === 'admin') navigate('/auth/register/user/staff', { state });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#eaf9fc', position: 'relative', paddingTop: 50, overflow: 'hidden' }}>
      {/* Main card */}
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
        {/* Left column: Form */}
        <div
          style={{
            flex: 1,
            padding: '40px 80px 40px 160px',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          {/* KakaoTalk button */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              color: '#181600',
              border: 'none',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 16,
              padding: '12px 0',
              marginBottom: 24,
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)', // more pronounced shadow
              transition: 'box-shadow 0.2s',
            }}
            onClick={() => window.open('https://accounts.kakao.com/login', '_blank')}
          >
            <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png" alt="KakaoTalk" style={{ height: 24, marginRight: 12 }} />
            Sign in with KakaoTalk
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0 24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#eaf0f4' }} />
            <span style={{ margin: '0 16px', color: '#b0b4c0', fontSize: 13 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#eaf0f4' }} />
          </div>

          {/* Role selection */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10, color: '#1e3a4c' }}>Who are you?</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderRadius: 10,
                    border: selectedRole === role.id ? '2.5px solid #3ed4df' : '2px solid #e2e8f0',
                    background: selectedRole === role.id ? '#eaf9fc' : '#fff',
                    color: selectedRole === role.id ? '#1e3a4c' : '#718096',
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <role.icon style={{ fontSize: 22, marginBottom: 6, color: selectedRole === role.id ? '#3ed4df' : '#b0b4c0' }} />
                  {role.name}
                </button>
              ))}
            </div>
          </div>

          {/* Email input */}
          <form onSubmit={handleContinue} style={{ width: '100%' }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your work email address."
              style={{
                width: '100%',
                padding: '8px 16px',         // slimmer input
                borderRadius: 18,            // more rounded
                border: '2px solid #e2e8f0',
                fontSize: 14,
                marginBottom: 22,
                marginTop: 8,
                outline: 'none',
                color: '#1e3a4c',
                background: '#fafdff',
                transition: 'border 0.2s',
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                background: '#44C3C3', // updated color
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
            >
              Continue <FaArrowRight style={{ fontSize: 20 }} />
            </button>
          </form>

          {/* Privacy disclaimer */}
          <div style={{ fontSize: 12, color: '#b0b4c0', marginTop: 'auto', textAlign: 'center' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>

        {/* Right column: Welcome */}
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

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .onboard-card {
            flex-direction: column !important;
            min-height: unset !important;
          }
        }
        @media (max-width: 600px) {
          .onboard-card {
            margin-top: 32px !important;
            border-radius: 12px !important;
            box-shadow: 0 2px 12px rgba(30,58,76,0.10) !important;
          }
          .onboard-header {
            left: 16px !important;
            top: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default RoleSelect; 