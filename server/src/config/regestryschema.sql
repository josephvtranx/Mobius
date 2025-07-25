CREATE TABLE institutions (
  id           SERIAL PRIMARY KEY,
  code         TEXT UNIQUE NOT NULL,     -- e.g. 'UW123'
  name         TEXT NOT NULL,
  conn_string  TEXT NOT NULL,            -- full PG URL to the tenant DB
  logo_url     TEXT
);
