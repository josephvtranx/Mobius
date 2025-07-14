import { DateTime } from "luxon";

export function toUtcIso(input) {
  return (input instanceof Date
          ? DateTime.fromJSDate(input, { zone: "local" })
          : DateTime.fromISO(input,    { zone: "local" }))
        .toUTC()
        .toISO();           // always ends with “Z”
}

export function isoToLocal(isoUtc) {
  return DateTime.fromISO(isoUtc, { zone: "utc" })
                 .setZone(DateTime.local().zoneName);
}

export function assertUtcIso(iso) {
  if (!/Z$/.test(iso)) throw new Error("Timestamp must be UTC ISO (Z-suffix)");
} 