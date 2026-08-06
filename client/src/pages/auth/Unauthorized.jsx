// 403 redirect target (ProtectedRoute). Renders inside the normal shell
// chrome (sidebar/topbar) for whichever role is logged in, so it uses the
// same hm-* visual language as every other page rather than a standalone
// Tailwind card unrelated to the rest of the app.
import { useNavigate } from 'react-router-dom';
import '@/css/home.css';

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="hm-page">
      <div className="hm-card" style={{ maxWidth: 420, margin: '40px auto', textAlign: 'center' }}>
        <i className="fa-solid fa-lock" style={{ fontSize: 24, color: 'var(--status-error)' }}></i>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginTop: 14 }}>Access denied</h1>
        <p className="hm-kpi-label" style={{ marginTop: 8 }}>You don't have permission to view that page.</p>
        <button type="button" className="hm-btn primary" style={{ marginTop: 18 }} onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
