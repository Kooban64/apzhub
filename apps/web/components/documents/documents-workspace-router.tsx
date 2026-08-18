"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SoftProductGate } from "@/components/commercial/soft-product-gate";
import {
  canAdminDocuments,
  canViewDocuments,
  type DocumentsPermissionSource,
} from "@/lib/documents/permissions";
import { resolveDocumentsSection } from "@/lib/documents/routes";
import { useDocumentsPermissions } from "@/lib/documents/use-documents-permissions";

import { DocumentsHelpView } from "./documents-help-view";
import { DocumentsSettingsView } from "./documents-settings-view";
import {
  DOCUMENTS_PRODUCT_NAME,
  EmptyState,
  LoadingState,
  PageShell,
} from "./documents-ui";
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

  return (
    <SoftProductGate
      productKey="documents"
      productLabel={DOCUMENTS_PRODUCT_NAME}
      loading={
        <PageShell
          title={DOCUMENTS_PRODUCT_NAME}
          breadcrumbs={[DOCUMENTS_PRODUCT_NAME]}
        >
          <LoadingState label="Checking product access…" />
        </PageShell>
      }
    >
      <DocumentsRouteSwitch section={section} permissions={permissions} />
    </SoftProductGate>
  );
}

function DocumentsRouteSwitch({
  section,
  permissions,
}: {
  readonly section: ReturnType<typeof resolveDocumentsSection>;
  readonly permissions: ReturnType<typeof useDocumentsPermissions>;
}): ReactNode {
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
