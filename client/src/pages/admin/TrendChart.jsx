// Revenue trend (admin console dashboard): smooth bezier line + gradient area,
// 6-month pan windows, multi-select academy dropdown, hover tooltips with a
// per-academy breakdown. Ported from the design handoff (Mobius Admin.dc.html);
// data comes from GET /admin/finance's per-academy monthly `series`.
// SVG <text> is avoided on purpose (per handoff) — labels are HTML overlays.
import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';

const MONO = "'IBM Plex Mono',monospace";
const fmtFull = (n) => '$' + Math.round(n).toLocaleString('en-US');
// Point value labels are always $X.Xk — exact format from the handoff.
const fmtShort = (n) => '$' + (n / 1000).toFixed(1) + 'k';

export default function TrendChart({ academies, onRetry }) {
  const [offset, setOffset] = useState(0);
  const [sel, setSel] = useState([]);            // empty = all active academies
  const [menuOpen, setMenuOpen] = useState(false);
  const [hover, setHover] = useState(null);

  const model = useMemo(() => {
    const now = DateTime.now();
    const thisMonth = now.toFormat('yyyy-MM');
    // Month axis: earliest month with any payment → current month, min 6.
    let earliest = thisMonth;
    for (const a of academies) {
      for (const s of a.series || []) if (s.month < earliest) earliest = s.month;
    }
    let cursor = DateTime.fromFormat(earliest, 'yyyy-MM');
    const monthsBack = Math.max(Math.round(now.startOf('month').diff(cursor.startOf('month'), 'months').months), 5);
    cursor = now.startOf('month').minus({ months: monthsBack });
    const months = Array.from({ length: monthsBack + 1 }, (_, i) => {
      const m = cursor.plus({ months: i });
      return { key: m.toFormat('yyyy-MM'), label: m.toFormat('MMM').toUpperCase(),
        mon: m.toFormat('MMM'), year: m.year, title: m.toFormat('MMM yyyy') };
    });
    const hist = {};
    for (const a of academies) {
      if (a.series == null) { hist[a.code] = null; continue; }
      const byMonth = Object.fromEntries(a.series.map((s) => [s.month, s.total]));
      hist[a.code] = months.map((m) => byMonth[m.key] || 0);
    }
    return { months, hist };
  }, [academies]);

  const N = model.months.length;
  const maxOff = N - 6;
  const off = Math.min(offset, maxOff);
  const start = N - 6 - off;
  const isPartialWindow = off === 0;             // window ends at the in-progress month
  const windowMeta = model.months.slice(start, start + 6);
  const HIST = {};
  for (const c of Object.keys(model.hist)) HIST[c] = model.hist[c] ? model.hist[c].slice(start, start + 6) : null;

  // "Mar – Aug 2026" within one year, "Nov 2025 – Apr 2026" across years.
  const rangeText = windowMeta[0].year === windowMeta[5].year
    ? `${windowMeta[0].mon} – ${windowMeta[5].mon} ${windowMeta[5].year}`
    : `${windowMeta[0].title} – ${windowMeta[5].title}`;
  const isAll = sel.length === 0;
  const chosen = isAll ? academies.filter((a) => a.is_active).map((a) => a.code) : sel;
  const reachableChosen = chosen.filter((c) => HIST[c]);
  const unreachableChosen = chosen.filter((c) => !HIST[c]);
  const sumVals = reachableChosen.length
    ? Array.from({ length: 6 }, (_, i) => reachableChosen.reduce((s, c) => s + HIST[c][i], 0))
    : null;
  const selLabel = isAll ? 'All academies' : sel.length <= 2 ? sel.join(' + ') : `${sel.length} academies`;
  const onlyUnreachable = !isAll && chosen.length > 0 && reachableChosen.length === 0;
  const allZero = sumVals && sumVals.every((x) => x === 0);
  const vals = onlyUnreachable || allZero ? null : sumVals;
  const suspendedInSel = !isAll && chosen.some((c) => academies.find((a) => a.code === c && !a.is_active));

  // Geometry (viewBox 760×250)
  const L = 8, R = 752, T = 26, B = 210;
  let geom = null;
  if (vals) {
    const max = Math.max(...vals, 1);
    let top = 2000;                       // 2k, 5k, then doublings: 10k, 20k, 40k…
    if (max > top) top = 5000;
    while (top < max) top *= 2;
    const X = (i) => L + (R - L) * (i / 5);
    const Y = (v) => B - (v / top) * (B - T);
    const pts = vals.map((val, i) => ({ x: X(i), y: Y(val), val, partial: isPartialWindow && i === 5 }));
    const half = (X(1) - X(0)) / 2;
    const curve = (arr) => arr.map((p, i) => i === 0
      ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
      : `C ${(arr[i - 1].x + half).toFixed(1)} ${arr[i - 1].y.toFixed(1)}, ${(p.x - half).toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const solid = isPartialWindow ? pts.slice(0, -1) : pts;
    const last = pts[5], prev = pts[4];
    geom = {
      grid: [0, 0.25, 0.5, 0.75, 1].map((f) => Y(f * top)),
      linePath: curve(solid),
      partialPath: isPartialWindow
        ? `M ${prev.x.toFixed(1)} ${prev.y.toFixed(1)} C ${(prev.x + half).toFixed(1)} ${prev.y.toFixed(1)}, ${(last.x - half).toFixed(1)} ${last.y.toFixed(1)}, ${last.x.toFixed(1)} ${last.y.toFixed(1)}`
        : '',
      areaPath: `${curve(pts)} L ${last.x.toFixed(1)} ${B} L ${pts[0].x.toFixed(1)} ${B} Z`,
      pts,
    };
  }

  const arrowBtn = (dir, enabled, onClick, label) => (
    <button onClick={enabled ? onClick : undefined} aria-label={label}
      style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e5e3de', background: '#fff',
        color: '#8a8577', cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.35 }}>
      <i className={`fa-solid fa-chevron-${dir}`} style={{ fontSize: 11 }} />
    </button>
  );

  return (
    <section style={{ background: '#fff', border: '1px solid #e5e3de', borderRadius: 14, padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ font: `600 11px ${MONO}`, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8a8577' }}>Revenue trend</span>
        <span title="Summed across all active, reachable academies" style={{ color: '#b3aea4', fontSize: 12 }}><i className="fa-solid fa-circle-info" /></span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {arrowBtn('left', off < maxOff, () => setOffset(off + 1), 'Earlier months')}
          {arrowBtn('right', off > 0, () => setOffset(off - 1), 'Later months')}
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen((v) => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 9, height: 34, padding: '0 14px', borderRadius: 10,
              border: '1px solid #e5e3de', background: '#fff', color: '#1c1c1c', fontWeight: 600, fontSize: 12.5, fontFamily: 'inherit', cursor: 'pointer' }}>
            <i className="fa-solid fa-building-columns" style={{ color: '#8a8577', fontSize: 11 }} />
            {selLabel}
            <i className="fa-solid fa-chevron-down" style={{ color: '#b3aea4', fontSize: 10 }} />
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
              <div style={{ position: 'absolute', right: 0, top: 40, zIndex: 31, width: 250, background: '#fff',
                border: '1px solid #e5e3de', borderRadius: 12, boxShadow: '0 14px 36px -18px rgba(28,28,28,.3)', padding: 6 }}>
                <button onClick={() => setSel([])}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', border: 'none',
                    borderRadius: 8, padding: '9px 10px', cursor: 'pointer', fontWeight: 600, fontSize: 12.5, fontFamily: 'inherit',
                    background: isAll ? '#f0eee8' : 'transparent', color: '#1c1c1c' }}>
                  <i className={isAll ? 'fa-solid fa-square-check' : 'fa-regular fa-square'} style={{ color: isAll ? '#1c1c1c' : '#d5d2c9', fontSize: 14, width: 16 }} />
                  All academies
                  <span style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 500, color: '#b3aea4' }}>active only</span>
                </button>
                <div style={{ height: 1, background: '#f0eee8', margin: '5px 4px' }} />
                {academies.map((a) => {
                  const on = sel.includes(a.code);
                  return (
                    <button key={a.code}
                      onClick={() => setSel((cur) => (cur.includes(a.code) ? cur.filter((c) => c !== a.code) : [...cur, a.code]))}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', border: 'none',
                        borderRadius: 8, padding: '9px 10px', cursor: 'pointer', background: on ? '#faf9f7' : 'transparent', fontFamily: 'inherit' }}>
                      <i className={on ? 'fa-solid fa-square-check' : 'fa-regular fa-square'} style={{ color: on ? '#1c1c1c' : '#d5d2c9', fontSize: 14, width: 16 }} />
                      <span style={{ font: `600 12px ${MONO}` }}>{a.code}</span>
                      <span style={{ fontSize: 11.5, color: '#8a8577', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: a.unreachable ? '#9c6a1d' : '#b23a2f' }}>
                        {a.unreachable ? 'UNREACHABLE' : !a.is_active ? 'SUSPENDED' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#8a8577' }}>{selLabel} · {rangeText} :</span>
        <span style={{ font: `600 22px ${MONO}` }}>{onlyUnreachable ? '—' : vals ? fmtFull(vals.reduce((s, x) => s + x, 0)) : '$0'}</span>
        {unreachableChosen.length > 0 && !onlyUnreachable && (
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8a8577' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ color: '#9c6a1d', marginRight: 7 }} />
            {unreachableChosen.length === 1
              ? `Excludes ${unreachableChosen[0]} — its database is unreachable`
              : `Excludes ${unreachableChosen.join(', ')} — their databases are unreachable`}
          </span>
        )}
        {suspendedInSel && vals && unreachableChosen.length === 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#b23a2f' }}>
            <i className="fa-solid fa-circle-pause" style={{ marginRight: 7 }} />
            Suspended — history shown, excluded from platform totals
          </span>
        )}
      </div>

      {vals && geom && (
        <>
          <div style={{ position: 'relative' }}>
            <svg viewBox="0 0 760 250" style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
              aria-label={`Monthly revenue, ${rangeText}`}>
              <defs>
                <linearGradient id="adTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="rgba(28,28,28,.18)" /><stop offset="1" stopColor="rgba(28,28,28,0)" />
                </linearGradient>
              </defs>
              {geom.grid.map((y, i) => <line key={i} x1="8" x2="752" y1={y} y2={y} stroke="#f0eee8" strokeWidth="1" />)}
              <path d={geom.areaPath} fill="url(#adTrendGrad)" />
              <path d={geom.linePath} fill="none" stroke="#1c1c1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {geom.partialPath && <path d={geom.partialPath} fill="none" stroke="#8a8577" strokeWidth="2.5" strokeDasharray="5 6" strokeLinecap="round" />}
              {geom.pts.map((p, i) => (
                <g key={i}>
                  <line x1={p.x} x2={p.x} y1="26" y2="210" stroke="#d5d2c9" strokeWidth="1" strokeDasharray="3 4" opacity={hover === i ? 1 : 0} />
                  <circle cx={p.x} cy={p.y} r={hover === i ? 6.5 : 4.5} fill={p.partial ? '#8a8577' : '#1c1c1c'} stroke="#fff" strokeWidth="2" />
                  <circle cx={p.x} cy={p.y} r="18" fill="transparent" style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
                </g>
              ))}
            </svg>
            {geom.pts.map((p, i) => {
              const txX = i === 0 ? '0' : i === 5 ? '-100%' : '-50%';
              return (
                <span key={`v${i}`}>
                  <span style={{ position: 'absolute', left: `${(p.x / 760 * 100).toFixed(2)}%`, top: `${(p.y / 250 * 100).toFixed(2)}%`,
                    transform: `translate(${txX},-100%) translateY(-10px)`, font: `600 11.5px ${MONO}`,
                    color: p.partial ? '#8a8577' : '#1c1c1c', pointerEvents: 'none', whiteSpace: 'nowrap' }}>{fmtShort(p.val)}</span>
                  <span style={{ position: 'absolute', left: `${(p.x / 760 * 100).toFixed(2)}%`, top: '92.5%',
                    transform: `translateX(${txX})`, font: `500 10.5px ${MONO}`, letterSpacing: '.1em',
                    color: p.partial ? '#1c1c1c' : '#b3aea4', pointerEvents: 'none' }}>{windowMeta[i].label}</span>
                </span>
              );
            })}
            {hover != null && geom.pts[hover] && (
              <div style={{ position: 'absolute', left: `${(geom.pts[hover].x / 760 * 100).toFixed(2)}%`,
                top: `${(geom.pts[hover].y / 250 * 100).toFixed(2)}%`,
                transform: 'translate(-50%,-100%) translateY(-14px)', background: '#1c1c1c', color: '#fff',
                borderRadius: 11, padding: '12px 14px', minWidth: 172, pointerEvents: 'none',
                boxShadow: '0 12px 30px -12px rgba(28,28,28,.5)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{windowMeta[hover].title}</span>
                  {geom.pts[hover].partial && (
                    <span style={{ marginLeft: 'auto', fontSize: 9.5, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: '#e0c88a' }}>in progress</span>
                  )}
                </div>
                {reachableChosen.map((c) => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, padding: '2px 0' }}>
                    <span style={{ fontFamily: MONO, color: '#b3aea4' }}>{c}</span>
                    <span style={{ marginLeft: 'auto', font: `600 11.5px ${MONO}` }}>{fmtFull(HIST[c][hover])}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5,
                  borderTop: '1px solid rgba(255,255,255,.18)', marginTop: 6, paddingTop: 7 }}>
                  <span style={{ color: '#b3aea4' }}>Total</span>
                  <span style={{ marginLeft: 'auto', font: `600 12px ${MONO}` }}>{fmtFull(geom.pts[hover].val)}</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 18, marginTop: 10, fontSize: 11.5, color: '#8a8577' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 18, height: 0, borderTop: '2.5px solid #1c1c1c', borderRadius: 2 }} />Collected
            </span>
            {isPartialWindow && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 18, height: 0, borderTop: '2.5px dashed #8a8577' }} />Current month · in progress
              </span>
            )}
          </div>
        </>
      )}

      {!vals && !onlyUnreachable && (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 5 }}>No payments yet</div>
          <p style={{ margin: '0 auto', fontSize: 12.5, color: '#8a8577', maxWidth: '46ch' }}>
            {chosen.length === 1
              ? `${academies.find((a) => a.code === chosen[0])?.name || chosen[0]} has no payments yet — its first payment will start the trend.`
              : `No payments recorded for this selection in ${rangeText}.`}
          </p>
        </div>
      )}
      {onlyUnreachable && (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#b23a2f', marginBottom: 5 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 9, color: '#9c6a1d' }} />
            Couldn't reach this academy's database
          </div>
          <p style={{ margin: '0 auto 14px', fontSize: 12.5, color: '#8a8577', maxWidth: '46ch' }}>
            Its revenue history can't be read right now, and it contributes nothing to the platform totals.
          </p>
          <button onClick={onRetry} style={{ height: 34, padding: '0 16px', borderRadius: 9, border: '1px solid #e5e3de',
            background: '#faf9f7', color: '#1c1c1c', fontWeight: 600, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>
            Retry connection
          </button>
        </div>
      )}
    </section>
  );
}
