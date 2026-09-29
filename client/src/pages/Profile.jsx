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
import '@/css/profile-settings.css';

const PREF_MODES = ['all', 'billing_only', 'digest'];

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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get('/users/profile')
      .then((res) => {
        setUser(res.data);
        // Keep only public profile fields in browser storage (not password hashes).
        const cached = authService.getCurrentUser() || {};
        const fresh = { ...cached, name: res.data.name, profile_pic_url: res.data.profile_pic_url };
        setCurrentUser(fresh);
        authService.setCurrentUser(fresh);
        window.dispatchEvent(new CustomEvent('profile-updated'));
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
    setIsSaving(true);
    try {
      const res = await api.patch('/users/profile', formData);
      const updated = res.data.user || res.data;
      setUser(updated);
      const cached = authService.getCurrentUser() || {};
      const fresh = { ...cached, name: updated.name, profile_pic_url: updated.profile_pic_url };
      setCurrentUser(fresh);
      authService.setCurrentUser(fresh);
      window.dispatchEvent(new CustomEvent('profile-updated'));
      setIsEditing(false);
      setSuccess('Profile updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="hm-page"><div className="hm-loading">Loading…</div></div>;
  if (!user) return <div className="hm-page"><div className="hm-error">{error || 'Failed to load profile'}</div></div>;

  return (
    <div className="settings-page">
      {error && (
        <div className="hm-error settings-notice" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error"><i className="fa-solid fa-xmark" /></button>
        </div>
      )}
      {success && <div className="settings-notice settings-notice--success"><i className="fa-solid fa-check" />{success}</div>}

      <div className="settings-layout">
        <section className="settings-photo">
          <header className="settings-section-head">
            <div>
              <h2>Profile photo</h2>
            </div>
          </header>
          <ProfilePictureUpload
            currentUser={currentUser}
            onUploadSuccess={(imageUrl) => setCurrentUser((prev) => ({ ...prev, profile_pic_url: imageUrl }))}
          />
        </section>

        <section className="settings-personal">
          <header className="settings-section-head settings-section-head--actions">
            <div>
              <h2>Account details</h2>
            </div>
            {!isEditing && (
              <button type="button" className="settings-edit" onClick={() => setIsEditing(true)}>
                <i className="fa-solid fa-pen" /> Edit details
              </button>
            )}
          </header>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="settings-form">
            <label>
              <span>Full name</span>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required autoFocus />
            </label>
            <label>
              <span>Email address</span>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </label>
            <label>
              <span>Phone number <small>Optional</small></span>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Add a phone number" />
            </label>
            <div className="settings-form-actions">
              <button type="submit" className="hm-btn primary" disabled={isSaving}>
                {isSaving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : 'Save changes'}
              </button>
              <button
                type="button"
                className="hm-btn"
                disabled={isSaving}
                onClick={() => { setIsEditing(false); setFormData({ name: user.name, email: user.email, phone: user.phone || '' }); }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="settings-detail-list">
            <div className="settings-detail-row">
              <span className="settings-detail-icon"><i className="fa-solid fa-user" /></span>
              <span><small>Full name</small><strong>{user.name}</strong></span>
            </div>
            <div className="settings-detail-row">
              <span className="settings-detail-icon"><i className="fa-solid fa-envelope" /></span>
              <span><small>Email address</small><strong>{user.email}</strong></span>
            </div>
            <div className="settings-detail-row">
              <span className="settings-detail-icon"><i className="fa-solid fa-phone" /></span>
              <span><small>Phone number</small><strong className={!user.phone ? 'is-muted' : ''}>{user.phone || 'Not provided'}</strong></span>
            </div>
            <div className="settings-detail-row">
              <span className="settings-detail-icon"><i className="fa-solid fa-shield-halved" /></span>
              <span><small>Account role</small><strong className="settings-role">{user.role}</strong></span>
            </div>
          </div>
        )}
        </section>
      </div>

      {currentUser?.role === 'guardian' && children && (
        <section className="settings-children">
          <header className="settings-section-head">
            <div><h2>Linked children</h2></div>
          </header>
          {prefNotice && <p className="settings-pref-notice">{prefNotice}</p>}
          {children.length ? (
            <div className="settings-detail-list">
              {children.map((c) => (
                <div key={c.student_id} className="settings-child-row">
                  <span className="settings-detail-icon"><i className="fa-solid fa-graduation-cap" /></span>
                  <strong>
                    {c.name}{c.is_primary ? ' (primary)' : ''}
                  </strong>
                  <label>
                    Notifications
                    <select
                      defaultValue="all"
                      onChange={(e) => setNotificationMode(c.student_id, e.target.value)}
                    >
                      {PREF_MODES.map((m) => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                    </select>
                  </label>
                </div>
              ))}
            </div>
          ) : <div className="settings-empty">No linked students yet.</div>}
        </section>
      )}
    </div>
  );
}

export default Profile;
