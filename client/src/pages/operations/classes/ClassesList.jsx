// v2 classes list (template — plain markup; UI polish is a later pass).
// Staff console entry point for the /api/classes domain.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classService from '@/services/classService';
import EnrollmentWizard from './EnrollmentWizard';
import '@/css/attendance.css';
import '@/css/table.css';

function ClassesList() {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);

  const load = () => {
    classService.getAllClasses()
      .then(setClasses)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load classes'));
  };
  useEffect(load, []);

  return (
    <div className="at-page" style={{ maxWidth: 960 }}>
      <div className="hm-card-head" style={{ marginBottom: 12 }}>
        <h1 className="at-title" style={{ margin: 0 }}>Classes</h1>
        <div className="hm-actions">
          <button type="button" className="hm-btn" onClick={() => setWizardOpen(true)}>+ Enroll student</button>
          <Link className="hm-btn primary" to="/operations/classes/new">+ New class</Link>
        </div>
      </div>
      <EnrollmentWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} onDone={load} />
      {error && <div className="hm-error">{error}</div>}
      <div className="hm-table-wrap">
        <table className="hm-table">
          <thead>
            <tr>
              <th>Subject</th><th>Instructor</th><th>Type</th><th>Enrolled</th>
              <th>Cost</th><th>Recurrence</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.class_id}>
                <td><Link to={`/operations/classes/${c.class_id}`}>{c.subject}</Link></td>
                <td>{c.instructor}</td>
                <td style={{ textTransform: 'capitalize' }}>{c.class_type.replace(/_/g, ' ')}</td>
                <td>{c.enrolled}/{c.student_limit}</td>
                <td>{c.session_credit_cost}</td>
                <td>{c.recurrence}</td>
                <td><span className={`status-pill status-pill--${c.status === 'active' ? 'success' : 'warning'}`}>{c.status}</span></td>
              </tr>
            ))}
            {classes.length === 0 && !error && (
              <tr><td colSpan="7">No classes yet — create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClassesList;
