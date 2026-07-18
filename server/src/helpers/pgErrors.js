// Shared Postgres-error classification (MODERNIZATION 4.2) — the single copy
// of the calendar-conflict check and the code→HTTP mapping that was
// copy-pasted across routes and authController.
import { HttpError } from './httpError.js';

// 23505 (unique) / 23P01 (exclusion) on the calendar constraints = a racing
// writer won (INV-3). 409 tells the UI to refresh and re-offer.
export function isCalendarConflict(err) {
  return err?.code === '23P01' || err?.code === '23505';
}

const DEFAULTS = {
  '23505': (err) => new HttpError(409, { message: 'That record already exists', detail: err.detail ?? null }),
  '23P01': (err) => new HttpError(409, { message: 'Conflicting records overlap', detail: err.detail ?? null }),
  '23503': () => new HttpError(400, { message: 'A referenced record does not exist' }),
  '23514': () => new HttpError(400, { message: 'A value violates a data constraint' }),
  '23502': () => new HttpError(400, { message: 'A required field is missing' }),
  '22P02': () => new HttpError(400, { message: 'A value has the wrong format' })
};

// Maps a pg error to an HttpError; unknown codes pass through unchanged.
// `overrides` lets a call site keep its pinned message for a code, e.g.
// pgErrorToHttp(err, { '23505': new HttpError(409, { code: 'ALREADY_ENROLLED', … }) })
export function pgErrorToHttp(err, overrides = {}) {
  if (err instanceof HttpError) return err;
  const override = overrides[err?.code];
  if (override) return typeof override === 'function' ? override(err) : override;
  const mapper = DEFAULTS[err?.code];
  return mapper ? mapper(err) : err;
}
