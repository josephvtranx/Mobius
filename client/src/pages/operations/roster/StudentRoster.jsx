// Student roster (design handoff: Mobius Staff.dc.html "## Roster" — student
// tab). Real data from /students/roster, unchanged; table chrome rebuilt
// onto roster.css's grid pattern with status/class-chip/day-dot styling
// matching the design. Status filter chips are derived from whatever status
// values the real data actually contains, not hardcoded to the design's
// four-value demo set.
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { tintFor, toneFor } from '@/lib/rosterColors';
import NewStudentModal from './NewStudentModal';
import '@/css/roster.css';

const DAY_MAP = { mon: 'M', tue: 'T', wed: 'W', thu: 'Th', fri: 'F', sat: 'Sa', sun: 'Su' };
const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function scheduledDays(schedule) {
  const set = new Set();
  for (const s of schedule || []) {
    if (!s.days) continue;
    const days = typeof s.days === 'string' ? s.days.split(',').map((d) => d.trim()) : s.days;
    for (const d of days) {
      const letter = DAY_MAP[d.toLowerCase()];
      if (letter) set.add(letter);
    }
  }
  return set;
}

function StudentRoster() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [newStudentOpen, setNewStudentOpen] = useState(false);
  // Per-student guardian-link form state (keyed by student id).
  const [gForm, setGForm] = useState({});
  const [gMsg, setGMsg] = useState({});
  const [gBusy, setGBusy] = useState({});

  const patchForm = (id, patch) => setGForm((p) => ({ ...p, [id]: { ...(p[id] || {}), ...patch } }));

  const linkGuardian = async (s) => {
    const f = gForm[s.id] || {};
    if (!f.email?.trim()) return;
    setGBusy((p) => ({ ...p, [s.id]: true }));
    setGMsg((p) => ({ ...p, [s.id]: null }));
    try {
      await api.post(`/students/${s.id}/guardians`, {
        email: f.email.trim(),
        name: f.name?.trim() || undefined,
        relationship: f.relationship?.trim() || undefined,
      });
      setStudents((prev) => prev.map((x) => x.id === s.id
        ? { ...x, parentNames: [...x.parentNames, f.name?.trim() || f.email.trim()] } : x));
      setGForm((p) => ({ ...p, [s.id]: {} }));
      setGMsg((p) => ({ ...p, [s.id]: { text: 'Guardian linked.', ok: true } }));
    } catch (err) {
      setGMsg((p) => ({ ...p, [s.id]: { text: err.response?.data?.message || 'Could not link guardian', ok: false } }));
    } finally {
      setGBusy((p) => ({ ...p, [s.id]: false }));
    }
  };

  const load = () => {
    api.get('/students/roster')
      .then((res) => {
        setStudents((res.data || []).map((s) => ({
          id: s.id || '',
          name: s.name || '',
          studentEmail: s.studentEmail || '',
          studentPhone: s.studentPhone || '',
          parentNames: s.parentNames || [],
          parentEmails: s.parentEmails || [],
          parentPhones: s.parentPhones || [],
          instructors: s.instructors || [],
          status: s.status || '',
          enrolledClasses: s.enrolledClasses || [],
          schedule: s.schedule || [],
        })));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to fetch student roster'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const requestSort = (key) => {
    setSortConfig((c) => ({ key, direction: c.key === key && c.direction === 'ascending' ? 'descending' : 'ascending' }));
  };
  const toggleRow = (id) => setExpandedRows((p) => ({ ...p, [id]: !p[id] }));

  const statuses = ['All', ...new Set(students.map((s) => s.status).filter(Boolean))];
  const needle = q.trim().toLowerCase();
  const filtered = students
    .filter((s) => filter === 'All' || s.status === filter)
    .filter((s) => !needle ||
      `${s.name} ${s.studentEmail} ${s.parentNames.join(' ')} ${s.instructors.join(' ')}`.toLowerCase().includes(needle));
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortConfig.key] ?? '';
    const bv = b[sortConfig.key] ?? '';
    if (av < bv) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (av > bv) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });
  const sortIcon = (key) => sortConfig.key !== key ? '' : (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓');

  if (loading) return <div className="rt-page"><div className="hm-loading">Loading student roster…</div></div>;
  if (error) return <div className="rt-page"><div className="hm-error">{error}</div></div>;

  return (
    <div className="rt-page">
      {/* No in-page title — the topbar crumb already says "Student roster". */}
      <div className="rt-filterbar">
        {statuses.length > 1 && (
          <div className="rt-filters">
            {statuses.map((s) => (
              <button key={s} type="button" className={`rt-filter ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <label className="rt-search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input type="text" placeholder="Filter by name, email, guardian, tutor…" aria-label="Filter students"
            value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <button type="button" className="rt-btn-primary" onClick={() => setNewStudentOpen(true)}>
          <i className="fa-solid fa-user-plus" style={{ marginRight: 7 }} />Add student
        </button>
      </div>

      <NewStudentModal isOpen={newStudentOpen} onClose={() => setNewStudentOpen(false)} onDone={load} />

      <section className="rt-section">
        <div className="rt-grid rt-grid--student rt-head">
          <span onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>Name{sortIcon('name')}</span>
          <span className="rt-hide">Contacts</span>
          <span>Instructor</span>
          <span style={{ textAlign: 'center' }}>Status</span>
          <span>Classes</span>
          <span>Schedule</span>
        </div>

        {sorted.map((s) => {
          const days = scheduledDays(s.schedule);
          const tone = toneFor(s.status);
          return (
            <div key={s.id}>
              <div className="rt-grid rt-grid--student rt-row rt-row--clickable" onClick={() => toggleRow(s.id)}>
                <span className="rt-name">{s.name}</span>
                <div className="rt-contact rt-hide">
                  <span className="rt-cell">{s.studentEmail}</span>
                  {s.parentNames[0] && <span className="rt-sub">P: {s.parentNames[0]}</span>}
                </div>
                <span className="rt-cell">{s.instructors.join(', ') || '—'}</span>
                <span className="rt-pill" style={{ background: tone.bg, color: tone.fg, justifySelf: 'center' }}>{s.status || '—'}</span>
                <div className="rt-chips">
                  {s.enrolledClasses.map((c, i) => (
                    <span key={i} className="rt-chip" style={{ background: tintFor(c).bg, color: tintFor(c).fg }}>{c}</span>
                  ))}
                  {s.enrolledClasses.length === 0 && <span className="rt-cell">—</span>}
                </div>
                <div className="rt-days">
                  {WEEK.map((l, i) => (
                    <span key={i} className={`rt-day ${days.has(l) ? 'rt-day--on' : 'rt-day--off'}`} title={l}>{l}</span>
                  ))}
                </div>
              </div>
              {expandedRows[s.id] && (
                <div className="rt-expand">
                  <div>
                    <div className="rt-expand-label">Guardians</div>
                    {s.parentNames.length === 0 && (
                      <div className="rt-cell" style={{ whiteSpace: 'normal' }}>
                        No guardian linked yet — link one on the right.
                      </div>
                    )}
                    {s.parentNames.map((name, i) => {
                      const tint = tintFor(name);
                      return (
                        <div key={i} className="rt-person">
                          <span className="rt-avatar" style={{ background: tint.bg, color: tint.fg }}>
                            {String(name || '?').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div className="rt-person-name">{name}</div>
                            <div className="rt-person-sub">
                              {[s.parentEmails[i], s.parentPhones[i]].filter(Boolean).join(' · ') || 'No contact on file'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {s.studentPhone && (
                      <>
                        <div className="rt-expand-label" style={{ marginTop: 14 }}>Student contact</div>
                        <div className="rt-cell">{s.studentPhone}</div>
                      </>
                    )}
                  </div>

                  {/* Staff guardian-linking (GRD-2): links an existing guardian by
                      email, or creates + links a new one when a name is given. */}
                  <div>
                    <div className="rt-expand-label">Link a guardian</div>
                    <div className="rt-person-sub" style={{ marginBottom: 10 }}>
                      An existing guardian's email links them directly; add a name to create a new guardian account.
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <input
                        type="email"
                        className="rt-input"
                        placeholder="Guardian email"
                        aria-label="Guardian email (required)"
                        value={gForm[s.id]?.email || ''}
                        onChange={(e) => patchForm(s.id, { email: e.target.value })}
                        style={{ flex: '1 1 200px' }}
                      />
                      <input
                        type="text"
                        className="rt-input"
                        placeholder="Name (new guardian only)"
                        aria-label="Guardian name"
                        value={gForm[s.id]?.name || ''}
                        onChange={(e) => patchForm(s.id, { name: e.target.value })}
                        style={{ flex: '1 1 160px' }}
                      />
                      <input
                        type="text"
                        className="rt-input"
                        placeholder="Relationship (e.g. parent)"
                        aria-label="Relationship"
                        value={gForm[s.id]?.relationship || ''}
                        onChange={(e) => patchForm(s.id, { relationship: e.target.value })}
                        style={{ flex: '1 1 150px' }}
                      />
                      <button
                        type="button"
                        className="rt-btn-primary"
                        disabled={gBusy[s.id] || !gForm[s.id]?.email?.trim()}
                        onClick={() => linkGuardian(s)}
                      >
                        {gBusy[s.id] ? 'Linking…' : 'Link guardian'}
                      </button>
                    </div>
                    {gMsg[s.id] && (
                      <div className="rt-person-sub" style={{ marginTop: 8, fontWeight: 600,
                        color: gMsg[s.id].ok ? 'var(--status-success, #2c8a5b)' : 'var(--status-error, #c0392b)' }}>
                        {gMsg[s.id].text}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && <div className="hm-empty">No students match this filter.</div>}
      </section>
    </div>
  );
}

export default StudentRoster;
