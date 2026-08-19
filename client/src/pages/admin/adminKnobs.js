// Humane labels/descriptions for the per-academy settings knobs, grouped as in
// the design handoff. WHICH keys are editable is decided by the server (the
// config GET returns `editable`) — this map only decorates; the editor renders
// the intersection, and any server-editable key missing here falls back to a
// raw-label row so a new server knob is never invisible.
export const KNOB_GROUPS = [
  {
    name: 'Booking & scheduling',
    items: [
      { key: 'self_serve_booking_enabled', type: 'toggle', label: 'Self-serve booking', desc: 'Let students book their own sessions instead of staff-only scheduling.' },
      { key: 'group_catalog_visible', type: 'toggle', label: 'Class catalog visible', desc: 'Show the group-class catalog to students and guardians.' },
      { key: 'reschedule_window_hours', type: 'number', min: 0, label: 'Reschedule window', desc: 'Hours before a session that a reschedule request is still allowed.' },
      { key: 'instructor_response_window_hours', type: 'number', min: 1, label: 'Instructor response window', desc: 'Hours an instructor has to accept or decline a reschedule request.' },
      { key: 'session_generation_horizon_weeks', type: 'number', min: 1, label: 'Schedule horizon', desc: 'How many weeks of recurring sessions are generated in advance.' },
    ],
  },
  {
    name: 'Attendance & records',
    items: [
      { key: 'session_record_lock_days', type: 'number', min: 1, label: 'Record lock', desc: 'Days after a session before its attendance record locks for edits.' },
      { key: 'attendance_autocomplete_hours', type: 'number', min: 1, label: 'Attendance auto-complete', desc: 'Hours after a session before unmarked attendance auto-completes as attended.' },
    ],
  },
  {
    name: 'Billing & balances',
    items: [
      { key: 'enrollment_runway_sessions', type: 'number', min: 1, label: 'Enrollment runway', desc: 'Minimum prepaid sessions required to enroll in a new class.' },
      { key: 'negative_balance_floor_sessions', type: 'number', min: 0, label: 'Negative balance floor', desc: 'How many sessions a wallet may go negative before booking blocks.' },
      { key: 'low_balance_notify_runway_sessions', type: 'number', min: 1, label: 'Low-balance alert runway', desc: 'Remaining-session count that triggers the family low-balance alert.' },
      { key: 'default_one_on_one_credit_cost', type: 'number', min: 0, label: 'Default 1:1 credit cost', desc: 'Credits deducted per one-on-one session unless the class overrides it.' },
    ],
  },
  {
    name: 'Payments',
    dormant: true,
    items: [
      { key: 'payment_modes_enabled', type: 'select', label: 'Payment modes', desc: 'Which checkout paths staff can offer: collect now, payment link, or both.', dormant: true, options: [['collect_now', 'Collect now'], ['payment_link', 'Payment link'], ['both', 'Both']] },
      { key: 'payment_link_ttl_hours', type: 'number', min: 1, label: 'Payment link lifetime', desc: 'Hours before an issued payment link expires.', dormant: true },
      { key: 'consultation_hold_ttl_min', type: 'number', min: 1, label: 'Consultation hold', desc: 'Minutes a consultation slot is held before it releases.', dormant: true },
      { key: 'trial_class_enabled', type: 'toggle', label: 'Trial classes', desc: 'Allow one discounted trial session per new student.', dormant: true },
    ],
  },
];

// Deterministic logo gradient per academy code (design uses initials-on-
// gradient; no raster images anywhere).
const GRADIENTS = [
  'linear-gradient(135deg,#2c6e6e,#143d3d)', 'linear-gradient(135deg,#3a5f8a,#1c2c40)',
  'linear-gradient(135deg,#a8552e,#6e2f14)', 'linear-gradient(135deg,#5b6bc0,#2e3a75)',
  'linear-gradient(135deg,#6e8a3a,#3d4d1c)', 'linear-gradient(135deg,#4f9a6e,#2c5940)',
  'linear-gradient(135deg,#8a6e3a,#4d3a14)', 'linear-gradient(135deg,#9a5bbf,#5f2c80)',
];
export function logoGradient(code) {
  let h = 0;
  for (const ch of String(code)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export function initialsOf(name) {
  return String(name || '').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export const fmtMoney = (n) =>
  n == null ? '—' : '$' + Math.round(n).toLocaleString('en-US');
