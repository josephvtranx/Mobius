// New student (staff, from the roster) — deliberately JUST the data entry
// the backend needs: student fields + optional guardian. Re-evaluated
// 2026-08-20: class placement is NOT this modal's job — enrollment already
// lives on Classes (direct add), Scheduling (add subject) and the catalog
// (join requests), and packages/payment live on Finance > Payments. The
// earlier 4-step wizard (availability paint -> smart match -> confirm & pay)
// was retired in favor of this; /instructors/match stays server-side for the
// scheduling surfaces to use.
//
// Guardian is optional (adult students exist — GRD-4); when any guardian
// field is filled, name + email become required (email is the account key).
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import onboardingService from '@/services/onboardingService';
import '@/css/roster.css';

const label = { display: 'block', fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: '#97a0b1', marginBottom: 6 };
const input = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 10, border: '1px solid #e6e9f0', fontFamily: 'inherit', fontSize: 13.5 };

const EMPTY = {
  student: { name: '', grade: '', school: '', date_of_birth: '', email: '' },
  guardian: { name: '', relationship: '', phone: '', email: '' },
};

function NewStudentModal({ isOpen, onClose, onDone }) {
  const [student, setStudent] = useState(EMPTY.student);
  const [guardian, setGuardian] = useState(EMPTY.guardian);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setStudent(EMPTY.student);
    setGuardian(EMPTY.guardian);
    setError('');
    setDone(null);
  }, [isOpen]);

  const guardianTouched = Object.values(guardian).some((v) => v.trim() !== '');
  const valid = student.name.trim() && student.grade !== ''
    && (!guardianTouched || (guardian.name.trim() && guardian.email.trim()));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const created = await onboardingService.createStudent({
        name: student.name.trim(),
        grade: Number(student.grade),
        school: student.school.trim() || undefined,
        date_of_birth: student.date_of_birth || undefined,
        email: student.email.trim() || undefined,
      });
      if (guardianTouched) {
        await onboardingService.linkGuardian(created.student_id, {
          email: guardian.email.trim(),
          name: guardian.name.trim(),
          phone: guardian.phone.trim() || undefined,
          relationship: guardian.relationship.trim() || undefined,
        });
      }
      setDone({
        name: student.name.trim(),
        body: guardianTouched
          ? `${student.name.trim()} was added with ${guardian.name.trim()} as primary guardian. `
            + 'Enroll them from Classes or Scheduling; record their first package on Payments.'
          : `${student.name.trim()} was added with no guardian${student.email.trim() ? '' : ' and no login email'}. `
            + 'Enroll them from Classes or Scheduling; record their first package on Payments.',
      });
      onDone?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the student');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {done ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '18px 8px' }}>
          <span style={{ width: 60, height: 60, borderRadius: 18, background: '#e9f5ee', color: '#2c8a5b',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            <i className="fa-solid fa-check" />
          </span>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Student created</div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#5c4632', maxWidth: '44ch', lineHeight: 1.55 }}>{done.body}</p>
          <button type="button" className="rt-btn-primary" style={{ height: 38, marginTop: 6 }} onClick={onClose}>Done</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>New student</div>
            <div style={{ fontSize: 12.5, color: '#6b7587' }}>
              Just the account details — enrollment and payment happen on their own pages.
            </div>
          </div>

          {error && <div className="hm-error" style={{ marginBottom: 12 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label><span style={label}>Student name *</span>
              <input style={input} value={student.name} onChange={(e) => setStudent((s) => ({ ...s, name: e.target.value }))} /></label>
            <label><span style={label}>Grade *</span>
              <input style={input} type="number" min="1" max="12" value={student.grade} onChange={(e) => setStudent((s) => ({ ...s, grade: e.target.value }))} /></label>
            <label><span style={label}>School (optional)</span>
              <input style={input} value={student.school} onChange={(e) => setStudent((s) => ({ ...s, school: e.target.value }))} /></label>
            <label><span style={label}>Date of birth</span>
              <input style={input} type="date" value={student.date_of_birth} onChange={(e) => setStudent((s) => ({ ...s, date_of_birth: e.target.value }))} /></label>
            <label style={{ gridColumn: '1 / -1' }}><span style={label}>Student email (optional — their own login)</span>
              <input style={input} type="email" value={student.email} onChange={(e) => setStudent((s) => ({ ...s, email: e.target.value }))} /></label>
          </div>

          <div style={{ margin: '16px 0 10px', paddingTop: 14, borderTop: '1px solid #eef0f5', fontSize: 12.5, color: '#6b7587' }}>
            Guardian — the family's login and billing contact. Leave blank for adult students.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label><span style={label}>Guardian name{guardianTouched ? ' *' : ''}</span>
              <input style={input} value={guardian.name} onChange={(e) => setGuardian((g) => ({ ...g, name: e.target.value }))} /></label>
            <label><span style={label}>Relationship</span>
              <input style={input} placeholder="e.g. mother" value={guardian.relationship} onChange={(e) => setGuardian((g) => ({ ...g, relationship: e.target.value }))} /></label>
            <label><span style={label}>Guardian phone</span>
              <input style={input} value={guardian.phone} onChange={(e) => setGuardian((g) => ({ ...g, phone: e.target.value }))} /></label>
            <label><span style={label}>Guardian email{guardianTouched ? ' *' : ''}</span>
              <input style={input} type="email" value={guardian.email} onChange={(e) => setGuardian((g) => ({ ...g, email: e.target.value }))} /></label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, marginTop: 18 }}>
            <button type="button" className="hm-btn" style={{ height: 38 }} onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="rt-btn-primary" style={{ height: 38, opacity: valid && !busy ? 1 : 0.5 }} disabled={!valid || busy}>
              {busy ? 'Creating…' : 'Create student'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default NewStudentModal;
