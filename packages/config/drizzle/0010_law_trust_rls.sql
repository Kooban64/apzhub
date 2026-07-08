ALTER TABLE "law_trust_account" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_account" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_journal_entry" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_journal_entry" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_transaction" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_transaction" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_balance" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_balance" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_transaction_draft" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_transaction_draft" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_transaction_audit" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_transaction_audit" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_allocation" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_allocation" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_reconciliation_run" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_reconciliation_run" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_interest_rule" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_interest_rule" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_interest_posting" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_interest_posting" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_transfer" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_transfer" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_approval_rule" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_approval_rule" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_approval_request" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_approval_request" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_approval_history" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_approval_history" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_report" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "law_trust_report" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "law_trust_account_tenant_isolation" ON "law_trust_account" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_journal_entry_tenant_isolation" ON "law_trust_journal_entry" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_transaction_tenant_isolation" ON "law_trust_transaction" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_balance_tenant_isolation" ON "law_trust_balance" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_transaction_draft_tenant_isolation" ON "law_trust_transaction_draft" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_transaction_audit_tenant_isolation" ON "law_trust_transaction_audit" AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_transaction_audit_tenant_read" ON "law_trust_transaction_audit" AS PERMISSIVE FOR SELECT TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_allocation_tenant_isolation" ON "law_trust_allocation" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_reconciliation_run_tenant_isolation" ON "law_trust_reconciliation_run" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_interest_rule_tenant_isolation" ON "law_trust_interest_rule" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_interest_posting_tenant_isolation" ON "law_trust_interest_posting" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_transfer_tenant_isolation" ON "law_trust_transfer" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_approval_rule_tenant_isolation" ON "law_trust_approval_rule" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_approval_request_tenant_isolation" ON "law_trust_approval_request" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_approval_history_tenant_insert" ON "law_trust_approval_history" AS PERMISSIVE FOR INSERT TO PUBLIC WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_approval_history_tenant_read" ON "law_trust_approval_history" AS PERMISSIVE FOR SELECT TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true));
--> statement-breakpoint
CREATE POLICY "law_trust_report_tenant_isolation" ON "law_trust_report" AS PERMISSIVE FOR ALL TO PUBLIC USING ("tenant_id" = current_setting('app.tenant_id', true)) WITH CHECK ("tenant_id" = current_setting('app.tenant_id', true));
