"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  canAdminKnowledge,
  canViewKnowledge,
  type KnowledgePermissionSource,
} from "@/lib/knowledge/permissions";
import { knowledgeDiagnosticsPath, knowledgeHomePath } from "@/lib/knowledge/routes";

import { EmptyState, KNOWLEDGE_PRODUCT_NAME, PageShell } from "./knowledge-ui";

/** Native settings — Memory Companion preferences; admin tools secondary. */
export function KnowledgeSettingsView({
  permissions,
}: {
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();
  const canView = canViewKnowledge(permissions);
  const isOperator = canAdminKnowledge(permissions);

  if (!canView) {
    return (
      <PageShell title="Settings" breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Settings"]}>
        <EmptyState
          title="Permission required"
          description="You do not have permission to view APZ Knowledge settings."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Settings"
      description="Personalise your Memory Companion. Administration stays below the product boundary."
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Settings"]}
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
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="knowledge-settings"
      >
        <h2 className="text-sm font-semibold">Experience</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          APZ Knowledge opens on organisational memory questions and companion context.
          Theme and locale follow APZHUB preferences. Memory types are the primary
          browse metaphor — not folders of documents.
        </p>
      </section>

      {isOperator ? (
        <section
          className="mt-4 rounded-lg border border-dashed border-[var(--color-border)] p-4"
          data-testid="knowledge-settings-operator"
        >
          <h2 className="text-sm font-semibold">Operator tools</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Content administration, indexing, and diagnostics are role-gated and
            secondary. They must never define the Memory Companion experience.
          </p>
          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(knowledgeDiagnosticsPath())}
              data-testid="knowledge-settings-open-diagnostics"
            >
              Diagnostics
            </Button>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
