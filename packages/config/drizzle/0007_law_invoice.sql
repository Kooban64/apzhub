CREATE TABLE "law_invoice" (
	"invoice_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"client_id" text NOT NULL,
	"matter_id" text,
	"invoice_reference" varchar(64) NOT NULL,
	"invoice_status" varchar(32) NOT NULL,
	"issue_date" timestamp with time zone NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"subtotal" real DEFAULT 0 NOT NULL,
	"tax_total" real DEFAULT 0 NOT NULL,
	"total" real DEFAULT 0 NOT NULL,
	"currency" varchar(8) DEFAULT 'AUD' NOT NULL,
	"trust_applied_amount" real,
	"expenses_placeholder" real DEFAULT 0 NOT NULL,
	"disbursements_placeholder" real DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "law_invoice_tenant_reference_uidx" ON "law_invoice" USING btree ("tenant_id","invoice_reference");
--> statement-breakpoint
CREATE INDEX "law_invoice_tenant_idx" ON "law_invoice" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_invoice_tenant_client_idx" ON "law_invoice" USING btree ("tenant_id","client_id");
--> statement-breakpoint
CREATE INDEX "law_invoice_tenant_matter_idx" ON "law_invoice" USING btree ("tenant_id","matter_id");
--> statement-breakpoint
CREATE TABLE "law_invoice_line_item" (
	"line_item_id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"invoice_id" text NOT NULL,
	"description" text NOT NULL,
	"quantity" real NOT NULL,
	"unit_price" real NOT NULL,
	"amount" real NOT NULL,
	"matter_id" text NOT NULL,
	"time_entry_id" text,
	"expense_id" text
);
--> statement-breakpoint
CREATE INDEX "law_invoice_line_item_tenant_idx" ON "law_invoice_line_item" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "law_invoice_line_item_tenant_invoice_idx" ON "law_invoice_line_item" USING btree ("tenant_id","invoice_id");
--> statement-breakpoint
CREATE INDEX "law_invoice_line_item_tenant_time_entry_idx" ON "law_invoice_line_item" USING btree ("tenant_id","time_entry_id");
