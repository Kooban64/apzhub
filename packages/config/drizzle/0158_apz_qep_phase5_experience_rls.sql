-- APZQEP Phase 5: tenant RLS for experience aggregates and shared capture.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'qep_exploratory_session',
    'qep_exploratory_area',
    'qep_experience_plan',
    'qep_experience_plan_discipline',
    'qep_experience_context',
    'qep_experience_criterion',
    'qep_experience_verification_activity',
    'qep_experience_criterion_result',
    'qep_experience_context_activity',
    'qep_quality_observation',
    'qep_quality_issue',
    'qep_quality_note',
    'qep_quality_evidence_link',
    'qep_exploratory_session_history',
    'qep_experience_plan_history',
    'qep_experience_activity_history',
    'qep_quality_trace_link'
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
