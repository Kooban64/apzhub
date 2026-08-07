"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  ENTERPRISE_GOVERNANCE_QUESTION_CATALOGUE,
  GOVERNANCE_HOME_PROMPTS,
} from "../../lib/governance/enterprise-governance-questions";
import {
  lawCataloguePath,
  lawContextPath,
  lawHelpPath,
  lawQuestionDetailPath,
  lawQuestionsPath,
  lawSettingsPath,
} from "../../lib/governance/routes";
import {
  canAdminLawPractice,
  canViewLaw,
  type LawPermissionSource,
} from "../../lib/law/permissions";
import { useLawPermissions } from "../../lib/law/use-law-permissions";
import { LAW_PLATFORM_NAME } from "../../lib/law-platform-constants";

import { GovernancePage, GovernancePermissionDenied } from "./governance-shell";

const COMPANION_LINKS = [
  {
    label: "Governance questions",
    path: lawQuestionsPath,
    testId: "governance-home-link-questions",
  },
  {
    label: "Governance catalogue",
    path: lawCataloguePath,
    testId: "governance-home-link-catalogue",
  },
  {
    label: "Governance in context",
    path: lawContextPath,
    testId: "governance-home-link-context",
  },
  {
    label: "Help",
    path: lawHelpPath,
    testId: "governance-home-link-help",
  },
  {
    label: "Settings",
    path: lawSettingsPath,
    testId: "governance-home-link-settings",
  },
] as const;

export function GovernanceHomeView({
  permissions: permissionsOverride,
}: {
  readonly permissions?: LawPermissionSource;
} = {}) {
  const router = useRouter();
  const permissions = useLawPermissions(permissionsOverride);
  const canView = canViewLaw(permissions);
  const isPracticeOperator = canAdminLawPractice(permissions);

  if (!canView) {
    return <GovernancePermissionDenied action="view APZ Law" />;
  }

  return (
    <GovernancePage
      title="Home"
      description="Your Governance Companion — obligations supporting work. Encounter governance when you act, not only when you open Law."
      breadcrumbs={[LAW_PLATFORM_NAME, "Home"]}
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => router.push(lawQuestionsPath())}
          data-testid="governance-home-open-questions"
        >
          Open governance questions
        </Button>
      }
    >
      <section data-testid="governance-home-onboarding">
        <h2 className="mb-2 text-sm font-semibold">Start with a governance question</h2>
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          APZ Law helps every product operate within enterprise obligations. It is not a
          practice management system. Prefer: these obligations apply to this business
          activity.
        </p>
        <div className="flex flex-wrap gap-2" data-testid="governance-home-links">
          {COMPANION_LINKS.map((link) => (
            <Button
              key={link.testId}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(link.path())}
              data-testid={link.testId}
            >
              {link.label}
            </Button>
          ))}
        </div>
      </section>

      <section data-testid="governance-home-prompts">
        <h2 className="mb-2 text-sm font-semibold">What needs governance attention</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {GOVERNANCE_HOME_PROMPTS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full flex-col rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/30"
                data-testid={`governance-home-prompt-${item.id}`}
                onClick={() => {
                  const first = item.relatedQuestionIds[0];
                  if (first) {
                    router.push(lawQuestionDetailPath(first));
                  } else {
                    router.push(lawQuestionsPath());
                  }
                }}
              >
                <span className="font-medium">{item.prompt}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section data-testid="governance-home-questions">
        <h2 className="mb-2 text-sm font-semibold">Enterprise governance questions</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {ENTERPRISE_GOVERNANCE_QUESTION_CATALOGUE.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full flex-col rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/30"
                data-testid={`governance-home-question-${item.id}`}
                onClick={() => router.push(lawQuestionDetailPath(item.id))}
              >
                <span className="font-medium">{item.question}</span>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {item.id} · {item.capability}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {isPracticeOperator ? (
        <section
          className="rounded-lg border border-dashed border-[var(--color-border)] p-4"
          data-testid="governance-home-practice-note"
        >
          <h2 className="text-sm font-semibold">Practice operator access</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Matters, clients, trust, billing, and firm administration remain secondary
            practice tools. They do not define the Governance Companion experience.
          </p>
        </section>
      ) : null}
    </GovernancePage>
  );
}
