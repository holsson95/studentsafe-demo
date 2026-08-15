-- Migration: Alma Student Sync Tables
-- Run once against your PostgreSQL database before starting the sync service.

-- alma_students: populated exclusively by the Alma API sync process.
-- Case records read from this table but never write back.

--psql -d <your_database_name> -f server/migrations/001_alma_students.sql
--OR
--Right-click the database → Query Tool
--Open server/migrations/001_alma_students.sql (File → Open)
--Hit the Run (▶) button


CREATE TABLE IF NOT EXISTS alma_students (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  alma_student_id   VARCHAR(255) NOT NULL,
  application_id    VARCHAR(100) NOT NULL,
  full_name         VARCHAR(500) NOT NULL,
  first_name        VARCHAR(255) NOT NULL,
  middle_name       VARCHAR(255),
  last_name         VARCHAR(255) NOT NULL,
  preferred_name    VARCHAR(255),
  gender            VARCHAR(100),
  cohort            VARCHAR(255),
  nationality       VARCHAR(255),
  -- TODO: Identify the Alma endpoint that exposes enrollment/entry date.
  --       Set to NULL until confirmed. Update fetchAllStudentsForApp() in almaService.js.
  enrollment_date   DATE,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
  last_synced_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (alma_student_id, application_id)
);

-- sync_logs: audit trail for every sync attempt (manual or scheduled).
CREATE TABLE IF NOT EXISTS sync_logs (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  status            VARCHAR(20) NOT NULL DEFAULT 'in_progress'
                    CHECK (status IN ('in_progress', 'success', 'failed')),
  error_message     TEXT,
  records_updated   INTEGER,
  records_added     INTEGER,
  records_deactivated INTEGER,
  -- triggered_by: admin user ID (from JWT) who started the sync
  triggered_by      VARCHAR(255)
);

-- TODO: Consider adding a student_field_changes table for change history audit trail:
--   student_id, field_name, old_value, new_value, synced_at
--   Not implementing now but useful for compliance/auditing.

-- Index for search performance (ILIKE queries on name fields)
CREATE INDEX IF NOT EXISTS idx_alma_students_last_name  ON alma_students (last_name);
CREATE INDEX IF NOT EXISTS idx_alma_students_first_name ON alma_students (first_name);
CREATE INDEX IF NOT EXISTS idx_alma_students_is_active  ON alma_students (is_active);
CREATE INDEX IF NOT EXISTS idx_alma_students_app_id     ON alma_students (application_id);
CREATE INDEX IF NOT EXISTS idx_alma_students_cohort     ON alma_students (cohort);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status         ON sync_logs (status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at     ON sync_logs (started_at DESC);
