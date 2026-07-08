CREATE TABLE "law_trust_account" (
	"trust_account_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_code" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"currency" varchar(8) NOT NULL,
	"institution_name" text NOT NULL,
	"account_number_masked" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"opened_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "law_trust_account_tenant_code_uidx" ON "law_trust_account" USING btree ("tenant_id","trust_account_code");
--> statement-breakpoint
CREATE INDEX "law_trust_account_tenant_idx" ON "law_trust_account" USING btree ("tenant_id");
--> statement-breakpoint
CREATE TABLE "law_trust_journal_entry" (
	"journal_entry_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_id" text NOT NULL,
	"journal_reference" varchar(64) NOT NULL,
	"entry_date" timestamp with time zone NOT NULL,
	"posted_at" timestamp with time zone NOT NULL,
	"posted_by_user_id" text NOT NULL,
	"trust_transaction_id" text NOT NULL,
	"reverses_entry_id" text,
	"lines" jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_journal_entry_tenant_idx" ON "law_trust_journal_entry" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_trust_journal_entry_tenant_account_idx" ON "law_trust_journal_entry" USING btree ("tenant_id","trust_account_id");
--> statement-breakpoint
CREATE TABLE "law_trust_transaction" (
	"trust_transaction_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_id" text NOT NULL,
	"transaction_reference" varchar(64) NOT NULL,
	"trust_transaction_type" varchar(32) NOT NULL,
	"amount" real NOT NULL,
	"currency" varchar(8) NOT NULL,
	"transaction_date" timestamp with time zone NOT NULL,
	"posting_date" timestamp with time zone NOT NULL,
	"client_id" text NOT NULL,
	"matter_id" text,
	"narrative" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"journal_entry_id" text NOT NULL,
	"posted_by_user_id" text NOT NULL,
	"reverses_transaction_id" text,
	"paired_transaction_id" text,
	"adjustment_direction" varchar(16),
	"posted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "law_trust_transaction_tenant_reference_uidx" ON "law_trust_transaction" USING btree ("tenant_id","transaction_reference");
--> statement-breakpoint
CREATE INDEX "law_trust_transaction_tenant_idx" ON "law_trust_transaction" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_trust_transaction_tenant_account_idx" ON "law_trust_transaction" USING btree ("tenant_id","trust_account_id");
--> statement-breakpoint
CREATE TABLE "law_trust_balance" (
	"balance_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_id" text NOT NULL,
	"scope" varchar(32) NOT NULL,
	"client_id" text,
	"matter_id" text,
	"balance_amount" real NOT NULL,
	"currency" varchar(8) NOT NULL,
	"as_of_date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_balance_tenant_account_idx" ON "law_trust_balance" USING btree ("tenant_id","trust_account_id");
--> statement-breakpoint
CREATE TABLE "law_trust_transaction_draft" (
	"draft_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_transaction_draft_tenant_idx" ON "law_trust_transaction_draft" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_trust_transaction_draft_tenant_account_idx" ON "law_trust_transaction_draft" USING btree ("tenant_id","trust_account_id");
--> statement-breakpoint
CREATE TABLE "law_trust_transaction_audit" (
	"audit_record_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_transaction_audit_tenant_idx" ON "law_trust_transaction_audit" USING btree ("tenant_id");
--> statement-breakpoint
CREATE TABLE "law_trust_allocation" (
	"trust_allocation_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_allocation_tenant_idx" ON "law_trust_allocation" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_trust_allocation_tenant_account_idx" ON "law_trust_allocation" USING btree ("tenant_id","trust_account_id");
--> statement-breakpoint
CREATE TABLE "law_trust_reconciliation_run" (
	"trust_reconciliation_run_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_reconciliation_run_tenant_idx" ON "law_trust_reconciliation_run" USING btree ("tenant_id");
--> statement-breakpoint
CREATE TABLE "law_trust_interest_rule" (
	"trust_interest_rule_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_interest_rule_tenant_idx" ON "law_trust_interest_rule" USING btree ("tenant_id");
--> statement-breakpoint
CREATE TABLE "law_trust_interest_posting" (
	"trust_interest_posting_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_interest_posting_tenant_idx" ON "law_trust_interest_posting" USING btree ("tenant_id");
--> statement-breakpoint
CREATE TABLE "law_trust_transfer" (
	"trust_transfer_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_transfer_tenant_idx" ON "law_trust_transfer" USING btree ("tenant_id");
--> statement-breakpoint
CREATE TABLE "law_trust_approval_rule" (
	"trust_approval_rule_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_approval_rule_tenant_idx" ON "law_trust_approval_rule" USING btree ("tenant_id");
--> statement-breakpoint
CREATE TABLE "law_trust_approval_request" (
	"trust_approval_request_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_id" text NOT NULL,
	"approval_type" varchar(64) NOT NULL,
	"subject_id" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_approval_request_tenant_idx" ON "law_trust_approval_request" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_trust_approval_request_tenant_status_idx" ON "law_trust_approval_request" USING btree ("tenant_id","status");
--> statement-breakpoint
CREATE TABLE "law_trust_approval_history" (
	"trust_approval_history_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_approval_request_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_approval_history_tenant_idx" ON "law_trust_approval_history" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_trust_approval_history_request_idx" ON "law_trust_approval_history" USING btree ("tenant_id","trust_approval_request_id");
--> statement-breakpoint
CREATE TABLE "law_trust_report" (
	"trust_report_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"trust_account_id" text,
	"report_type" varchar(64) NOT NULL,
	"payload" jsonb NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "law_trust_report_tenant_idx" ON "law_trust_report" USING btree ("tenant_id");
