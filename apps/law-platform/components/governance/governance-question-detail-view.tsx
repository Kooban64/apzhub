"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import { getGovernanceQuestion } from "../../lib/governance/enterprise-governance-questions";
import {
  lawCatalogueCapabilityPath,
  lawHomePath,
  lawQuestionsPath,
} from "../../lib/governance/routes";
import { canViewLaw, type LawPermissionSource } from "../../lib/law/permissions";
import { useLawPermissions } from "../../lib/law/use-law-permissions";
import { LAW_PLATFORM_NAME } from "../../lib/law-platform-constants";
import { LawEmptyState } from "../ux";

import { GovernancePage, GovernancePermissionDenied } from "./governance-shell";

export function GovernanceQuestionDetailView({
  questionId,
  permissions: permissionsOverride,
}: {
  readonly questionId: string;
  readonly permissions?: LawPermissionSource;
}) {
  const router = useRouter();
  const permissions = useLawPermissions(permissionsOverride);
  const canView = canViewLaw(permissions);
  const question = getGovernanceQuestion(questionId);

  if (!canView) {
    return <GovernancePermissionDenied action="view this governance question" />;
  }

  if (!question) {
    return (
      <GovernancePage
        title="Unknown question"
        breadcrumbs={[LAW_PLATFORM_NAME, "Questions"]}
      >
        <LawEmptyState
          variant="no-results"
          title="Question not found"
          description="Return to the Enterprise Governance Question Catalogue."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(lawQuestionsPath())}
            >
              Governance questions
            </Button>
          }
        />
      </GovernancePage>
    );
  }

  return (
    <GovernancePage
      title={question.question}
      description="Work → Governance Context → Confident Action. Obligations apply to business activity — this is not legal advice."
      breadcrumbs={[LAW_PLATFORM_NAME, "Questions", question.id]}
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(lawQuestionsPath())}
          >
            Catalogue
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(lawHomePath())}
          >
            Home
          </Button>
        </>
      }
    >
      <section
        className="grid gap-3 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-2"
        data-testid="governance-decision-context"
      >
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Why this matters
          </h3>
          <p className="mt-1 text-sm">{question.whyItMatters}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Applies to work
          </h3>
          <p className="mt-1 text-sm">{question.appliesToWork}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Possible actions
          </h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {question.possibleActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Related products
          </h3>
          <p className="mt-1 text-sm">{question.relatedProducts.join(" · ")}</p>
          <h3 className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Supporting evidence
          </h3>
          <p className="mt-1 text-sm">{question.supportingEvidence}</p>
        </div>
      </section>

      <section data-testid="governance-question-capability">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(lawCatalogueCapabilityPath(question.capability))}
        >
          View {question.capability} in catalogue
        </Button>
      </section>
    </GovernancePage>
  );
}
