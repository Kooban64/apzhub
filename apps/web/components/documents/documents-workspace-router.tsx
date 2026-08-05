"use client";

import { usePathname } from "next/navigation";

import {
  canAdminDocuments,
  canViewDocuments,
  type DocumentsPermissionSource,
} from "@/lib/documents/permissions";
import { resolveDocumentsSection } from "@/lib/documents/routes";
import { useDocumentsPermissions } from "@/lib/documents/use-documents-permissions";

import { DocumentsHelpView } from "./documents-help-view";
import { DocumentsSettingsView } from "./documents-settings-view";
import { DOCUMENTS_PRODUCT_NAME, EmptyState, PageShell } from "./documents-ui";
import { PlatformDocumentsView } from "./platform-documents-view";

function PermissionDenied({ action }: { readonly action: string }) {
  return (
    <PageShell
      title={DOCUMENTS_PRODUCT_NAME}
      breadcrumbs={[DOCUMENTS_PRODUCT_NAME, "Permission required"]}
    >
      <div data-testid="documents-permission-denied">
        <EmptyState
          title="Permission required"
          description={`You do not have permission to ${action}. Contact your APZHUB administrator if you need access.`}
        />
      </div>
    </PageShell>
  );
}

/**
 * Documents workspace router — APZHUB session permissions + work companion routes.
 * Never defaults to `document.*`. Never exposes engine identity/roles.
 */
export function DocumentsWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: DocumentsPermissionSource;
} = {}) {
  const pathname = usePathname();
  const section = resolveDocumentsSection(pathname);
  const permissions = useDocumentsPermissions(permissionsOverride);

  if (section === "help") {
    return <DocumentsHelpView />;
  }
  if (section === "settings") {
    return <DocumentsSettingsView />;
  }

  if (section === "diagnostics") {
    if (!canAdminDocuments(permissions)) {
      return <PermissionDenied action="view Documents diagnostics" />;
    }
  } else if (!canViewDocuments(permissions)) {
    return <PermissionDenied action="view Documents" />;
  }

  return <PlatformDocumentsView section={section} />;
}
