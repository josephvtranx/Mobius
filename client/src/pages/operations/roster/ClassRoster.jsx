// Class roster (subject groups + subjects catalog). Subjects are the building
// blocks used when staff create classes, so this page keeps the hierarchy
// visible without repeating the shell's page title.
import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/Modal';
import api from '@/services/api';
import '@/css/roster.css';

function ClassRoster() {
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [newSubject, setNewSubject] = useState({ name: '', group_id: '' });

  const totalSubjects = useMemo(
    () => subjectGroups.reduce((total, group) => total + (group.subjects?.length || 0), 0),
    [subjectGroups]
  );

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/subject-groups');
      setSubjectGroups(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load subject groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const openSubjectModal = (groupId) => {
    setNewSubject({ name: '', group_id: groupId });
    setShowSubjectModal(true);
  };

  const submitGroup = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/subject-groups', newGroup);
      setShowGroupModal(false);
      setNewGroup({ name: '', description: '' });
      setNotice('Subject group created');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create subject group');
    }
  };

  const submitSubject = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/subjects', newSubject);
      setShowSubjectModal(false);
      setNewSubject({ name: '', group_id: '' });
      setExpandedGroup(newSubject.group_id);
      setNotice('Subject created');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create subject');
    }
  };

  return (
    <div className="rt-page cr-page">
      <div className="cr-toolbar">
        <div>
          <p className="cr-intro">Organize the subjects used to build classes.</p>
          <p className="cr-summary">
            <strong>{subjectGroups.length}</strong> {subjectGroups.length === 1 ? 'group' : 'groups'}
            <span aria-hidden="true">·</span>
            <strong>{totalSubjects}</strong> {totalSubjects === 1 ? 'subject' : 'subjects'}
          </p>
        </div>
        <button type="button" className="hm-btn primary" onClick={() => setShowGroupModal(true)}>
          <i className="fa-solid fa-plus" aria-hidden="true" />
          New subject group
        </button>
      </div>

      {error && (
        <div className="hm-error cr-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="cr-alert-close" aria-label="Dismiss error" onClick={() => setError('')}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
      )}
      {notice && (
        <div className="cr-notice" role="status">
          <i className="fa-solid fa-check" aria-hidden="true" />
          {notice}
        </div>
      )}

      <section className="rt-section cr-section" aria-label="Subject groups">
        <div className="rt-grid rt-head cr-grid cr-head">
          <span>Subject group</span>
          <span>Description</span>
          <span>Subjects</span>
          <span className="cr-actions-heading">Actions</span>
        </div>

        {loading && <div className="cr-empty" role="status">Loading subject groups…</div>}

        {!loading && subjectGroups.map((group) => {
          const subjects = group.subjects || [];
          const isExpanded = expandedGroup === group.group_id;
          const regionId = `subject-group-${group.group_id}`;

          return (
            <div className="cr-group" key={group.group_id}>
              <div className={`rt-grid rt-row cr-grid cr-row${isExpanded ? ' cr-row--expanded' : ''}`}>
                <button
                  type="button"
                  className="cr-group-toggle"
                  aria-expanded={isExpanded}
                  aria-controls={regionId}
                  onClick={() => setExpandedGroup(isExpanded ? null : group.group_id)}
                >
                  <span className="cr-chevron" aria-hidden="true">
                    <i className={`fa-solid fa-chevron-${isExpanded ? 'down' : 'right'}`} />
                  </span>
                  <span className="rt-name">{group.name}</span>
                </button>
                <span className={`rt-cell${group.description ? '' : ' cr-muted'}`}>
                  {group.description || '—'}
                </span>
                <span className="cr-count">
                  <strong>{subjects.length}</strong>
                  <span>{subjects.length === 1 ? 'subject' : 'subjects'}</span>
                </span>
                <button type="button" className="cr-add-subject" onClick={() => openSubjectModal(group.group_id)}>
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                  Add subject
                </button>
              </div>

              {isExpanded && (
                <div className="cr-subjects" id={regionId}>
                  {subjects.length > 0 ? (
                    <div className="cr-subject-list">
                      {subjects.map((subject) => (
                        <span className="cr-subject-chip" key={subject.subject_id}>{subject.name}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="cr-no-subjects">
                      <span>No subjects in this group yet.</span>
                      <button type="button" onClick={() => openSubjectModal(group.group_id)}>Add the first subject</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!loading && subjectGroups.length === 0 && (
          <div className="cr-empty">
            <i className="fa-regular fa-folder-open" aria-hidden="true" />
            <strong>No subject groups yet</strong>
            <span>Create a group first, then add the subjects your academy teaches.</span>
            <button type="button" className="hm-btn primary" onClick={() => setShowGroupModal(true)}>
              Create subject group
            </button>
          </div>
        )}
      </section>

      <Modal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)}>
        <form className="cr-modal" onSubmit={submitGroup}>
          <div className="cr-modal-heading">
            <div>
              <h2>Create subject group</h2>
              <p>Group related subjects so the class catalog stays easy to browse.</p>
            </div>
            <button type="button" className="cr-modal-close" aria-label="Close" onClick={() => setShowGroupModal(false)}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
          <label className="cr-field">
            <span>Group name</span>
            <input
              type="text"
              placeholder="e.g. Mathematics"
              required
              autoFocus
              value={newGroup.name}
              onChange={(event) => setNewGroup((group) => ({ ...group, name: event.target.value }))}
            />
          </label>
          <label className="cr-field">
            <span>Description <small>Optional</small></span>
            <textarea
              placeholder="A short description of this subject area"
              value={newGroup.description}
              onChange={(event) => setNewGroup((group) => ({ ...group, description: event.target.value }))}
            />
          </label>
          <div className="cr-modal-actions">
            <button type="button" className="hm-btn" onClick={() => setShowGroupModal(false)}>Cancel</button>
            <button type="submit" className="hm-btn primary">Create group</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSubjectModal} onClose={() => setShowSubjectModal(false)}>
        <form className="cr-modal" onSubmit={submitSubject}>
          <div className="cr-modal-heading">
            <div>
              <h2>Add subject</h2>
              <p>Add a subject to {subjectGroups.find((group) => group.group_id === newSubject.group_id)?.name || 'this group'}.</p>
            </div>
            <button type="button" className="cr-modal-close" aria-label="Close" onClick={() => setShowSubjectModal(false)}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>
          <label className="cr-field">
            <span>Subject name</span>
            <input
              type="text"
              placeholder="e.g. Algebra"
              required
              autoFocus
              value={newSubject.name}
              onChange={(event) => setNewSubject((subject) => ({ ...subject, name: event.target.value }))}
            />
          </label>
          <div className="cr-modal-actions">
            <button type="button" className="hm-btn" onClick={() => setShowSubjectModal(false)}>Cancel</button>
            <button type="submit" className="hm-btn primary">Add subject</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClassRoster;
