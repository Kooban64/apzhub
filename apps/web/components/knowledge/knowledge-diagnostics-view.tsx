"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import { MEMORY_CATALOGUE } from "@/lib/knowledge/memory-catalogue";
import { MEMORY_TYPES } from "@/lib/knowledge/memory-types";
import {
  canAdminKnowledge,
  type KnowledgePermissionSource,
} from "@/lib/knowledge/permissions";
import { knowledgeHomePath } from "@/lib/knowledge/routes";

import { EmptyState, KNOWLEDGE_PRODUCT_NAME, PageShell } from "./knowledge-ui";

/** Operator-only diagnostics — never primary product identity. */
export function KnowledgeDiagnosticsView({
  permissions,
}: {
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();

  if (!canAdminKnowledge(permissions)) {
    return (
      <PageShell
        title="Diagnostics"
        breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Diagnostics"]}
      >
        <div data-testid="knowledge-diagnostics-denied">
          <EmptyState
            title="Permission required"
            description="Diagnostics require knowledge.admin. This surface is secondary and operational."
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Diagnostics"
      description="Operator maintenance for organisational memory. Secondary to the Memory Companion."
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Diagnostics"]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(knowledgeHomePath())}
        >
          Home
        </Button>
      }
    >
      <section
        className="rounded-lg border border-dashed border-[var(--color-border)] p-4"
        data-testid="knowledge-diagnostics"
      >
        <h2 className="text-sm font-semibold">Catalogue posture</h2>
        <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted-foreground)]">
          <li>Memory types: {MEMORY_TYPES.length}</li>
          <li>Illustrative memory objects: {MEMORY_CATALOGUE.length}</li>
          <li>Identity: Organisational Memory Companion</li>
          <li>Consumer wiring: deferred (not implemented in N-03)</li>
        </ul>
      </section>
    </PageShell>
  );
}
