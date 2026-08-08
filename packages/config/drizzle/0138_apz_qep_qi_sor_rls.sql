-- APZQEP QX-PR-03: RLS for Quality Intelligence SoR.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'qep_qi_observation',
    'qep_qi_signal',
    'qep_qi_recommendation',
    'qep_qi_explanation',
    'qep_qi_score',
    'qep_qi_audit'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_isolation', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I AS PERMISSIVE FOR ALL TO PUBLIC USING (tenant_id = current_setting(''app.tenant_id'', true)) WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true))',
      t || '_tenant_isolation',
      t
    );
  END LOOP;
END $$;
