// v2 classes list (template — plain markup; UI polish is a later pass).
// Staff console entry point for the /api/classes domain.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classService from '@/services/classService';

function ClassesList() {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    classService.getAllClasses()
      .then(setClasses)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load classes'));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Classes (v2)</h1>
      <p><Link to="/operations/classes/new">+ New class</Link></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border="1" cellPadding="6">
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
              <td>{c.class_type}</td>
              <td>{c.enrolled}/{c.student_limit}</td>
              <td>{c.session_credit_cost}</td>
              <td>{c.recurrence}</td>
              <td>{c.status}</td>
            </tr>
          ))}
          {classes.length === 0 && !error && (
            <tr><td colSpan="7">No classes yet — create one.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ClassesList;
