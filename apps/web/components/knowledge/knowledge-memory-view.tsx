"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import { MEMORY_TYPES } from "@/lib/knowledge/memory-types";
import {
  canViewKnowledge,
  type KnowledgePermissionSource,
} from "@/lib/knowledge/permissions";
import { knowledgeHomePath, knowledgeMemoryTypePath } from "@/lib/knowledge/routes";

import { EmptyState, KNOWLEDGE_PRODUCT_NAME, PageShell } from "./knowledge-ui";

/** Catalogue of organisational memory types — not a document library. */
export function KnowledgeMemoryView({
  permissions,
}: {
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();

  if (!canViewKnowledge(permissions)) {
    return (
      <PageShell title="Memory" breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Memory"]}>
        <EmptyState
          title="Permission required"
          description="You do not have permission to view organisational memory."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Organisational memory"
      description="Browse memory by business concept. This is curated understanding — not a collection of articles or files."
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Memory"]}
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
      <ul className="grid gap-3" data-testid="knowledge-memory-types">
        {MEMORY_TYPES.map((type) => (
          <li key={type.key}>
            <button
              type="button"
              className="w-full rounded-lg border border-[var(--color-border)] p-4 text-left hover:bg-[var(--color-accent)]/40"
              onClick={() => router.push(knowledgeMemoryTypePath(type.key))}
              data-testid={`knowledge-memory-type-${type.key}`}
            >
              <h2 className="text-sm font-semibold">{type.pluralLabel}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {type.question}
              </p>
              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                {type.description} · Derived from {type.derivesFrom}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
