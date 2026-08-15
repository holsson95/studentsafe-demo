-- Make password_hash nullable for Google-only accounts
ALTER TABLE users
  ALTER COLUMN password_hash DROP NOT NULL;

-- Add google_id for linking Google accounts
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Domain-to-school mapping for Google Sign-In
CREATE TABLE IF NOT EXISTS school_domains (
  id        SERIAL PRIMARY KEY,
  domain    VARCHAR(255) UNIQUE NOT NULL,
  school_id INTEGER NOT NULL REFERENCES schools(id)
);

-- school_domains is seeded by server/seed/demoData.js (after schools exist),
-- not here — this migration only needs to run before schools have any rows.
