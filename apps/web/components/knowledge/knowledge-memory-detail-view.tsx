"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import { getMemoryObject } from "@/lib/knowledge/memory-catalogue";
import { getMemoryType } from "@/lib/knowledge/memory-types";
import {
  canViewKnowledge,
  type KnowledgePermissionSource,
} from "@/lib/knowledge/permissions";
import { knowledgeMemoryPath, knowledgeMemoryTypePath } from "@/lib/knowledge/routes";

import { EnterpriseContextPanel } from "@/components/context/enterprise-context-panel";

import { KnowledgeManagedObjectDetailView } from "./knowledge-organisational-memory-views";
import {
  EmptyState,
  KNOWLEDGE_PRODUCT_NAME,
  KnowledgeWorkspaceFrame,
  PageShell,
} from "./knowledge-ui";

export function KnowledgeMemoryDetailView({
  memoryId,
  permissions,
}: {
  readonly memoryId: string;
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

  // Wave A persisted objects use platform ids (`kobj_*`).
  if (memoryId.startsWith("kobj_")) {
    return (
      <KnowledgeManagedObjectDetailView objectId={memoryId} permissions={permissions} />
    );
  }

  const item = getMemoryObject(memoryId);
  const type = item ? getMemoryType(item.type) : undefined;

  if (!item || !type) {
    return (
      <PageShell title="Not found" breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Memory"]}>
        <EmptyState
          title="Memory object not found"
          description="This organisational memory object is not available."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={item.title}
      description={type.label}
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Memory", type.pluralLabel, item.title]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(knowledgeMemoryTypePath(item.type))}
        >
          Back to {type.pluralLabel.toLowerCase()}
        </Button>
      }
    >
      <KnowledgeWorkspaceFrame
        context={
          <EnterpriseContextPanel
            focusType="knowledge"
            focusId={memoryId}
            focusName={item.title}
          />
        }
      >
        <article
          className="space-y-4 rounded-lg border border-[var(--color-border)] p-4"
          data-testid="knowledge-memory-detail"
        >
          <p className="text-sm">{item.summary}</p>
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="font-medium">Applies when</dt>
              <dd className="text-[var(--color-muted-foreground)]">
                {item.appliesWhen}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Derived from</dt>
              <dd className="text-[var(--color-muted-foreground)]">
                {item.derivedFrom}
              </dd>
            </div>
            <div>
              <dt className="font-medium">Status</dt>
              <dd className="text-[var(--color-muted-foreground)] capitalize">
                {item.status}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            This is organisational memory — curated understanding that helps you act
            correctly. It is not a file. Documents remain the System of Record for
            files.
          </p>
        </article>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={() => router.push(knowledgeMemoryPath())}
        >
          All memory types
        </Button>
      </KnowledgeWorkspaceFrame>
    </PageShell>
  );
}
