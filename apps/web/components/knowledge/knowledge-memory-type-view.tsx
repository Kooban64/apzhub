"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import { listMemoryByType } from "@/lib/knowledge/memory-catalogue";
import { getMemoryType, type MemoryTypeKey } from "@/lib/knowledge/memory-types";
import {
  canViewKnowledge,
  type KnowledgePermissionSource,
} from "@/lib/knowledge/permissions";
import { knowledgeMemoryObjectPath, knowledgeMemoryPath } from "@/lib/knowledge/routes";

import { EmptyState, KNOWLEDGE_PRODUCT_NAME, PageShell } from "./knowledge-ui";

export function KnowledgeMemoryTypeView({
  type,
  permissions,
}: {
  readonly type: MemoryTypeKey;
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();
  const definition = getMemoryType(type);
  const items = listMemoryByType(type);

  if (!canViewKnowledge(permissions) || !definition) {
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
      title={definition.pluralLabel}
      description={definition.question}
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Memory", definition.pluralLabel]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(knowledgeMemoryPath())}
        >
          All memory types
        </Button>
      }
    >
      <p
        className="text-sm text-[var(--color-muted-foreground)]"
        data-testid="knowledge-memory-type-derivation"
      >
        {definition.description} Derived from {definition.derivesFrom}. Not a document
        folder.
      </p>

      {items.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title={`No ${definition.pluralLabel.toLowerCase()} published yet`}
            description="Curated memory will appear here after capture and approval."
          />
        </div>
      ) : (
        <ul className="mt-4 grid gap-2" data-testid="knowledge-memory-type-list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--color-border)] p-3 text-left hover:bg-[var(--color-accent)]/40"
                onClick={() => router.push(knowledgeMemoryObjectPath(item.id))}
                data-testid={`knowledge-memory-item-${item.id}`}
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  {item.summary}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
