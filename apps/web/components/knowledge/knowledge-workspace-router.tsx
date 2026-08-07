"use client";

import { usePathname } from "next/navigation";

import {
  canAdminKnowledge,
  canViewKnowledge,
  type KnowledgePermissionSource,
} from "@/lib/knowledge/permissions";
import { resolveKnowledgeRoute } from "@/lib/knowledge/routes";
import { useKnowledgePermissions } from "@/lib/knowledge/use-knowledge-permissions";

import { KnowledgeCompanionView } from "./knowledge-companion-view";
import { KnowledgeDiagnosticsView } from "./knowledge-diagnostics-view";
import { KnowledgeHelpView } from "./knowledge-help-view";
import { KnowledgeHomeView } from "./knowledge-home-view";
import { KnowledgeMemoryDetailView } from "./knowledge-memory-detail-view";
import { KnowledgeMemoryTypeView } from "./knowledge-memory-type-view";
import { KnowledgeMemoryView } from "./knowledge-memory-view";
import {
  KnowledgeDecisionKnowledgeView,
  KnowledgeLessonsView,
  KnowledgeLibraryView,
  KnowledgeQualityView,
} from "./knowledge-organisational-memory-views";
import { KnowledgeSettingsView } from "./knowledge-settings-view";
import { EmptyState, KNOWLEDGE_PRODUCT_NAME, PageShell } from "./knowledge-ui";

function PermissionDenied({ action }: { readonly action: string }) {
  return (
    <PageShell title="Permission required" breadcrumbs={[KNOWLEDGE_PRODUCT_NAME]}>
      <div data-testid="knowledge-permission-denied">
        <EmptyState
          title="Permission required"
          description={`You do not have permission to ${action}. Contact your APZHUB administrator if you need access.`}
        />
      </div>
    </PageShell>
  );
}

/**
 * Knowledge workspace router — Memory Companion (N-03) + Wave A organisational memory.
 * Never defaults to `knowledge.*`. Never presents as search/AI/wiki/docs.
 */
export function KnowledgeWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: KnowledgePermissionSource;
} = {}) {
  const pathname = usePathname();
  const route = resolveKnowledgeRoute(pathname);
  const permissions = useKnowledgePermissions(permissionsOverride);

  if (route.kind === "diagnostics") {
    if (!canAdminKnowledge(permissions)) {
      return <PermissionDenied action="view Knowledge diagnostics" />;
    }
    return <KnowledgeDiagnosticsView permissions={permissions} />;
  }

  if (!canViewKnowledge(permissions)) {
    return <PermissionDenied action="view APZ Knowledge" />;
  }

  switch (route.kind) {
    case "home":
      return <KnowledgeHomeView permissions={permissions} />;
    case "memory":
      return <KnowledgeMemoryView permissions={permissions} />;
    case "memory-type":
      return <KnowledgeMemoryTypeView type={route.type} permissions={permissions} />;
    case "memory-detail":
      return (
        <KnowledgeMemoryDetailView
          memoryId={route.memoryId}
          permissions={permissions}
        />
      );
    case "lessons":
      return <KnowledgeLessonsView permissions={permissions} />;
    case "library":
      return <KnowledgeLibraryView permissions={permissions} />;
    case "decision-knowledge":
      return <KnowledgeDecisionKnowledgeView permissions={permissions} />;
    case "quality":
      return <KnowledgeQualityView permissions={permissions} />;
    case "companion":
      return <KnowledgeCompanionView permissions={permissions} />;
    case "help":
      return <KnowledgeHelpView permissions={permissions} />;
    case "settings":
      return <KnowledgeSettingsView permissions={permissions} />;
    default:
      return (
        <PageShell title="Not found" breadcrumbs={[KNOWLEDGE_PRODUCT_NAME]}>
          <EmptyState
            title="Page not found"
            description="This organisational memory surface does not exist."
          />
        </PageShell>
      );
  }
}
