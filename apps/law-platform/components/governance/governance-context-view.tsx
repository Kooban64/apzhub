"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  GOVERNANCE_CONTEXT_CONSUMERS,
  GOVERNANCE_CONTEXT_JOURNEY,
} from "../../lib/governance/governance-context-model";
import { lawHomePath } from "../../lib/governance/routes";
import { canViewLaw, type LawPermissionSource } from "../../lib/law/permissions";
import { useLawPermissions } from "../../lib/law/use-law-permissions";
import { LAW_PLATFORM_NAME } from "../../lib/law-platform-constants";

import { GovernancePage, GovernancePermissionDenied } from "./governance-shell";

/**
 * Experience model for Governance in Context.
 * Consumer product wiring is explicitly out of N-03 scope.
 */
export function GovernanceContextView({
  permissions: permissionsOverride,
}: {
  readonly permissions?: LawPermissionSource;
} = {}) {
  const router = useRouter();
  const permissions = useLawPermissions(permissionsOverride);
  const canView = canViewLaw(permissions);

  if (!canView) {
    return <GovernancePermissionDenied action="view governance context model" />;
  }

  return (
    <GovernancePage
      title="Governance in context"
      description={`${GOVERNANCE_CONTEXT_JOURNEY}. Governance should appear where work is performed — Law owns the lifecycle; other products consume by reference.`}
      breadcrumbs={[LAW_PLATFORM_NAME, "Context"]}
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
      <p
        className="text-sm text-[var(--color-muted-foreground)]"
        data-testid="governance-context-note"
      >
        This screen establishes the experience model. Actual wiring into Projects,
        Workflow, Documents, Support, and APZQEP is future integration work — ownership
        does not change.
      </p>

      <ul className="grid gap-3" data-testid="governance-context-consumers">
        {GOVERNANCE_CONTEXT_CONSUMERS.map((consumer) => (
          <li
            key={consumer.productId}
            className="rounded-lg border border-[var(--color-border)] p-4"
            data-testid={`governance-context-${consumer.productId}`}
          >
            <h2 className="text-sm font-semibold">{consumer.productName}</h2>
            <p className="mt-1 text-sm">{consumer.experienceIntent}</p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              Example: {consumer.exampleSignal}
            </p>
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
              {consumer.ownershipNote}
            </p>
          </li>
        ))}
      </ul>
    </GovernancePage>
  );
}
