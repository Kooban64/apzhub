"use client";

import { usePathname } from "next/navigation";

import { resolveLawGovernanceRoute } from "../../lib/governance/routes";
import { canViewLaw, type LawPermissionSource } from "../../lib/law/permissions";
import { useLawPermissions } from "../../lib/law/use-law-permissions";
import { LAW_PLATFORM_NAME } from "../../lib/law-platform-constants";
import { LawEmptyState } from "../ux";

import { GovernanceCatalogueView } from "./governance-catalogue-view";
import { GovernanceContextView } from "./governance-context-view";
import { GovernanceHelpView } from "./governance-help-view";
import { GovernanceHomeView } from "./governance-home-view";
import { GovernanceQuestionDetailView } from "./governance-question-detail-view";
import { GovernanceQuestionsView } from "./governance-questions-view";
import { GovernanceSettingsView } from "./governance-settings-view";
import { GovernancePage, GovernancePermissionDenied } from "./governance-shell";

/**
 * Governance Companion router (N-03).
 * Practice routes remain on dedicated management routers.
 */
export function GovernanceWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: LawPermissionSource;
} = {}) {
  const pathname = usePathname();
  const route = resolveLawGovernanceRoute(pathname);
  const permissions = useLawPermissions(permissionsOverride);

  if (route.kind === "unknown") {
    return (
      <GovernancePage title="Unknown route" breadcrumbs={[LAW_PLATFORM_NAME]}>
        <LawEmptyState
          variant="coming-soon"
          title="Unknown governance route"
          description="Select Home, Questions, or Catalogue from APZ Law."
        />
      </GovernancePage>
    );
  }

  if (!canViewLaw(permissions) && route.kind !== "help") {
    return <GovernancePermissionDenied action="view APZ Law" />;
  }

  switch (route.kind) {
    case "home":
      return <GovernanceHomeView permissions={permissions} />;
    case "questions":
      return <GovernanceQuestionsView permissions={permissions} />;
    case "question-detail":
      return (
        <GovernanceQuestionDetailView
          key={route.questionId}
          questionId={route.questionId}
          permissions={permissions}
        />
      );
    case "catalogue":
      return <GovernanceCatalogueView permissions={permissions} />;
    case "catalogue-capability":
      return (
        <GovernanceCatalogueView
          key={route.capabilityId}
          capabilityId={route.capabilityId}
          permissions={permissions}
        />
      );
    case "context":
      return <GovernanceContextView permissions={permissions} />;
    case "help":
      return <GovernanceHelpView />;
    case "settings":
      return <GovernanceSettingsView permissions={permissions} />;
    default:
      return null;
  }
}
