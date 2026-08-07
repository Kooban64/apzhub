"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  MEMORY_COMPANION_CONSUMERS,
  MEMORY_COMPANION_JOURNEY,
} from "@/lib/knowledge/memory-companion-model";
import {
  canViewKnowledge,
  type KnowledgePermissionSource,
} from "@/lib/knowledge/permissions";
import { knowledgeHomePath } from "@/lib/knowledge/routes";

import { EmptyState, KNOWLEDGE_PRODUCT_NAME, PageShell } from "./knowledge-ui";

/**
 * Experience model for Memory Companion in context.
 * Consumer product wiring is explicitly out of N-03 scope.
 */
export function KnowledgeCompanionView({
  permissions,
}: {
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();

  if (!canViewKnowledge(permissions)) {
    return (
      <PageShell title="Companion" breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Companion"]}>
        <EmptyState
          title="Permission required"
          description="You do not have permission to view the Memory Companion model."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Memory Companion"
      description={`${MEMORY_COMPANION_JOURNEY}. Organisational memory should appear where work is performed.`}
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Companion"]}
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
      <p
        className="text-sm text-[var(--color-muted-foreground)]"
        data-testid="knowledge-companion-note"
      >
        This screen establishes the experience model. Actual wiring into Projects,
        Support, Time, Documents, Workflow, Analytics, Law, and APZQEP is future
        integration work — ownership does not change. Destination-first browsing is
        secondary to this companion model.
      </p>

      <ul className="mt-4 grid gap-3" data-testid="knowledge-companion-consumers">
        {MEMORY_COMPANION_CONSUMERS.map((consumer) => (
          <li
            key={consumer.productId}
            className="rounded-lg border border-[var(--color-border)] p-4"
            data-testid={`knowledge-companion-${consumer.productId}`}
          >
            <h2 className="text-sm font-semibold">{consumer.productName}</h2>
            <p className="mt-1 text-sm">{consumer.experienceIntent}</p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Example: {consumer.exampleSignal}
            </p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              {consumer.ownershipNote}
            </p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
