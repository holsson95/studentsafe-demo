-- Migration 004: Add case_type_id and is_active to categories and subcategories
-- Run: psql -U <DB_USER> -d <DB_NAME> -f server/migrations/004_category_case_type.sql

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS case_type_id INT REFERENCES case_type(id),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE subcategories
  ADD COLUMN IF NOT EXISTS case_type_id INT REFERENCES case_type(id),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_categories_case_type_id ON categories(case_type_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_case_type_id ON subcategories(case_type_id);
