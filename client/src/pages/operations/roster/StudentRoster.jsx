// Student roster (design handoff: Mobius Staff.dc.html "## Roster" — student
// tab). Real data from /students/roster, unchanged; table chrome rebuilt
// onto roster.css's grid pattern with status/class-chip/day-dot styling
// matching the design. Status filter chips are derived from whatever status
// values the real data actually contains, not hardcoded to the design's
// four-value demo set.
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { tintFor, toneFor } from '@/lib/rosterColors';
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
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
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

  useEffect(() => {
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
  }, []);

  const requestSort = (key) => {
    setSortConfig((c) => ({ key, direction: c.key === key && c.direction === 'ascending' ? 'descending' : 'ascending' }));
  };
  const toggleRow = (id) => setExpandedRows((p) => ({ ...p, [id]: !p[id] }));

  const statuses = ['All', ...new Set(students.map((s) => s.status).filter(Boolean))];
  const filtered = filter === 'All' ? students : students.filter((s) => s.status === filter);
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
      <header className="hm-greeting">
        <h1>Student roster</h1>
        <p>Every enrolled student, contacts, classes and weekly schedule.</p>
      </header>

      {statuses.length > 1 && (
        <div className="rt-filters">
          {statuses.map((s) => (
            <button key={s} type="button" className={`rt-filter ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

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
                <div className="rt-row" style={{ display: 'block', padding: '10px 16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', marginBottom: 12 }}>
                    {s.studentPhone && <span className="rt-cell">Student: {s.studentPhone}</span>}
                    {s.parentNames.length === 0 && <span className="rt-cell">No guardian linked yet.</span>}
                    {s.parentNames.map((name, i) => (
                      <span key={i} className="rt-cell">
                        {name}{s.parentEmails[i] ? ` · ${s.parentEmails[i]}` : ''}{s.parentPhones[i] ? ` · ${s.parentPhones[i]}` : ''}
                      </span>
                    ))}
                  </div>
                  {/* Staff guardian-linking (GRD-2): links an existing guardian by email,
                      or creates + links a new one when a name is given. */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <span className="rt-sub" style={{ fontWeight: 600 }}>Link a guardian:</span>
                    <input
                      type="email"
                      placeholder="guardian email (required)"
                      value={gForm[s.id]?.email || ''}
                      onChange={(e) => patchForm(s.id, { email: e.target.value })}
                      style={{ minWidth: 200 }}
                    />
                    <input
                      type="text"
                      placeholder="name (for a new guardian)"
                      value={gForm[s.id]?.name || ''}
                      onChange={(e) => patchForm(s.id, { name: e.target.value })}
                      style={{ minWidth: 160 }}
                    />
                    <input
                      type="text"
                      placeholder="relationship (e.g. parent)"
                      value={gForm[s.id]?.relationship || ''}
                      onChange={(e) => patchForm(s.id, { relationship: e.target.value })}
                      style={{ minWidth: 150 }}
                    />
                    <button
                      type="button"
                      className="hm-btn"
                      disabled={gBusy[s.id] || !gForm[s.id]?.email?.trim()}
                      onClick={() => linkGuardian(s)}
                    >
                      {gBusy[s.id] ? 'Linking…' : 'Link'}
                    </button>
                    {gMsg[s.id] && (
                      <span className="rt-sub" style={{ color: gMsg[s.id].ok ? 'var(--status-success)' : 'var(--status-error, #c0392b)' }}>
                        {gMsg[s.id].text}
                      </span>
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
