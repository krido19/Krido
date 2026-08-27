-- ============================================================
-- CLIENT PLANNING TABLES
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Projects
CREATE TABLE IF NOT EXISTS planning_projects (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  client      text        NOT NULL DEFAULT '',
  date        date        NOT NULL DEFAULT CURRENT_DATE,
  notes       text        NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now()
);

-- 2. Per-item checks + catatan
CREATE TABLE IF NOT EXISTS planning_checks (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id  uuid        NOT NULL REFERENCES planning_projects(id) ON DELETE CASCADE,
  section_id  text        NOT NULL,   -- e.g. "clarity", "architecture"
  item_index  smallint    NOT NULL,   -- 0-based index dalam section
  checked     boolean     NOT NULL DEFAULT false,
  item_notes  text        NOT NULL DEFAULT '',
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (project_id, section_id, item_index)
);

-- Index untuk query cepat per project
CREATE INDEX IF NOT EXISTS idx_planning_checks_project
  ON planning_checks (project_id);

-- ── RLS (hanya authenticated user) ───────────────────────────
ALTER TABLE planning_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE planning_checks   ENABLE ROW LEVEL SECURITY;

-- Drop dulu kalau re-run
DROP POLICY IF EXISTS "admin_projects" ON planning_projects;
DROP POLICY IF EXISTS "admin_checks"   ON planning_checks;

CREATE POLICY "admin_projects" ON planning_projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_checks" ON planning_checks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
