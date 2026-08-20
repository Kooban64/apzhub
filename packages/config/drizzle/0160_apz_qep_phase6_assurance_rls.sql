-- APZQEP Phase 6: tenant RLS for Quality Risk, Gates, Certification Exception.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'qep_quality_risk',
    'qep_quality_risk_history',
    'qep_quality_risk_signal',
    'qep_quality_gate_definition',
    'qep_quality_gate_evaluation',
    'qep_certification_exception'
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
