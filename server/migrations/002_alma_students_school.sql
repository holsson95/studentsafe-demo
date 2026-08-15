-- Migration 002: Add building_name and school_id to alma_students
-- Run after 001_alma_students.sql
--
-- psql -d <your_database_name> -f server/migrations/002_alma_students_school.sql
-- OR use pgAdmin Query Tool

ALTER TABLE alma_students
  ADD COLUMN IF NOT EXISTS building_name TEXT,
  ADD COLUMN IF NOT EXISTS school_id     INTEGER REFERENCES schools(id);

CREATE INDEX IF NOT EXISTS idx_alma_students_school_id ON alma_students (school_id);
