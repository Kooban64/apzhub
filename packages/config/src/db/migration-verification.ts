import { sql } from "drizzle-orm";

import { getDatabaseUrl } from "../env";
import { createDb } from "./client";
import {
  lawCalendarEvent,
  lawClient,
  lawDocument,
  lawInvoice,
  lawTrustAccount,
} from "./legal-schema";

export interface LawMigrationVerification {
  readonly ok: boolean;
  readonly appliedTags: readonly string[];
  readonly requiredTags: readonly string[];
  readonly missingTags: readonly string[];
  readonly message?: string;
}

const REQUIRED_LAW_MIGRATION_TAGS = [
  "0001_law_client_matter_outbox",
  "0002_law_rls_policies",
  "0003_law_document_task",
  "0004_law_document_task_rls",
  "0005_law_calendar_time",
  "0006_law_calendar_time_rls",
  "0007_law_invoice",
  "0008_law_invoice_rls",
  "0009_law_trust",
  "0010_law_trust_rls",
] as const;

export async function verifyLawMigrations(
  connectionString?: string,
): Promise<LawMigrationVerification> {
  const db = createDb(connectionString ?? getDatabaseUrl());
  const appliedTags: string[] = [];

  try {
    await db.select().from(lawClient).limit(1);
    appliedTags.push("0001_law_client_matter_outbox");
  } catch (error) {
    return {
      ok: false,
      appliedTags,
      requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      missingTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      message: error instanceof Error ? error.message : "Law tables unavailable",
    };
  }

  try {
    const policies = await db.execute<{ policyname: string }>(
      sql`
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('law_client', 'law_matter', 'law_outbox_event')
      `,
    );

    if (policies.rows.length >= 3) {
      appliedTags.push("0002_law_rls_policies");
    }
  } catch (error) {
    return {
      ok: false,
      appliedTags,
      requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      missingTags: REQUIRED_LAW_MIGRATION_TAGS.filter(
        (tag) => !appliedTags.includes(tag),
      ),
      message: error instanceof Error ? error.message : "RLS verification failed",
    };
  }

  try {
    await db.select().from(lawDocument).limit(1);
    appliedTags.push("0003_law_document_task");
  } catch (error) {
    return {
      ok: false,
      appliedTags,
      requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      missingTags: REQUIRED_LAW_MIGRATION_TAGS.filter(
        (tag) => !appliedTags.includes(tag),
      ),
      message:
        error instanceof Error ? error.message : "Document/task tables unavailable",
    };
  }

  try {
    const policies = await db.execute<{ policyname: string }>(
      sql`
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('law_document', 'law_task')
      `,
    );

    if (policies.rows.length >= 2) {
      appliedTags.push("0004_law_document_task_rls");
    }
  } catch (error) {
    return {
      ok: false,
      appliedTags,
      requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      missingTags: REQUIRED_LAW_MIGRATION_TAGS.filter(
        (tag) => !appliedTags.includes(tag),
      ),
      message:
        error instanceof Error
          ? error.message
          : "Document/task RLS verification failed",
    };
  }

  try {
    await db.select().from(lawCalendarEvent).limit(1);
    appliedTags.push("0005_law_calendar_time");
  } catch (error) {
    return {
      ok: false,
      appliedTags,
      requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      missingTags: REQUIRED_LAW_MIGRATION_TAGS.filter(
        (tag) => !appliedTags.includes(tag),
      ),
      message:
        error instanceof Error ? error.message : "Calendar/time tables unavailable",
    };
  }

  try {
    const policies = await db.execute<{ policyname: string }>(
      sql`
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('law_calendar_event', 'law_time_entry')
      `,
    );

    if (policies.rows.length >= 2) {
      appliedTags.push("0006_law_calendar_time_rls");
    }
  } catch (error) {
    return {
      ok: false,
      appliedTags,
      requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      missingTags: REQUIRED_LAW_MIGRATION_TAGS.filter(
        (tag) => !appliedTags.includes(tag),
      ),
      message:
        error instanceof Error
          ? error.message
          : "Calendar/time RLS verification failed",
    };
  }

  try {
    await db.select().from(lawInvoice).limit(1);
    appliedTags.push("0007_law_invoice");
  } catch (error) {
    return {
      ok: false,
      appliedTags,
      requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      missingTags: REQUIRED_LAW_MIGRATION_TAGS.filter(
        (tag) => !appliedTags.includes(tag),
      ),
      message: error instanceof Error ? error.message : "Invoice tables unavailable",
    };
  }

  try {
    const policies = await db.execute<{ policyname: string }>(
      sql`
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('law_invoice', 'law_invoice_line_item')
      `,
    );

    if (policies.rows.length >= 2) {
      appliedTags.push("0008_law_invoice_rls");
    }
  } catch (error) {
    return {
      ok: false,
      appliedTags,
      requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      missingTags: REQUIRED_LAW_MIGRATION_TAGS.filter(
        (tag) => !appliedTags.includes(tag),
      ),
      message:
        error instanceof Error ? error.message : "Invoice RLS verification failed",
    };
  }

  try {
    await db.select().from(lawTrustAccount).limit(1);
    appliedTags.push("0009_law_trust");
  } catch (error) {
    return {
      ok: false,
      appliedTags,
      requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      missingTags: REQUIRED_LAW_MIGRATION_TAGS.filter(
        (tag) => !appliedTags.includes(tag),
      ),
      message: error instanceof Error ? error.message : "Trust tables unavailable",
    };
  }

  try {
    const policies = await db.execute<{ policyname: string }>(
      sql`
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
            'law_trust_account',
            'law_trust_transaction',
            'law_trust_journal_entry',
            'law_trust_approval_history'
          )
      `,
    );

    if (policies.rows.length >= 4) {
      appliedTags.push("0010_law_trust_rls");
    }
  } catch (error) {
    return {
      ok: false,
      appliedTags,
      requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
      missingTags: REQUIRED_LAW_MIGRATION_TAGS.filter(
        (tag) => !appliedTags.includes(tag),
      ),
      message: error instanceof Error ? error.message : "Trust RLS verification failed",
    };
  }

  const missingTags = REQUIRED_LAW_MIGRATION_TAGS.filter(
    (tag) => !appliedTags.includes(tag),
  );

  return {
    ok: missingTags.length === 0,
    appliedTags,
    requiredTags: [...REQUIRED_LAW_MIGRATION_TAGS],
    missingTags,
  };
}
