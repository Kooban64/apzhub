-- APZQEP QX-PR-01: RLS for Automation execution SoR.
DO $$
DECLARE
  t text := 'qep_automation_execution';
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_isolation', t);
  EXECUTE format(
    'CREATE POLICY %I ON %I AS PERMISSIVE FOR ALL TO PUBLIC USING (tenant_id = current_setting(''app.tenant_id'', true)) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true))',
    t || '_tenant_isolation',
    t
  );
END $$;
