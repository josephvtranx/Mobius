// Policy-knob registry (spec 02): one singleton row per tenant DB, seeded by schema.sql.
export async function getSettings(db) {
  const { rows } = await db.query('SELECT * FROM institution_settings LIMIT 1');
  if (!rows.length) {
    throw new Error('institution_settings row missing — tenant DB not seeded from schema.sql');
  }
  return rows[0];
}
