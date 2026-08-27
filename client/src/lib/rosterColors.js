// Small color helpers shared by the roster tables (Student/Instructor/Staff)
// — avatar-initial tints and status/department pill tones, matching the
// design's per-row tint palette (Mobius Staff.dc.html "## Roster"). Real
// status values come from the API; only the color mapping is presentational.

// Cool pastel set (2026-08-20 direction: mint / yellow / blue / lavender /
// pink, like the reference roster mock — no orange in the tint rotation).
const TINTS = [
  { bg: '#e0f2ee', fg: '#25887a' },
  { bg: '#fdf3cf', fg: '#9a7b16' },
  { bg: '#e3effb', fg: '#3d7cc0' },
  { bg: '#ece7fa', fg: '#7a5fc7' },
  { bg: '#fbeef1', fg: '#b95a76' },
];

// Deterministic per-name so a given person's avatar color doesn't shuffle
// on every re-fetch/re-sort.
export function tintFor(seed) {
  let hash = 0;
  for (let i = 0; i < String(seed).length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length];
}

const TONE = {
  success: { bg: '#e9f5ee', fg: '#2c8a5b' },
  warning: { bg: '#fff4e0', fg: '#9c6a1d' },
  error: { bg: '#fdf1ef', fg: '#9c3a31' },
  info: { bg: '#eef1fb', fg: '#5b6bc0' },
  neutral: { bg: '#eef0f4', fg: '#7b8494' },
};

const STATUS_TONE_MAP = {
  active: 'success',
  enrolled: 'success',
  full_time: 'success',
  'full-time': 'success',
  pending: 'warning',
  on_trial: 'warning',
  'on trial': 'warning',
  part_time: 'warning',
  'part-time': 'warning',
  waitlist: 'info',
  inactive: 'neutral',
  terminated: 'neutral',
};

export function toneFor(status) {
  const key = String(status ?? '').toLowerCase().trim();
  return TONE[STATUS_TONE_MAP[key] ?? 'neutral'];
}
