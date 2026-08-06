// Settings (design handoff: every app's "## Settings" section — a page
// header, a "Personal" hm-card with a divided icon-row list, an Edit
// button that swaps to a form). Guardian's "Linked children" section
// (real data: guardianPortalService) uses the same divided-row pattern.
import { useEffect, useState } from 'react';
import api from '@/services/api';
import ProfilePictureUpload from '@/components/ProfilePictureUpload';
import authService from '@/services/authService';
import guardianPortalService from '@/services/guardianPortalService';
import '@/css/home.css';

const PREF_MODES = ['all', 'billing_only', 'digest'];
const inputStyle = { width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)', marginBottom: 10 };

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [children, setChildren] = useState(null);
  const [prefNotice, setPrefNotice] = useState('');

  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        setUser(res.data);
        setFormData({ name: res.data.name, email: res.data.email, phone: res.data.phone || '' });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to fetch profile data'))
      .finally(() => setIsLoading(false));

    const u = authService.getCurrentUser();
    setCurrentUser(u);
    if (u?.role === 'guardian') {
      guardianPortalService.getPortal().then((p) => setChildren(p.children)).catch(() => {});
    }
  }, []);

  const setNotificationMode = async (studentId, mode) => {
    setPrefNotice('');
    try {
      await guardianPortalService.setPrefs(studentId, { mode });
      setPrefNotice(`Notifications for that child set to "${mode.replace('_', ' ')}".`);
      setTimeout(() => setPrefNotice(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save notification preference');
    }
  };

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.patch('/users/profile', formData);
      setUser(res.data.user || res.data);
      setIsEditing(false);
      setSuccess('Profile updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) return <div className="hm-page"><div className="hm-loading">Loading…</div></div>;
  if (!user) return <div className="hm-page"><div className="hm-error">{error || 'Failed to load profile'}</div></div>;

  return (
    <div className="hm-page" style={{ maxWidth: 860 }}>
      <header className="hm-greeting">
        <h1>Settings</h1>
        <p>Your personal account.</p>
      </header>

      {error && <div className="hm-error">{error}</div>}
      {success && <div className="hm-card" style={{ color: 'var(--status-success)' }}>{success}</div>}

      <section className="hm-card">
        <div className="hm-card-head"><h2>Profile picture</h2></div>
        <ProfilePictureUpload
          currentUser={currentUser}
          onUploadSuccess={(imageUrl) => setCurrentUser((prev) => ({ ...prev, profile_pic_url: imageUrl }))}
        />
      </section>

      <section className="hm-card">
        <div className="hm-card-head">
          <h2>Personal</h2>
          {!isEditing && <button type="button" className="hm-btn primary" onClick={() => setIsEditing(true)}><i className="fa-solid fa-pen" style={{ marginRight: 7 }}></i>Edit</button>}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <label className="hm-kpi-label">Name</label>
            <input style={inputStyle} type="text" name="name" value={formData.name} onChange={handleChange} required />
            <label className="hm-kpi-label">Email</label>
            <input style={inputStyle} type="email" name="email" value={formData.email} onChange={handleChange} required />
            <label className="hm-kpi-label">Phone</label>
            <input style={inputStyle} type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            <div className="hm-actions">
              <button type="submit" className="hm-btn primary">Save changes</button>
              <button
                type="button"
                className="hm-btn"
                onClick={() => { setIsEditing(false); setFormData({ name: user.name, email: user.email, phone: user.phone || '' }); }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="hm-divided">
            <div className="hm-divided-row">
              <i className="fa-solid fa-user"></i>
              <span className="hm-divided-label">Full name</span>
              <span className="hm-divided-value">{user.name}</span>
            </div>
            <div className="hm-divided-row">
              <i className="fa-solid fa-envelope"></i>
              <span className="hm-divided-label">Email</span>
              <span className="hm-divided-value">{user.email}</span>
            </div>
            <div className="hm-divided-row">
              <i className="fa-solid fa-phone"></i>
              <span className="hm-divided-label">Phone</span>
              <span className="hm-divided-value">{user.phone || 'Not provided'}</span>
            </div>
            <div className="hm-divided-row">
              <i className="fa-solid fa-shield-halved"></i>
              <span className="hm-divided-label">Role</span>
              <span className="hm-divided-value" style={{ textTransform: 'capitalize' }}>{user.role}</span>
            </div>
          </div>
        )}
      </section>

      {currentUser?.role === 'guardian' && children && (
        <section className="hm-card">
          <div className="hm-card-head"><h2>Linked children</h2></div>
          {prefNotice && <p style={{ color: 'var(--status-success)', fontSize: 13, marginBottom: 10 }}>{prefNotice}</p>}
          {children.length ? (
            <div className="hm-divided">
              {children.map((c) => (
                <div key={c.student_id} className="hm-divided-row">
                  <i className="fa-solid fa-graduation-cap"></i>
                  <span className="hm-divided-label" style={{ width: 'auto', flex: 1 }}>
                    {c.name}{c.is_primary ? ' (primary)' : ''}
                  </span>
                  <label style={{ fontSize: 12.5, color: 'var(--shell-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Notifications
                    <select
                      defaultValue="all"
                      className="hm-btn"
                      style={{ height: 32, fontSize: 12.5 }}
                      onChange={(e) => setNotificationMode(c.student_id, e.target.value)}
                    >
                      {PREF_MODES.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          ) : <div className="hm-empty">No linked students yet.</div>}
        </section>
      )}
    </div>
  );
}

export default Profile;
