-- Gate P1 — Projects ↔ Workflow approval bindings (platform metadata SoR).
-- Workflow owns execution; this table stores Projects consumption bindings only.

CREATE TABLE IF NOT EXISTS apz_platform_projects_approval_binding (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  project_id TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL,
  workflow_run_id TEXT,
  workflow_task_id TEXT,
  workflow_unavailable_reason TEXT,
  requested_by TEXT NOT NULL,
  decided_by TEXT,
  decided_at TIMESTAMPTZ,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apz_pab_project
  ON apz_platform_projects_approval_binding (tenant_id, project_id);

CREATE INDEX IF NOT EXISTS idx_apz_pab_subject
  ON apz_platform_projects_approval_binding (
    tenant_id,
    project_id,
    subject_type,
    subject_id,
    kind
  );

CREATE INDEX IF NOT EXISTS idx_apz_pab_status
  ON apz_platform_projects_approval_binding (tenant_id, status);
