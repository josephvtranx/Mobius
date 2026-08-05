// Client-side derivation helpers (design handoff README > "Canonical data
// model > Derived values"). Only for values the v2 API returns as raw
// pieces without pre-computing — the source of truth stays the server;
// these just combine fields a response already has instead of letting a
// screen restate/recompute them inconsistently in more than one place.
//
// Values the server ALREADY derives (don't recompute these — just render
// them): wallet balance/committed/available (walletRoutes.js ->
// computeWallet), request/task counts (list endpoints return arrays; count
// the array, don't hardcode a number), instructor-for-a-class (classes are
// joined to their instructor server-side via instructor_id, not looked up
// by intersecting subject "codes" the way the design prototype's fake
// dataset does).

import { DateTime } from 'luxon';

// Attendance % — README: "attended ÷ marked, excused excluded". The real
// session_attendance.status vocabulary (migrations/tenant baseline) is
// present | absent_unexcused | absent_excused | cancelled_in_window |
// cancelled_late | instructor_cancelled. Only present/absent_unexcused
// count as "marked" for the rate; everything else is excused/not-the-
// student's-fault and is excluded from both numerator and denominator.
const ATTENDED_STATUSES = new Set(['present']);
const MARKED_STATUSES = new Set(['present', 'absent_unexcused']);

// entries: array of attendance statuses, or objects carrying one at
// `.status` or `.attendance.status` (matches studentViewService.getRecord()
// entries and session-roster shapes).
export function attendanceRate(entries) {
  let marked = 0;
  let attended = 0;
  for (const entry of entries ?? []) {
    const status = typeof entry === 'string' ? entry : entry?.status ?? entry?.attendance?.status;
    if (!MARKED_STATUSES.has(status)) continue;
    marked += 1;
    if (ATTENDED_STATUSES.has(status)) attended += 1;
  }
  return {
    attended,
    marked,
    rate: marked > 0 ? Math.round((attended / marked) * 100) : null,
  };
}

// Wallet status — README's rule ("balance<0 -> Negative; credits<=2 ||
// balance<100 -> Low; else Healthy") assumes the prototype's two-metric
// play-money model. The real wallet has one credits balance
// (walletRoutes.js GET /:studentId -> { balance, committed, available }),
// so "low" is reframed against real settings instead of a magic number:
// available covers less than institution_settings.low_balance_notify_
// runway_sessions worth of the standard one-on-one session cost.
export function walletStatus(wallet, settings) {
  if (!wallet) return 'healthy';
  if (wallet.balance < 0) return 'negative';
  const lowThreshold =
    (settings?.low_balance_notify_runway_sessions ?? 2) *
    (settings?.default_one_on_one_credit_cost ?? 5);
  if (wallet.available <= lowThreshold) return 'low';
  return 'healthy';
}

// Room clash — README: "scan class pairs sharing room + day + overlapping
// hours". v2 class_sessions are concrete instances with absolute
// starts_at/ends_at (UTC ISO), not a recurring day+time pair, so "same
// day" falls out of comparing the actual instants rather than a day-of-
// week field. Returns pairs of sessions that overlap in the same room.
// sessions: [{ session_id, room_id, starts_at, ends_at }]
export function findRoomClashes(sessions) {
  const byRoom = new Map();
  for (const s of sessions ?? []) {
    if (s.room_id == null) continue;
    if (!byRoom.has(s.room_id)) byRoom.set(s.room_id, []);
    byRoom.get(s.room_id).push(s);
  }

  const clashes = [];
  for (const roomSessions of byRoom.values()) {
    for (let i = 0; i < roomSessions.length; i++) {
      for (let j = i + 1; j < roomSessions.length; j++) {
        const a = roomSessions[i];
        const b = roomSessions[j];
        const aStart = DateTime.fromISO(a.starts_at);
        const aEnd = DateTime.fromISO(a.ends_at);
        const bStart = DateTime.fromISO(b.starts_at);
        const bEnd = DateTime.fromISO(b.ends_at);
        if (aStart < bEnd && bStart < aEnd) clashes.push([a, b]);
      }
    }
  }
  return clashes;
}

// Package duration — README: "sessions / sessionsPerWeek weeks, -> end date"
export function packageDurationWeeks(sessions, sessionsPerWeek) {
  if (!sessionsPerWeek) return null;
  return sessions / sessionsPerWeek;
}

export function packageEndDate(startIso, weeks) {
  if (weeks == null) return null;
  return DateTime.fromISO(startIso).plus({ weeks }).toUTC().toISO();
}
