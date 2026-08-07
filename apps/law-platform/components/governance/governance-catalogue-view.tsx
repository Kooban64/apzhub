"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  getGovernanceCapability,
  GOVERNANCE_CAPABILITIES,
  listQuestionsByCapability,
  type GovernanceCapability,
} from "../../lib/governance/enterprise-governance-questions";
import {
  lawCatalogueCapabilityPath,
  lawCataloguePath,
  lawHomePath,
  lawQuestionDetailPath,
} from "../../lib/governance/routes";
import { canViewLaw, type LawPermissionSource } from "../../lib/law/permissions";
import { useLawPermissions } from "../../lib/law/use-law-permissions";
import { LAW_PLATFORM_NAME } from "../../lib/law-platform-constants";
import { LawEmptyState } from "../ux";

import { GovernancePage, GovernancePermissionDenied } from "./governance-shell";

export function GovernanceCatalogueView({
  capabilityId,
  permissions: permissionsOverride,
}: {
  readonly capabilityId?: string;
  readonly permissions?: LawPermissionSource;
} = {}) {
  const router = useRouter();
  const permissions = useLawPermissions(permissionsOverride);
  const canView = canViewLaw(permissions);

  if (!canView) {
    return <GovernancePermissionDenied action="view the governance catalogue" />;
  }

  if (capabilityId) {
    const capability = getGovernanceCapability(capabilityId);
    if (!capability) {
      return (
        <GovernancePage
          title="Unknown capability"
          breadcrumbs={[LAW_PLATFORM_NAME, "Catalogue"]}
        >
          <LawEmptyState
            variant="no-results"
            title="Capability not found"
            description="Return to the Enterprise Governance Catalogue."
            action={
              <Button
                type="button"
                size="sm"
                onClick={() => router.push(lawCataloguePath())}
              >
                Catalogue
              </Button>
            }
          />
        </GovernancePage>
      );
    }

    const questions = listQuestionsByCapability(capability.id as GovernanceCapability);

    return (
      <GovernancePage
        title={capability.title}
        description={capability.summary}
        breadcrumbs={[LAW_PLATFORM_NAME, "Catalogue", capability.title]}
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(lawCataloguePath())}
          >
            All capabilities
          </Button>
        }
      >
        <ul
          className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]"
          data-testid={`governance-catalogue-${capability.id}`}
        >
          {questions.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-[var(--color-muted-foreground)]">
              No questions mapped yet — capability is part of the governance model.
            </li>
          ) : (
            questions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-1 px-3 py-3 text-left hover:bg-[var(--color-muted)]/40"
                  onClick={() => router.push(lawQuestionDetailPath(item.id))}
                >
                  <span className="font-medium">{item.question}</span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {item.id}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </GovernancePage>
    );
  }

  return (
    <GovernancePage
      title="Enterprise governance catalogue"
      description="Govern through business capabilities — policies, obligations, compliance, approvals, retention, and evidence — not legal administration."
      breadcrumbs={[LAW_PLATFORM_NAME, "Catalogue"]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(lawHomePath())}
        >
          Home
        </Button>
      }
    >
      <ul className="grid gap-2 md:grid-cols-2" data-testid="governance-catalogue">
        {GOVERNANCE_CAPABILITIES.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="flex w-full flex-col rounded-lg border border-[var(--color-border)] px-3 py-3 text-left hover:bg-[var(--color-muted)]/30"
              data-testid={`governance-catalogue-item-${item.id}`}
              onClick={() => router.push(lawCatalogueCapabilityPath(item.id))}
            >
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {item.summary}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </GovernancePage>
  );
}
