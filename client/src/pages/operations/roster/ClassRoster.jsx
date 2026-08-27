// Class roster (subject groups + subjects catalog). Not part of the Mobius
// Staff.dc.html design — the design's "Roster" only covers Student/
// Instructor/Staff — but this manages real data (subjects must exist
// before a class can reference one), so it's restyled onto the shared
// hm-*/roster.css visual language rather than removed.
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import api from '@/services/api';
import '@/css/roster.css';

function ClassRoster() {
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [newSubject, setNewSubject] = useState({ name: '', group_id: '' });

  const load = () => {
    api.get('/subject-groups')
      .then((res) => setSubjectGroups(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load subject groups'));
  };
  useEffect(load, []);

  const submitGroup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/subject-groups', newGroup);
      setShowGroupModal(false);
      setNewGroup({ name: '', description: '' });
      setNotice('Subject group created.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subject group');
    }
  };

  const submitSubject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/subjects', newSubject);
      setShowSubjectModal(false);
      setNewSubject({ name: '', group_id: '' });
      setNotice('Subject created.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subject');
    }
  };

  return (
    <div className="rt-page">
      {/* No in-page title — the topbar crumb already says "Class roster". */}
      <div className="rt-toolbar">
        <p style={{ margin: 0, marginRight: 'auto', fontSize: 13.5, color: 'var(--shell-muted, #64827e)' }}>
          Subject groups and the subjects classes are built from.
        </p>
        <button type="button" className="hm-btn primary" onClick={() => setShowGroupModal(true)}>
          <i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i>New subject group
        </button>
      </div>

      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)' }}>{notice}</div>}

      <section className="rt-section">
        <div className="rt-grid rt-head" style={{ gridTemplateColumns: '1.2fr 2fr 140px' }}>
          <span>Subject group</span>
          <span>Description</span>
          <span>Actions</span>
        </div>
        {subjectGroups.map((group) => (
          <div key={group.group_id}>
            <div
              className="rt-grid rt-row rt-row--clickable"
              style={{ gridTemplateColumns: '1.2fr 2fr 140px' }}
              onClick={() => setExpandedSubject(expandedSubject === group.group_id ? null : group.group_id)}
            >
              <span className="rt-name">{group.name}</span>
              <span className="rt-cell">{group.description}</span>
              <button
                type="button"
                className="hm-btn"
                style={{ height: 30, fontSize: 12.5 }}
                onClick={(e) => { e.stopPropagation(); setNewSubject({ name: '', group_id: group.group_id }); setShowSubjectModal(true); }}
              >
                <i className="fa-solid fa-plus" style={{ marginRight: 6 }}></i>Add class
              </button>
            </div>
            {expandedSubject === group.group_id && (
              <div style={{ padding: '4px 16px 14px', background: 'var(--shell-wash, #f7fbfa)' }}>
                {group.subjects && group.subjects.length > 0 ? (
                  <ul className="hm-list">
                    {group.subjects.map((subject) => (
                      <li key={subject.subject_id}><span>{subject.name}</span></li>
                    ))}
                  </ul>
                ) : (
                  <div className="hm-empty">
                    No subjects in this group yet.
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        className="hm-btn primary"
                        onClick={() => { setNewSubject({ name: '', group_id: group.group_id }); setShowSubjectModal(true); }}
                      >
                        Add subject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {subjectGroups.length === 0 && <div className="hm-empty">No subject groups yet.</div>}
      </section>

      <Modal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)}>
        <form className="sc-modal" onSubmit={submitGroup}>
          <h2>Create subject group</h2>
          <input
            type="text" placeholder="Name" required value={newGroup.name}
            onChange={(e) => setNewGroup((g) => ({ ...g, name: e.target.value }))}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)', margin: '10px 0 8px' }}
          />
          <textarea
            placeholder="Description (optional)" value={newGroup.description}
            onChange={(e) => setNewGroup((g) => ({ ...g, description: e.target.value }))}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)', minHeight: 70 }}
          />
          <div className="hm-actions" style={{ marginTop: 12 }}>
            <button type="button" className="hm-btn" onClick={() => setShowGroupModal(false)}>Cancel</button>
            <button type="submit" className="hm-btn primary">Create</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSubjectModal} onClose={() => setShowSubjectModal(false)}>
        <form className="sc-modal" onSubmit={submitSubject}>
          <h2>Create subject</h2>
          <input
            type="text" placeholder="Name" required value={newSubject.name}
            onChange={(e) => setNewSubject((s) => ({ ...s, name: e.target.value }))}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)', margin: '10px 0' }}
          />
          <div className="hm-actions">
            <button type="button" className="hm-btn" onClick={() => setShowSubjectModal(false)}>Cancel</button>
            <button type="submit" className="hm-btn primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClassRoster;
