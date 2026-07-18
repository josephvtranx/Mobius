// Typed HTTP error (MODERNIZATION 4.3, trimmed): thrown from route logic and
// transaction callbacks; rendered by the route's catch or the app-level error
// handler as res.status(status).json(body). Keeps early-return response
// branches expressible inside withTransaction callbacks.
export class HttpError extends Error {
  constructor(status, body) {
    super(typeof body?.message === 'string' ? body.message : `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}
