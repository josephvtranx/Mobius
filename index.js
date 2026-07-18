// mobius-lms shared package (MODERNIZATION Phase 3) — the single
// implementation of the time helpers, imported by BOTH apps as
// `from 'mobius-lms'` (each declares `"mobius-lms": "file:.."`).
// Repo-wide convention: every timestamp crossing the API boundary is a
// UTC ISO string with a Z suffix. Pure ESM, framework-agnostic — no
// node-only or browser-only APIs (it must run under Express and Vite).
import { DateTime } from "luxon";

export function toUtcIso(input) {
  // eslint-disable-next-line no-restricted-globals -- the sanctioned Date bridge: this helper IS the wrapper
  return (input instanceof Date
          ? DateTime.fromJSDate(input, { zone: "local" })
          : DateTime.fromISO(input,    { zone: "local" }))
        .toUTC()
        .toISO();           // always ends with "Z"
}

export function isoToLocal(isoUtc) {
  return DateTime.fromISO(isoUtc, { zone: "utc" })
                 .setZone(DateTime.local().zoneName);   // Luxon DateTime
}

export function assertUtcIso(iso) {
  if (!/Z$/.test(iso)) throw new Error("Timestamp must be UTC ISO (Z-suffix)");
}
