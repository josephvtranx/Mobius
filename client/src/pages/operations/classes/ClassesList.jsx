// Staff Classes grid per the design handoff (Mobius Staff.dc.html CLASSES
// view): subject filter chips + New class up top (no page title — the topbar
// crumb already says Classes), then tinted class cards with schedule line,
// seats-filled bar and Open class. The handoff's "level" pill has no schema
// source — the class type (Group / One-on-one) fills that slot, and a status
// chip joins it for non-active classes. The handoff's edit pencil is omitted:
// no class-edit page exists yet, so the card's one action is Open class.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import classService from '@/services/classService';
import subjectService from '@/services/subjectService';
import { lookFor } from '@/lib/subjectLooks';
import { scheduleLabel } from '@/lib/recurrenceLabel';
import EnrollmentWizard from './EnrollmentWizard';
import '@/css/my-classes.css';

function ClassesList() {
  const [classes, setClasses] = useState(null);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [error, setError] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
  const [q, setQ] = useState('');
  const subjectPickerRef = useRef(null);

  const load = async () => {
    setError('');
    try {
      const classRows = await classService.getAllClasses();
      const catalog = await subjectService.getAllSubjectGroups();
      setClasses(classRows);
      setSubjectGroups(catalog);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load classes');
    }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    const closeSubjectMenu = (event) => {
      if (event.key === 'Escape') {
        setSubjectMenuOpen(false);
        return;
      }
      if (event.type === 'pointerdown' && !subjectPickerRef.current?.contains(event.target)) {
        setSubjectMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeSubjectMenu);
    document.addEventListener('keydown', closeSubjectMenu);
    return () => {
      document.removeEventListener('pointerdown', closeSubjectMenu);
      document.removeEventListener('keydown', closeSubjectMenu);
    };
  }, []);

  if (error && !classes) {
    return (
      <div className="hm-error" style={{ textAlign: 'center', padding: '64px 20px' }}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 24 }} />
        <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 14 }}>Couldn't load classes</div>
        <div style={{ fontSize: 13.5, marginTop: 6 }}>{error}</div>
      </div>
    );
  }
  if (!classes) return <div className="hm-loading">Loading…</div>;

  const subjects = subjectGroups.flatMap((group) => group.subjects || []);
  const needle = q.trim().toLowerCase();
  const selectedSubject = subjects.find((subject) => String(subject.subject_id) === filter);
  const shown = classes
    .filter((c) => filter === 'all' || String(c.subject_id) === filter)
    .filter((c) => !needle || `${c.subject} ${c.instructor}`.toLowerCase().includes(needle));

  return (
    <div className="hm-page">
      <EnrollmentWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} onDone={load} />
      {error && <div className="hm-error" style={{ marginBottom: 14 }}>{error}</div>}

      <div className="cl-controls">
        <div className="cl-control-row">
          <div className="cl-subject-picker" ref={subjectPickerRef}>
            <button
              type="button"
              className="cl-subject-trigger"
              aria-label="Filter classes by subject"
              aria-haspopup="listbox"
              aria-expanded={subjectMenuOpen}
              onClick={() => setSubjectMenuOpen((open) => !open)}
            >
              <i className="fa-solid fa-book-open" aria-hidden="true" />
              <span>{selectedSubject?.name || 'All subjects'}</span>
              <i className={`fa-solid fa-chevron-down cl-select-chevron${subjectMenuOpen ? ' open' : ''}`} aria-hidden="true" />
            </button>
            {subjectMenuOpen && (
              <div className="cl-subject-menu" role="listbox" aria-label="Subjects">
                <button
                  type="button"
                  className={`cl-subject-option${filter === 'all' ? ' selected' : ''}`}
                  role="option"
                  aria-selected={filter === 'all'}
                  onClick={() => {
                    setFilter('all');
                    setSubjectMenuOpen(false);
                  }}
                >
                  <span>All subjects</span>
                  {filter === 'all' && <i className="fa-solid fa-check" aria-hidden="true" />}
                </button>
                {subjectGroups.map((group) => (
                  <div className="cl-subject-group" role="group" aria-labelledby={`cl-subject-group-${group.group_id}`} key={group.group_id}>
                    <div className="cl-subject-group-label" id={`cl-subject-group-${group.group_id}`}>{group.name}</div>
                    {(group.subjects || []).map((subject) => {
                      const subjectId = String(subject.subject_id);
                      const selected = filter === subjectId;
                      return (
                        <button
                          type="button"
                          className={`cl-subject-option${selected ? ' selected' : ''}`}
                          role="option"
                          aria-selected={selected}
                          key={subject.subject_id}
                          onClick={() => {
                            setFilter(subjectId);
                            setSubjectMenuOpen(false);
                          }}
                        >
                          <span>{subject.name}</span>
                          {selected && <i className="fa-solid fa-check" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="cl-result-count" aria-live="polite">
            <strong>{shown.length}</strong>
            {shown.length === classes.length ? ' classes' : ` of ${classes.length} classes`}
          </p>
          <label className="cl-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search classes"
              aria-label="Search classes"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
          </label>
          <div className="cl-actions">
            <button type="button" className="hm-btn" onClick={() => setWizardOpen(true)}>
              <i className="fa-solid fa-user-plus" aria-hidden="true" />
              Enroll student
            </button>
            <Link className="hm-btn primary" to="/operations/classes/new">
              <i className="fa-solid fa-plus" aria-hidden="true" />
              New class
            </Link>
          </div>
        </div>
      </div>

      {shown.length === 0 && (
        <div className="hm-empty" style={{ textAlign: 'center', padding: '64px 20px' }}>
          <i className="fa-solid fa-book-open" style={{ fontSize: 26, color: '#c4a98e' }} />
          <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 14 }}>
            {classes.length === 0 ? 'No classes this term' : needle ? `No classes match "${q.trim()}"` : `No ${selectedSubject?.name || 'matching'} classes`}
          </div>
          <div style={{ fontSize: 13.5, color: '#7d6a5c', marginTop: 6 }}>
            {classes.length === 0 ? 'Create your first class — students can then request to join.' : 'Try another subject filter.'}
          </div>
          {classes.length === 0 && (
            <Link className="hm-btn primary" style={{ margin: '18px auto 0', display: 'inline-flex' }} to="/operations/classes/new">
              <i className="fa-solid fa-plus" style={{ marginRight: 8 }} />New class
            </Link>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 18 }}>
        {shown.map((c) => {
          const look = lookFor(c.subject);
          const full = c.enrolled >= c.student_limit;
          const pct = c.student_limit ? Math.min(100, Math.round((c.enrolled / c.student_limit) * 100)) : 0;
          return (
            <div key={c.class_id} className="hm-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 70, background: look.band, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 18px' }}>
                <span style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(255,255,255,.85)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: look.accent }}>
                  <i className={look.icon} />
                </span>
                <span style={{ display: 'flex', gap: 6 }}>
                  {c.status !== 'active' && (
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: c.status === 'pending' ? '#8a5c14' : '#7d6a5c',
                      background: 'rgba(255,255,255,.85)', padding: '5px 11px', borderRadius: 999, textTransform: 'capitalize' }}>
                      {c.status}
                    </span>
                  )}
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: look.accent,
                    background: 'rgba(255,255,255,.85)', padding: '5px 11px', borderRadius: 999 }}>
                    {c.class_type === 'one_on_one' ? 'One-on-one' : 'Group'}
                  </span>
                </span>
              </div>
              <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{c.subject}</div>
                <div style={{ fontSize: 12.5, color: '#7d6a5c', marginTop: 3 }}>{c.instructor}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '13px 0 14px', fontSize: 12.5, color: '#5c4632' }}>
                  <span><i className="fa-regular fa-calendar" style={{ width: 16, color: '#c4a98e' }} />{scheduleLabel(c)}</span>
                  <span><i className="fa-solid fa-users" style={{ width: 16, color: '#c4a98e' }} />{c.enrolled} of {c.student_limit} seats filled</span>
                  <span><i className="fa-solid fa-coins" style={{ width: 16, color: '#c4a98e' }} />{c.session_credit_cost} credits / session</span>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: '#c4a98e' }}>Seats filled</span>
                    <span style={{ fontSize: 12, color: '#7d6a5c' }}>{full ? 'Full — waitlist open' : `${pct}%`}</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 999, background: '#f6ecdf', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, width: `${pct}%`, background: full ? '#8a6d1d' : look.accent }} />
                  </div>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex' }}>
                  <Link className="hm-btn primary" to={`/operations/classes/${c.class_id}`}
                    style={{ flex: 1, justifyContent: 'center', height: 38 }}>
                    <i className="fa-solid fa-arrow-right" style={{ marginRight: 7 }} />Open class
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ClassesList;
