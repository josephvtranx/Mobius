import { DateTime } from "luxon";

// ⇢ local JS Date or local ISO → UTC ISO
export const toUtcIso = (d: Date | string) =>
  (d instanceof Date
      ? DateTime.fromJSDate(d, { zone: "local" })
      : DateTime.fromISO(d,    { zone: "local" })
  ).toUTC().toISO();             // always ends with ‘Z’

// ⇢ UTC ISO → Luxon DateTime in server's local zone (for logs, etc.)
export const isoToLocal = (iso: string) =>
  DateTime.fromISO(iso, { zone: "utc" })
          .setZone(DateTime.local().zoneName);

// Guard for API inputs
export const assertUtcIso = (iso: string) => {
  if (!/Z$/.test(iso)) throw new Error("Timestamp must be UTC ISO (Z-suffix)");
}; 