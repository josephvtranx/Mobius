// Template-grade editor for the v2 recurrence_rule byday rows
// ({ day, start, end }); shared by CreateClass and ClassDetail's schedule edit.
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function BydayEditor({ byday, onChange }) {
  const update = (i, field, value) => {
    const next = byday.map((row, idx) => (idx === i ? { ...row, [field]: value } : row));
    onChange(next);
  };
  const addRow = () => onChange([...byday, { day: 'mon', start: '16:00', end: '17:00' }]);
  const removeRow = (i) => onChange(byday.filter((_, idx) => idx !== i));

  return (
    <div>
      {byday.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <select value={row.day} onChange={(e) => update(i, 'day', e.target.value)}>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="time" value={row.start} onChange={(e) => update(i, 'start', e.target.value)} />
          <input type="time" value={row.end} onChange={(e) => update(i, 'end', e.target.value)} />
          <button type="button" onClick={() => removeRow(i)}>remove</button>
        </div>
      ))}
      <button type="button" onClick={addRow}>+ add day/time</button>
    </div>
  );
}

export default BydayEditor;
