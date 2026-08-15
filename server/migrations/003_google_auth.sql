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

-- Seed: demo.local maps to school_id 2 (matches server/seed/demoData.js)
INSERT INTO school_domains (domain, school_id)
VALUES ('demo.local', 2)
ON CONFLICT (domain) DO NOTHING;
