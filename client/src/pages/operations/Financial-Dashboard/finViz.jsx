// Shared bits for the financial dashboard pages: money formatting, the
// chart palette, and a dependency-free monthly bar chart.
//
// Palette note: the design handoff's chart hues (#2e9d8d/#a99bd8/#efb54b)
// FAILED the dataviz six-checks validator (amber outside the lightness
// band, purple under the chroma floor, both under 3:1 contrast) — these are
// the nearest passing steps with the same hue identities, validated on the
// light surface. Color follows the MEASURE everywhere (revenue is always
// teal, cost always indigo, profit always amber), never the series' rank.
import { useState } from 'react';

export const FIN_COLORS = { revenue: '#2e9d8d', cost: '#5b6bc0', profit: '#b3790f' };
export const money = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Grouped-by-month bar chart. series: [{ key, label, color }] (order fixed);
// months: [{ label, values: { [key]: number } }]. Legend renders for >= 2
// series (a single series is named by the card title). Hovering a month
// raises a tooltip with the exact values — bars are read comparatively,
// numbers come from the tooltip (and each page's table view).
export function MonthBarChart({ series, months, height = 170 }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...months.flatMap((m) => series.map((s) => m.values[s.key] ?? 0)));

  return (
    <div>
      {series.length > 1 && (
        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#7d6a5c', marginBottom: 14, flexWrap: 'wrap' }}>
          {series.map((s) => (
            <span key={s.key}>
              <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: s.color, marginRight: 6 }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height }}>
        {months.map((m, i) => (
          <div key={m.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
            {hover === i && (
              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translate(-50%, -6px)',
                background: '#33231a', color: '#fff', borderRadius: 8, padding: '8px 11px', zIndex: 5,
                fontSize: 12, lineHeight: 1.5, whiteSpace: 'nowrap', pointerEvents: 'none',
                boxShadow: '0 6px 18px rgba(51,35,26,.25)' }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
                {series.map((s) => {
                  const v = m.values[s.key] ?? 0;
                  return (
                    <div key={s.key}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.color, marginRight: 6 }} />
                      {s.label} <strong style={{ color: v < 0 ? '#f0a8a5' : '#fff' }}>{money(v)}</strong>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, width: '100%', justifyContent: 'center', height: '100%' }}>
              {series.map((s) => {
                const v = m.values[s.key] ?? 0;
                // Negative values (a loss month) render as a 3px critical
                // stub — the true number lives in the tooltip and tables.
                const negative = v < 0;
                const px = negative ? 3 : Math.round((v / max) * (height - 24));
                return (
                  <span key={s.key} style={{ width: '26%', maxWidth: 15, height: Math.max(px, v !== 0 ? 3 : 1),
                    borderRadius: '4px 4px 2px 2px',
                    background: negative ? '#a03634' : s.color,
                    opacity: hover === null || hover === i ? 1 : 0.45,
                    transition: 'opacity .12s' }} />
                );
              })}
            </div>
            <span style={{ fontSize: 11, color: '#a98d76' }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// The handoff's finance empty state, shared by the three dashboard pages.
export function FinEmpty({ sub }) {
  return (
    <div className="hm-empty fin-empty">
      <i className="fa-solid fa-coins" aria-hidden="true" />
      <div>No financial data yet</div>
      <p>{sub}</p>
    </div>
  );
}
