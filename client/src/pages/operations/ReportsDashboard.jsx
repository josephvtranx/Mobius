import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { isoToLocal } from 'mobius-lms';
import reportService from '@/services/reportService';
import '@/css/home.css';
import '@/css/reports.css';

const pct = (rate) => rate == null ? '—' : `${Math.round(rate * 100)}%`;
const labels = {
  join_request: 'Join requests', leave_request: 'Leave requests', delinquent_balance: 'Low balances',
  reschedule_escalation: 'Reschedule escalations', booking_escalation: 'Booking escalations',
  instructor_termination_request: 'Termination requests', auto_complete_verify: 'Attendance verification',
  note_unlock_request: 'Note unlock requests', appeal_review: 'Appeal reviews', other: 'Other tasks',
};
function Rate({ value }) {
  return <div className="rp-rate"><span>{pct(value)}</span><span className="rp-track" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, (value ?? 0) * 100))}%` }} /></span></div>;
}
function Empty({ children }) { return <p className="rp-empty">{children}</p>; }
function ReportsDashboard() {
  const [dash, setDash] = useState(null);
  const [notes, setNotes] = useState(null);
  const [days, setDays] = useState(30);
  const [dashError, setDashError] = useState('');
  const [noteError, setNoteError] = useState('');
  const [dashLoading, setDashLoading] = useState(true);
  const [noteLoading, setNoteLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('instructor');
  const [missingLimit, setMissingLimit] = useState(20);
  const dashRequest = useRef(0);
  const noteRequest = useRef(0);
  const loadDash = useCallback(async () => {
    const id = ++dashRequest.current;
    setDashLoading(true); setDashError('');
    try { const data = await reportService.getDashboard(); if (id === dashRequest.current) setDash(data); }
    catch (err) { if (id === dashRequest.current) setDashError(err.response?.data?.message || 'Could not load operational reports.'); }
    finally { if (id === dashRequest.current) setDashLoading(false); }
  }, []);
  const loadNotes = useCallback(async () => {
    const id = ++noteRequest.current;
    setNoteLoading(true); setNoteError(''); setMissingLimit(20);
    try { const data = await reportService.getNoteCompletion(days); if (id === noteRequest.current) setNotes(data); }
    catch (err) { if (id === noteRequest.current) setNoteError(err.response?.data?.message || 'Could not load note completion.'); }
    finally { if (id === noteRequest.current) setNoteLoading(false); }
  }, [days]);
  useEffect(() => { loadDash(); return () => { dashRequest.current++; }; }, [loadDash]);
  useEffect(() => { loadNotes(); return () => { noteRequest.current++; }; }, [loadNotes]);
  const loading = dashLoading || noteLoading;
  const activeNotes = !noteLoading && !noteError ? notes : null;
  const totals = activeNotes?.by_instructor.reduce((sum, row) => ({marked: sum.marked + row.marked, noted: sum.noted + row.noted}), {marked:0,noted:0});
  const rows = (activeNotes?.[group === 'instructor' ? 'by_instructor' : 'by_class'] ?? [])
    .filter((row) => `${row.instructor} ${row.subject ?? ''}`.toLowerCase().includes(query.toLowerCase().trim()))
    .sort((a,b) => (a.rate ?? 0) - (b.rate ?? 0) || b.marked - a.marked);
  const instructorNames = new Map((activeNotes?.by_instructor ?? []).map(row => [row.instructor_id, row.instructor]));
  const missing = (activeNotes?.missing ?? []).map(row => ({ ...row, instructor: row.instructor ?? instructorNames.get(row.instructor_id) })).filter((row) => `${row.instructor ?? ''} ${row.subject} ${row.student ?? ''}`.toLowerCase().includes(query.toLowerCase().trim()));
  const operational = !dashLoading && !dashError ? dash : null;
  const openTasks = operational?.pending_requests_aging.reduce((n, task) => n + task.open, 0);

  return <div className="hm-page rp-page">
    <div className="rp-intro"><p>Track academic follow-through and the work that needs attention.</p><button className="hm-btn" disabled={loading} onClick={() => { loadDash(); loadNotes(); }}>Refresh reports</button></div>
    <div className="rp-summary">
      <div><span>Note completion</span><strong>{totals ? pct(totals.marked ? totals.noted / totals.marked : null) : '—'}</strong><small>Trailing {days} days · student-sessions</small></div>
      <div><span>Missing notes</span><strong>{activeNotes ? activeNotes.missing.length : '—'}</strong><small>Attendance marked, note not yet written</small></div>
      <div><span>Open staff tasks</span><strong>{openTasks ?? '—'}</strong><Link to="/operations/tasks">Review task inbox →</Link></div>
      <div><span>Attendance to verify</span><strong>{operational?.auto_completed_pending.count ?? '—'}</strong><Link to="/operations/attendance">Review attendance →</Link></div>
    </div>

    <section className="hm-card rp-section" aria-labelledby="note-report-title">
      <div className="rp-section-head"><div><h2 id="note-report-title">Note completion</h2><p>Written notes ÷ attendance-marked student-sessions. Lowest completion first.</p></div>
        <label className="rp-window">Note reporting window<select aria-label="Note reporting window" value={days} onChange={(e) => setDays(Number(e.target.value))}>{[7,30,60,90,365].map((n)=><option key={n} value={n}>Last {n} days</option>)}</select></label>
      </div>
      <div className="rp-controls"><div role="group" aria-label="Group note report"><button aria-pressed={group==='instructor'} onClick={()=>setGroup('instructor')}>By instructor</button><button aria-pressed={group==='class'} onClick={()=>setGroup('class')}>By class</button></div>
        <input type="search" aria-label="Filter note report" placeholder="Filter instructor or subject…" value={query} onChange={(e)=>{setQuery(e.target.value);setMissingLimit(20);}} />
      </div>
      {noteLoading ? <p className="rp-empty" role="status">Loading note report…</p> : noteError ? <div className="hm-error" role="alert">{noteError} <button className="hm-btn" onClick={loadNotes}>Retry note report</button></div> : <>
        {rows.length ? <div className="rp-table-wrap"><table className="rp-table"><caption className="rp-sr">Note completion over the last {days} days</caption><thead><tr><th>{group==='class'?'Class / instructor':'Instructor'}</th><th>Written</th><th>Marked</th><th>Completion</th></tr></thead><tbody>{rows.map((r)=><tr key={r.class_id ?? r.instructor_id}><td>{group==='class'?<><Link to={`/operations/classes/${r.class_id}`}>{r.subject}</Link><small>{r.instructor}</small></>:r.instructor}</td><td>{r.noted}</td><td>{r.marked}</td><td><Rate value={r.rate}/></td></tr>)}</tbody></table></div> : <Empty>{query?'No instructors or classes match this filter.':'No attendance-marked student-sessions in this window.'}</Empty>}
        <details className="rp-missing"><summary>Review missing notes <span>{missing.length}</span></summary>
          {missing.length ? <><div className="rp-table-wrap"><table className="rp-table"><thead><tr><th>Class / instructor</th><th>Student</th><th>Session</th><th>Action</th></tr></thead><tbody>{missing.slice(0,missingLimit).map((r)=><tr key={`${r.session_id}-${r.student_id}`}><td>{r.subject}<small>{r.instructor ?? 'View session for instructor'}</small></td><td>{r.student ?? `Student #${r.student_id}`}</td><td>{r.starts_at ? isoToLocal(r.starts_at).toFormat('LLL d, yyyy · h:mm a') : 'View session'}</td><td><Link to={`/operations/classes/${r.class_id}/sessions/${r.session_id}/attendance`}>Review session →</Link></td></tr>)}</tbody></table></div>{missingLimit<missing.length&&<button className="hm-btn" onClick={()=>setMissingLimit(n=>n+20)}>Show 20 more</button>}</> : <Empty>No missing notes match this view.</Empty>}
        </details>
      </>}
    </section>

    {dashError && <div className="hm-error" role="alert">{dashError} <button className="hm-btn" onClick={loadDash}>Retry operational reports</button></div>}
    {dashLoading ? <p role="status">Loading operational reports…</p> : operational && <>
      <section className="hm-card rp-section"><div className="rp-section-head"><div><h2>Instructor cancellations</h2><p>Trailing 60 days · cancelled by instructor ÷ completed or instructor-cancelled sessions.</p></div><span className="rp-tag">60 days</span></div>
        {operational.instructor_cancel_rate.length ? <div className="rp-table-wrap"><table className="rp-table"><thead><tr><th>Instructor</th><th>Cancelled</th><th>Sessions</th><th>Cancellation rate</th></tr></thead><tbody>{[...operational.instructor_cancel_rate].sort((a,b)=>(b.rate??0)-(a.rate??0)).map(r=><tr key={r.instructor_id}><td>{r.instructor}</td><td>{r.cancelled}</td><td>{r.taught}</td><td><Rate value={r.rate}/></td></tr>)}</tbody></table></div>:<Empty>No completed or instructor-cancelled sessions in this window.</Empty>}
      </section>
      <div className="rp-grid">
        <section className="hm-card rp-section"><div className="rp-section-head"><div><h2>Balance follow-ups</h2><p>Open delinquency tasks · current wallet balances in credits.</p></div><Link to="/operations/wallets">Wallets →</Link></div>
          {operational.delinquency_queue.length ? <div className="rp-table-wrap"><table className="rp-table"><thead><tr><th>Student</th><th>Credits</th><th>Days open</th></tr></thead><tbody>{operational.delinquency_queue.map(r=><tr key={r.task_id}><td>{r.student}</td><td>{r.balance}</td><td>{r.days_open}</td></tr>)}</tbody></table></div>:<Empty>No open balance follow-up tasks.</Empty>}
        </section>
        <section className="hm-card rp-section"><div className="rp-section-head"><div><h2>Task aging</h2><p>Open and in-progress tasks · oldest first.</p></div><Link to="/operations/tasks">Inbox →</Link></div>
          {operational.pending_requests_aging.length ? <div className="rp-table-wrap"><table className="rp-table"><thead><tr><th>Task type</th><th>Open</th><th>Oldest (days)</th></tr></thead><tbody>{operational.pending_requests_aging.map(r=><tr key={r.kind}><td>{labels[r.kind] ?? r.kind.replaceAll('_',' ')}</td><td>{r.open}</td><td>{r.oldest_days}</td></tr>)}</tbody></table></div>:<Empty>No open staff tasks.</Empty>}
        </section>
        <section className="hm-card rp-section"><div className="rp-section-head"><div><h2>Frequent rescheduling</h2><p>At least 3 requests per student in the last 30 days.</p></div><span className="rp-tag">30 days</span></div>
          {operational.serial_movers.length ? <ul className="rp-list">{operational.serial_movers.map(r=><li key={r.student_id}><span>{r.student}</span><strong>{r.requests} requests</strong></li>)}</ul>:<Empty>No students meet this threshold.</Empty>}
        </section>
        <section className="hm-card rp-section"><div className="rp-section-head"><div><h2>Attendance verification</h2><p>Auto-completed sessions awaiting staff review.</p></div><Link to="/operations/tasks">Review queue →</Link></div>
          {operational.auto_completed_pending.count ? <p>{operational.auto_completed_pending.count} sessions need verification. Open the task inbox to review the related work.</p>:<Empty>No auto-completed sessions waiting for review.</Empty>}
        </section>
      </div>
    </>}
    <p className="rp-footnote">These are operational reports, not financial statements. The note window does not change the fixed cancellation and rescheduling windows. Counts come from this academy’s records.</p>
  </div>;
}
export default ReportsDashboard;
