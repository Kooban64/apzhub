"use client";

import { usePathname } from "next/navigation";

import {
  canAdminDocuments,
  canViewDocuments,
  type DocumentsPermissionSource,
} from "@/lib/documents/permissions";
import { resolveDocumentsSection } from "@/lib/documents/routes";
import { useDocumentsPermissions } from "@/lib/documents/use-documents-permissions";

import { PlatformDocumentsView } from "./platform-documents-view";

function PermissionDenied({ action }: { readonly action: string }) {
  return (
    <div className="flex flex-col gap-6 p-1" data-testid="documents-permission-denied">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Documents
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
          Permission required
        </h1>
      </header>
      <div className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center">
        <p className="font-medium text-[var(--color-foreground)]">
          Permission required
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          You do not have permission to {action}. Contact your APZHUB administrator if
          you need access.
        </p>
      </div>
    </div>
  );
}

/**
 * Documents workspace router — consumes APZHUB session permissions.
 * Never defaults to `document.*`. Never exposes engine identity/roles.
 *
 * N-02: identity only. Does not redesign attach-to-work or repository UX.
 */
export function DocumentsWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: DocumentsPermissionSource;
} = {}) {
  const pathname = usePathname();
  const section = resolveDocumentsSection(pathname);
  const permissions = useDocumentsPermissions(permissionsOverride);

  if (section === "diagnostics") {
    if (!canAdminDocuments(permissions)) {
      return <PermissionDenied action="view Documents diagnostics" />;
    }
  } else if (!canViewDocuments(permissions)) {
    return <PermissionDenied action="view Documents" />;
  }

  return <PlatformDocumentsView section={section} />;
}
