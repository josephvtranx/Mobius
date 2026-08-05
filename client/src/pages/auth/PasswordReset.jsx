// Password reset (design handoff auth/StudentReset.dc.html). There is no
// forgot-password endpoint anywhere in the server (authRoutes.js only has
// login/register/verify-token/refresh-token/change-password[requires an
// existing session]/logout) — a real reset flow needs a token-issuing
// endpoint and an email send, neither of which exist. Ships as an honest
// placeholder with a way back to sign-in rather than a fake "check your
// email" flow that goes nowhere.
import { Link } from 'react-router-dom';
import '@/css/login.css';

export default function PasswordReset() {
  return (
    <div className="login-saas-bg">
      <div className="login-saas-container">
        <div className="login-saas-left">
          <div className="login-saas-form">
            <div className="login-saas-heading">Reset your password</div>
            <p className="login-saas-subheading">
              Self-serve password reset isn't available yet — there's no reset flow built on the backend.
            </p>
            <p className="login-saas-subheading">
              Ask your academy's staff to reset it for you in the meantime.
            </p>
            <div className="login-saas-btn-group">
              <Link to="/auth/login" className="login-saas-signin-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
        <div className="login-saas-right">
          <img src="/sign-in.png" alt="" className="login-saas-image" />
        </div>
      </div>
    </div>
  );
}
