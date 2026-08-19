// Platform-admin sign-in (Mobius employees). Separate realm from tenant login
// — no institution, registry-backed token via adminService. Dark by design:
// this is the platform layer, not a tenant app.
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import adminService from '@/services/adminService';
import '@/css/admin.css';

export default function AdminLogin() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const expired = params.get('expired') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Email and password are required.'); return; }
    setBusy(true); setError('');
    try {
      await adminService.login(email.trim(), password);
      nav('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(800px 500px at 50% -10%,#182031 0,#0f1420 60%)',
      fontFamily: "'Noto Sans KR',system-ui,sans-serif", color: '#e8ecf5', padding: 24 }}>
      <div style={{ width: 'min(420px,100%)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#8fa3c8' }}>Mobius · Platform admin</div>
          <h1 style={{ margin: '8px 0 0', fontSize: 30, fontWeight: 600, letterSpacing: '-.02em' }}>Console</h1>
        </div>
        <form onSubmit={submit} style={{ background: '#182031', border: '1px solid #263049', borderRadius: 18, padding: '32px 30px' }}>
          {expired && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#8fa3c8',
              background: '#0f1420', border: '1px solid #263049', borderRadius: 11, padding: '12px 14px', marginBottom: 18 }}>
              <i className="fa-regular fa-clock" style={{ color: '#5b8cff', marginTop: 2 }} />
              Your session ended after 120 minutes. Sign in again to continue.
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="ad-email" style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#8fa3c8', marginBottom: 7 }}>Email</label>
            <input id="ad-email" className="adl-in" type="email" placeholder="you@mobius.dev" autoFocus
              value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="ad-pass" style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: '#8fa3c8', marginBottom: 7 }}>Password</label>
            <input id="ad-pass" className="adl-in" type="password" placeholder="••••••••"
              value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />
          </div>
          {error && (
            <div role="alert" style={{ fontSize: 13, color: '#ff9a9a', border: '1px solid #5a2b2b',
              background: 'rgba(90,43,43,.18)', borderRadius: 10, padding: '10px 13px', marginTop: 10 }}>{error}</div>
          )}
          <button type="submit" disabled={busy} style={{ width: '100%', height: 46, marginTop: 20, border: 'none',
            borderRadius: 11, background: '#5b8cff', color: '#0f1420', fontWeight: 600, fontSize: 14,
            fontFamily: 'inherit', cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#5c6d92', marginTop: 18 }}>
          Internal tool · platform accounts only
        </div>
      </div>
    </div>
  );
}
