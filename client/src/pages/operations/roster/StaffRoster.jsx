// Staff roster (design handoff: Mobius Staff.dc.html "## Roster" — staff
// tab). Real data from /staff/roster, unchanged; only the table chrome is
// rebuilt onto roster.css's grid pattern (design has no weekly schedule
// column for staff, so "Recent time logs" — real data already fetched here
// — fills that slot instead of fabricating a schedule grid).
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { tintFor, toneFor } from '@/lib/rosterColors';
import '@/css/roster.css';

function StaffRoster() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    api.get('/staff/roster')
      .then((res) => {
        setStaff((res.data || []).map((m) => ({
          id: m.id || '',
          name: m.name || '',
          contact: m.contact || '',
          phone: m.phone || '',
          department: m.department || '',
          employmentStatus: m.employmentStatus || '',
          salary: m.salary || 0,
          hourlyRate: m.hourlyRate || 0,
          totalHoursWorked: m.totalHoursWorked || 0,
          timeLogs: m.timeLogs || [],
        })));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to fetch staff roster'))
      .finally(() => setLoading(false));
  }, []);

  const requestSort = (key) => {
    setSortConfig((c) => ({ key, direction: c.key === key && c.direction === 'ascending' ? 'descending' : 'ascending' }));
  };

  const sorted = [...staff].sort((a, b) => {
    const av = a[sortConfig.key] ?? '';
    const bv = b[sortConfig.key] ?? '';
    if (av < bv) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (av > bv) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  });
  const sortIcon = (key) => sortConfig.key !== key ? '' : (sortConfig.direction === 'ascending' ? ' ↑' : ' ↓');

  const formatCurrency = (n) => typeof n === 'number' ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00';
  const formatHours = (n) => typeof n === 'number' ? n.toFixed(1) : '0.0';
  const toggleRow = (id) => setExpandedRows((p) => ({ ...p, [id]: !p[id] }));

  if (loading) return <div className="rt-page"><div className="hm-loading">Loading staff roster…</div></div>;
  if (error) return <div className="rt-page"><div className="hm-error">{error}</div></div>;

  return (
    <div className="rt-page">
      <header className="hm-greeting">
        <h1>Staff roster</h1>
        <p>Non-teaching staff by department and employment status.</p>
      </header>

      <section className="rt-section">
        <div className="rt-grid rt-grid--staff rt-head">
          <span onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>Staff name{sortIcon('name')}</span>
          <span className="rt-hide" onClick={() => requestSort('contact')} style={{ cursor: 'pointer' }}>Contact{sortIcon('contact')}</span>
          <span style={{ textAlign: 'center' }} onClick={() => requestSort('department')}>Dept{sortIcon('department')}</span>
          <span onClick={() => requestSort('employmentStatus')} style={{ cursor: 'pointer' }}>Status{sortIcon('employmentStatus')}</span>
          <span className="rt-hide2" onClick={() => requestSort('hourlyRate')} style={{ cursor: 'pointer' }}>Rate{sortIcon('hourlyRate')}</span>
          <span className="rt-hide2">Hours</span>
          <span onClick={() => requestSort('salary')} style={{ cursor: 'pointer' }}>Salary{sortIcon('salary')}</span>
          <span>Recent logs</span>
        </div>

        {sorted.map((m) => {
          const tone = toneFor(m.employmentStatus);
          return (
            <div key={m.id}>
              <div
                className="rt-grid rt-grid--staff rt-row rt-row--clickable"
                onClick={() => toggleRow(m.id)}
              >
                <span className="rt-name">{m.name}</span>
                <span className="rt-cell rt-hide">{m.contact}</span>
                <span className="rt-pill" style={{ background: tintFor(m.department).bg, color: tintFor(m.department).fg }}>{m.department || '—'}</span>
                <span className="rt-cell" style={{ fontWeight: 600, color: tone.fg }}>{m.employmentStatus || '—'}</span>
                <span className="rt-cell-strong rt-hide2">{formatCurrency(m.hourlyRate)}</span>
                <span className="rt-cell rt-hide2">{formatHours(m.totalHoursWorked)}</span>
                <span className="rt-cell-strong">{formatCurrency(m.salary)}</span>
                <div className="rt-contact">
                  {m.timeLogs.slice(0, 2).map((log, i) => (
                    <span key={i} className="rt-sub">
                      {new Date(log.clock_in).toLocaleDateString()} · {log.clock_out ? 'done' : 'in progress'}
                    </span>
                  ))}
                  {m.timeLogs.length === 0 && <span className="rt-sub">No logs yet</span>}
                </div>
              </div>
              {expandedRows[m.id] && m.phone && (
                <div className="rt-row" style={{ padding: '8px 16px' }}>
                  <span className="rt-cell">Phone: {m.phone}</span>
                </div>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && <div className="hm-empty">No staff on the roster yet.</div>}
      </section>
    </div>
  );
}

export default StaffRoster;
