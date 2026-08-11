import { assertUtcIso } from "mobius-lms";
import { HttpError } from "../helpers/httpError.js";

export function requireUtcIso(fields) {
  return (req, _res, next) => {
    try {
      fields.forEach(f => req.body[f] && assertUtcIso(req.body[f]));
      next();
    } catch (err) {
      // must be an HttpError — the app-level handler 500s anything else
      next(new HttpError(400, { message: `${err.message}` }));
    }
  };
}