// The house transaction wrapper (MODERNIZATION 4.1): checkout → BEGIN →
// fn(client) → COMMIT → release, with ROLLBACK + release on any throw.
// Replaces the 25 hand-rolled copies across the v2 routes/jobs. Composable
// *_WithinTx helpers are unchanged — they already take the caller's client.
export async function withTransaction(db, fn) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {}); // connection may be gone
    throw err;
  } finally {
    client.release();
  }
}
