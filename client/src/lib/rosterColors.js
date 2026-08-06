// Small color helpers shared by the roster tables (Student/Instructor/Staff)
// — avatar-initial tints and status/department pill tones, matching the
// design's per-row tint palette (Mobius Staff.dc.html "## Roster"). Real
// status values come from the API; only the color mapping is presentational.

const TINTS = [
  { bg: '#fdeedd', fg: '#c26a24' },
  { bg: '#eef1fb', fg: '#5b6bc0' },
  { bg: '#fbeef1', fg: '#b95a76' },
  { bg: '#e9f5ee', fg: '#2c8a5b' },
  { bg: '#efe6fa', fg: '#8a4fc9' },
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
  neutral: { bg: '#f3ede6', fg: '#a08d7a' },
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
