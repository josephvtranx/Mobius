// Platform-admin sign-in (Mobius employees). Separate realm from tenant login
// — no institution, registry-backed token via adminService.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '@/services/adminService';

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
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
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f1420', color: '#e8ecf5' }}>
      <form onSubmit={submit} style={{ width: 360, background: '#182031', border: '1px solid #263049', borderRadius: 14, padding: 28 }}>
        <div style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: '#8fa3c8' }}>Mobius</div>
        <h1 style={{ margin: '4px 0 20px', fontSize: 24 }}>Platform admin</h1>
        <label style={{ fontSize: 13, color: '#a9b6d1' }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mobius.com" autoFocus
          style={{ width: '100%', margin: '6px 0 14px', padding: '10px 12px', borderRadius: 8, border: '1px solid #2d3856', background: '#0f1420', color: '#e8ecf5' }} />
        <label style={{ fontSize: 13, color: '#a9b6d1' }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password"
          style={{ width: '100%', margin: '6px 0 18px', padding: '10px 12px', borderRadius: 8, border: '1px solid #2d3856', background: '#0f1420', color: '#e8ecf5' }} />
        {error && <div style={{ color: '#ff8a8a', fontSize: 14, marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={busy || !email || !password}
          style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: '#5b8cff', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
