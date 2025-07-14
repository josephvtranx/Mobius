import { assertUtcIso } from "../lib/time.js";

export function requireUtcIso(fields) {
  return (req, _res, next) => {
    try {
      fields.forEach(f => req.body[f] && assertUtcIso(req.body[f]));
      next();
    } catch (err) {
      next({ status: 400, message: err.message });
    }
  };
} 