// Template-grade editor for the v2 recurrence_rule byday rows
// ({ day, start, end }); shared by CreateClass and ClassDetail's schedule edit.
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const fieldStyle = { padding: 7, borderRadius: 8, border: '1px solid var(--shell-border)' };

function BydayEditor({ byday, onChange }) {
  const update = (i, field, value) => {
    const next = byday.map((row, idx) => (idx === i ? { ...row, [field]: value } : row));
    onChange(next);
  };
  const addRow = () => onChange([...byday, { day: 'mon', start: '16:00', end: '17:00' }]);
  const removeRow = (i) => onChange(byday.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {byday.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select style={fieldStyle} value={row.day} onChange={(e) => update(i, 'day', e.target.value)}>
            {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input style={fieldStyle} type="time" value={row.start} onChange={(e) => update(i, 'start', e.target.value)} />
          <input style={fieldStyle} type="time" value={row.end} onChange={(e) => update(i, 'end', e.target.value)} />
          <button type="button" className="hm-btn" style={{ height: 34, fontSize: 12.5 }} onClick={() => removeRow(i)}>Remove</button>
        </div>
      ))}
      <button type="button" className="hm-btn" style={{ alignSelf: 'flex-start' }} onClick={addRow}>+ Add day/time</button>
    </div>
  );
}

export default BydayEditor;
