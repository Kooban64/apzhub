"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  ENTERPRISE_GOVERNANCE_QUESTION_CATALOGUE,
  GOVERNANCE_CAPABILITIES,
  type GovernanceCapability,
} from "../../lib/governance/enterprise-governance-questions";
import { lawHomePath, lawQuestionDetailPath } from "../../lib/governance/routes";
import { canViewLaw, type LawPermissionSource } from "../../lib/law/permissions";
import { useLawPermissions } from "../../lib/law/use-law-permissions";
import { LAW_PLATFORM_NAME } from "../../lib/law-platform-constants";

import { GovernancePage, GovernancePermissionDenied } from "./governance-shell";

export function GovernanceQuestionsView({
  permissions: permissionsOverride,
}: {
  readonly permissions?: LawPermissionSource;
} = {}) {
  const router = useRouter();
  const permissions = useLawPermissions(permissionsOverride);
  const canView = canViewLaw(permissions);
  const [capability, setCapability] = useState<GovernanceCapability | "all">("all");

  const items = useMemo(() => {
    if (capability === "all") return ENTERPRISE_GOVERNANCE_QUESTION_CATALOGUE;
    return ENTERPRISE_GOVERNANCE_QUESTION_CATALOGUE.filter(
      (item) => item.capability === capability,
    );
  }, [capability]);

  if (!canView) {
    return <GovernancePermissionDenied action="view governance questions" />;
  }

  return (
    <GovernancePage
      title="Governance questions"
      description="Questions before practice administration. Select a governance question to understand obligations and next actions."
      breadcrumbs={[LAW_PLATFORM_NAME, "Questions"]}
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
      <div
        className="flex flex-wrap gap-2"
        data-testid="governance-questions-capabilities"
      >
        <Button
          type="button"
          size="sm"
          variant={capability === "all" ? "default" : "outline"}
          onClick={() => setCapability("all")}
        >
          All
        </Button>
        {GOVERNANCE_CAPABILITIES.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={capability === item.id ? "default" : "outline"}
            onClick={() => setCapability(item.id)}
            data-testid={`governance-questions-capability-${item.id}`}
          >
            {item.title}
          </Button>
        ))}
      </div>

      <ul
        className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]"
        data-testid="governance-questions-catalogue"
      >
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="flex w-full flex-col gap-1 px-3 py-3 text-left hover:bg-[var(--color-muted)]/40"
              onClick={() => router.push(lawQuestionDetailPath(item.id))}
              data-testid={`governance-question-row-${item.id}`}
            >
              <span className="font-medium">{item.question}</span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {item.id} · {item.capability}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </GovernancePage>
  );
}
