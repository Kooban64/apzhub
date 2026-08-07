"use client";

import type { ReactNode } from "react";

import {
  LawBreadcrumbs,
  LawEmptyState,
  LawPageHeader,
  LawWorkspaceLayout,
} from "../ux";
import { LAW_PLATFORM_NAME } from "../../lib/law-platform-constants";

export function GovernancePage({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly breadcrumbs?: readonly string[];
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  const crumbs =
    breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : [LAW_PLATFORM_NAME, title];

  return (
    <LawWorkspaceLayout
      header={
        <div className="flex flex-col gap-2">
          <LawBreadcrumbs
            items={crumbs.map((label, index) => ({
              label,
              current: index === crumbs.length - 1,
            }))}
          />
          <LawPageHeader
            eyebrow={LAW_PLATFORM_NAME}
            title={title}
            subtitle={description}
            secondaryActions={actions}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-6" data-testid="governance-page">
        {children}
      </div>
    </LawWorkspaceLayout>
  );
}

export function GovernancePermissionDenied({ action }: { readonly action: string }) {
  return (
    <GovernancePage title="Permission required" breadcrumbs={[LAW_PLATFORM_NAME]}>
      <div data-testid="governance-permission-denied">
        <LawEmptyState
          variant="no-results"
          title="Permission required"
          description={`You do not have permission to ${action}. Contact your APZHUB administrator if you need access.`}
        />
      </div>
    </GovernancePage>
  );
}
