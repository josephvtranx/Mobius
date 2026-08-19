// Per-academy settings editor (admin console). Server-driven: the config GET's
// `editable` array decides which knobs render; adminKnobs.js decorates them
// with groups/labels/descriptions. Draft-based — only changed keys are sent.
// Suspend/reactivate and the per-knob change history from the design are NOT
// rendered yet: their backends don't exist (see PROD_READINESS_GOAL / gap
// audit) — add them here when those land.
import { useEffect, useState } from 'react';
import adminService from '@/services/adminService';
import { KNOB_GROUPS, logoGradient, initialsOf } from './adminKnobs';

const MONO = "'IBM Plex Mono',monospace";

export default function ConfigEditor({ academy, onClose, onChanged }) {
  const { code, name, is_active } = academy;
  const [data, setData] = useState(null);        // { editable, settings }
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState({});
  const [savedMsg, setSavedMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(null);  // 'suspend' | 'reactivate' | null
  const [deleteTyped, setDeleteTyped] = useState('');
  const [dangerBusy, setDangerBusy] = useState(false);
  const [dangerErr, setDangerErr] = useState('');

  const setStatus = async (active) => {
    setDangerBusy(true); setDangerErr('');
    try {
      await adminService.setStatus(code, active);
      setConfirming(null);
      await onChanged();
    } catch (err) {
      setDangerErr(err.response?.data?.message || 'Failed to update status');
    } finally {
      setDangerBusy(false);
    }
  };

  const doDelete = async () => {
    setDangerBusy(true); setDangerErr('');
    try {
      await adminService.deleteInstitution(code, deleteTyped);
      await onChanged();
      onClose();
    } catch (err) {
      setDangerErr(err.response?.data?.message || 'Failed to delete academy');
      setDangerBusy(false);
    }
  };

  const load = () => {
    setData(null); setFailed(false); setDraft({}); setSavedMsg('');
    adminService.getConfig(code).then(setData).catch(() => setFailed(true));
  };
  useEffect(load, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirtyN = Object.keys(draft).length;
  const setKey = (k, v) => { setDraft((p) => ({ ...p, [k]: v })); setSavedMsg(''); };

  const save = async () => {
    if (!dirtyN) { onClose(); return; }
    setBusy(true); setSavedMsg('');
    try {
      const { settings } = await adminService.patchConfig(code, draft);
      setData((d) => ({ ...d, settings }));
      setDraft({});
      setSavedMsg('Saved.');
    } catch (err) {
      setSavedMsg(''); setFailed(false);
      setData((d) => ({ ...d, error: err.response?.data?.message || 'Save failed' }));
    } finally {
      setBusy(false);
    }
  };

  const box = { marginTop: 18, border: '1px solid #e5e3de', borderRadius: 14, background: '#fff', overflow: 'hidden' };

  if (failed) {
    return (
      <div style={box}>
        <div style={{ padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#b23a2f', marginBottom: 6 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 9, color: '#9c6a1d' }} />
            Academy not found or unreachable
          </div>
          <p style={{ margin: '0 auto 16px', fontSize: 12.5, color: '#8a8577', maxWidth: '52ch' }}>
            The console couldn't reach {code}'s database. Settings can't be read or written until the connection recovers.
          </p>
          <button onClick={load} style={{ height: 36, padding: '0 18px', borderRadius: 10, border: '1px solid #e5e3de',
            background: '#faf9f7', color: '#1c1c1c', fontWeight: 600, fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer' }}>
            Retry connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={box}>
        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map((i) => <div key={i} className="ad-skel" style={{ height: 40 }} />)}
        </div>
      </div>
    );
  }

  const editable = new Set(data.editable);
  // Groups from the metadata, filtered to server-editable keys; any editable
  // key the metadata doesn't know yet still renders (raw label, inferred type).
  const known = new Set(KNOB_GROUPS.flatMap((g) => g.items.map((k) => k.key)));
  const extras = data.editable.filter((k) => !known.has(k));
  const groups = KNOB_GROUPS
    .map((g) => ({ ...g, items: g.items.filter((k) => editable.has(k.key)) }))
    .filter((g) => g.items.length);
  if (extras.length) {
    groups.push({
      name: 'Other', items: extras.map((key) => ({
        key, label: key, desc: '',
        type: typeof data.settings[key] === 'boolean' ? 'toggle' : 'number', min: 0,
      })),
    });
  }
  const valOf = (k) => (k in draft ? draft[k] : data.settings[k]);

  return (
    <div style={box}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '18px 22px', borderBottom: '1px solid #e5e3de', flexWrap: 'wrap' }}>
        <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 9, background: logoGradient(code),
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
          {initialsOf(name)}
        </span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Configure <span style={{ fontFamily: MONO }}>{code}</span></div>
          <div style={{ fontSize: 12, color: '#8a8577' }}>{name} · changes apply on save, only edited keys are sent</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => { setConfirming(is_active ? 'suspend' : 'reactivate'); setDangerErr(''); }}
            style={{ height: 34, padding: '0 14px', borderRadius: 9, border: '1px solid #ecc8c3', background: '#fdf1ef',
              color: '#b23a2f', fontWeight: 600, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>
            {is_active ? 'Suspend academy' : 'Reactivate academy'}
          </button>
          <button onClick={onClose} aria-label="Close configuration"
            style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid #e5e3de', background: '#faf9f7', color: '#8a8577', cursor: 'pointer' }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      </div>

      {confirming && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 22px',
          borderBottom: '1px solid #ecc8c3', background: '#fdf1ef', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#b23a2f' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }} />
            {confirming === 'suspend'
              ? `Suspend ${code}? All logins for this academy are blocked and its payments leave the finance totals. Data is kept.`
              : `Reactivate ${code}? Its staff, instructors and families can log in again, and its payments rejoin the totals.`}
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <button disabled={dangerBusy} onClick={() => setStatus(confirming === 'reactivate')}
              style={{ height: 32, padding: '0 14px', borderRadius: 8, border: 'none', background: '#b23a2f', color: '#fff',
                fontWeight: 600, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', opacity: dangerBusy ? 0.6 : 1 }}>
              {confirming === 'suspend' ? 'Confirm suspend' : 'Confirm reactivate'}
            </button>
            <button onClick={() => setConfirming(null)}
              style={{ height: 32, padding: '0 14px', borderRadius: 8, border: '1px solid #e5e3de', background: 'none',
                color: '#8a8577', fontWeight: 500, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>Cancel</button>
          </span>
        </div>
      )}

      {!is_active && (
        <div style={{ padding: '14px 22px', borderBottom: '1px solid #f0eee8', background: '#faf9f7' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#b23a2f', marginBottom: 6 }}>
            Danger zone
          </div>
          <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#8a8577', maxWidth: '72ch' }}>
            Deleting <strong style={{ fontFamily: MONO }}>{code}</strong> removes it from the platform: every login stops
            working immediately and it disappears from this console. Its database is detached and kept for manual
            recovery, but the platform treats it as gone. Type the academy code to confirm.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="ad-in" value={deleteTyped} onChange={(e) => setDeleteTyped(e.target.value.toUpperCase())}
              placeholder={`Type ${code} to confirm`} style={{ width: 240, fontFamily: MONO }} />
            <button disabled={dangerBusy || deleteTyped.trim().toUpperCase() !== code.toUpperCase()} onClick={doDelete}
              style={{ height: 38, padding: '0 16px', borderRadius: 9, border: 'none', background: '#b23a2f', color: '#fff',
                fontWeight: 600, fontSize: 12.5, fontFamily: 'inherit',
                cursor: deleteTyped.trim().toUpperCase() === code.toUpperCase() ? 'pointer' : 'default',
                opacity: dangerBusy || deleteTyped.trim().toUpperCase() !== code.toUpperCase() ? 0.45 : 1 }}>
              {dangerBusy ? 'Deleting…' : 'Delete academy'}
            </button>
          </div>
        </div>
      )}

      {dangerErr && (
        <div role="alert" style={{ padding: '10px 22px', fontSize: 13, color: '#b23a2f', borderBottom: '1px solid #f0eee8' }}>{dangerErr}</div>
      )}

      <div style={{ padding: '8px 22px 4px' }}>
        {groups.map((g) => (
          <div key={g.name} style={{ padding: '14px 0 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ font: `600 11px ${MONO}`, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a8577' }}>{g.name}</span>
              {g.dormant && (
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase',
                  color: '#9c6a1d', border: '1px solid #ecdcbb', background: '#fff8ea', borderRadius: 5, padding: '1px 7px' }}>Not yet active</span>
              )}
            </div>
            {g.items.map((k) => {
              const cur = valOf(k.key);
              const dirty = k.key in draft;
              return (
                <div key={k.key} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 0', borderBottom: '1px solid #f0eee8' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{k.label}</span>
                      {k.dormant && (
                        <span title="Editable and saved, but no academy feature reads this yet"
                          style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase',
                            color: '#9c6a1d', border: '1px solid #ecdcbb', background: '#fff8ea', borderRadius: 4, padding: '1px 6px' }}>dormant</span>
                      )}
                      {dirty && (
                        <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase',
                          color: '#1c1c1c', border: '1px solid #d5d2c9', background: '#f3f2ee', borderRadius: 4, padding: '1px 6px' }}>edited</span>
                      )}
                    </div>
                    {k.desc && <div style={{ fontSize: 12, color: '#8a8577', marginTop: 3 }}>{k.desc}</div>}
                  </div>
                  {k.type === 'toggle' && (
                    <button onClick={() => setKey(k.key, !cur)} role="switch" aria-checked={cur === true} aria-label={k.label}
                      className="ad-knob"
                      style={{ width: 46, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', position: 'relative',
                        background: cur === true ? '#1c1c1c' : '#d5d2c9', flexShrink: 0 }}>
                      <span style={{ position: 'absolute', top: 3, left: cur === true ? 23 : 3, width: 20, height: 20,
                        borderRadius: '50%', background: '#fff', transition: 'left .15s ease', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
                    </button>
                  )}
                  {k.type === 'number' && (
                    <input type="number" className="ad-num" aria-label={k.label} min={k.min ?? 0}
                      value={cur ?? ''} onChange={(e) => {
                        const raw = e.target.value;
                        setKey(k.key, raw === '' ? '' : Math.max(k.min ?? 0, parseInt(raw, 10) || 0));
                      }} />
                  )}
                  {k.type === 'select' && (
                    <select className="ad-sel" aria-label={k.label} value={cur ?? ''} onChange={(e) => setKey(k.key, e.target.value)}>
                      {(k.options || []).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 22px', borderTop: '1px solid #e5e3de', background: '#faf9f7' }}>
        <button onClick={save} disabled={busy} className="ad-btn"
          style={{ height: 40, padding: '0 22px', borderRadius: 10, border: 'none', background: '#1c1c1c', color: '#fff',
            fontWeight: 600, fontSize: 13.5, fontFamily: 'inherit', cursor: 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Saving…' : dirtyN ? `Save ${dirtyN} change${dirtyN > 1 ? 's' : ''}` : 'Close'}
        </button>
        <span role="status" aria-live="polite" style={{ fontSize: 13, color: '#1f8a4c' }}>{savedMsg}</span>
        {data.error && <span role="alert" style={{ fontSize: 13, color: '#b23a2f' }}>{data.error}</span>}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#b3aea4' }}>
          {dirtyN ? `${dirtyN} unsaved edit${dirtyN > 1 ? 's' : ''}` : 'No unsaved edits'}
        </span>
      </div>
    </div>
  );
}
