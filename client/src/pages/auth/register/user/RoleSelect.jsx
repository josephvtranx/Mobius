// Registration role picker — same visual system as Login.jsx (login.css),
// which this page is one hop off of. No design source exists for this
// screen; the previous version was a bespoke page (its own teal shade, a
// decorative "Sign in with KakaoTalk" button linking out to a real
// third-party login page that did nothing for this app) unrelated to the
// rest of the app's look. Dropped the KakaoTalk button — it wasn't wired
// to anything real — and rebuilt on login-saas-* to match Login.jsx.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaArrowRight } from 'react-icons/fa';
import '@/css/login.css';

const ROLES = [
  { id: 'student', name: 'Student', icon: FaUserGraduate },
  { id: 'instructor', name: 'Instructor', icon: FaChalkboardTeacher },
  { id: 'staff', name: 'Staff', icon: FaUserShield },
];

function RoleSelect() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    navigate(`/auth/register/user/${selectedRole}`, { state: { email } });
  };

  return (
    <div className="login-saas-bg">
      <div className="login-saas-container">
        <div className="login-saas-left">
          <form className="login-saas-form" onSubmit={handleContinue}>
            <div className="login-saas-heading">Welcome to Möbius</div>
            <p className="login-saas-subheading">Tell us who you are to start registering.</p>

            <label className="login-saas-input-label" style={{ marginBottom: 10 }}>Who are you?</label>
            <div className="login-saas-roles">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`login-saas-role ${selectedRole === role.id ? 'active' : ''}`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <role.icon />
                  {role.name}
                </button>
              ))}
            </div>

            <div className="login-saas-input-group">
              <label htmlFor="email" className="login-saas-input-label">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="login-saas-input"
              />
            </div>

            <div className="login-saas-btn-group">
              <button type="submit" className="login-saas-signin-btn">
                <span>Continue</span> <FaArrowRight style={{ fontSize: 16 }} />
              </button>
            </div>
          </form>
        </div>
        <div className="login-saas-right">
          <img src="/sign-in.png" alt="Registration illustration" className="login-saas-image" />
        </div>
      </div>
    </div>
  );
}

export default RoleSelect;
