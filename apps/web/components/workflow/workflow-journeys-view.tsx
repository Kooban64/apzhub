"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  BUSINESS_JOURNEY_CATALOGUE,
  getBusinessJourney,
} from "@/lib/workflow/business-journeys";
import {
  workflowHomePath,
  workflowJourneyDetailPath,
  workflowJourneysPath,
} from "@/lib/workflow/routes";

import { EmptyState, PageShell, WORKFLOW_PRODUCT_NAME } from "./workflow-ui";

export function WorkflowJourneysView() {
  const router = useRouter();

  return (
    <PageShell
      title="Business journeys"
      description="Catalogue of business processes organised by intent — not by execution design."
      breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Journeys"]}
    >
      <ul
        className="grid gap-3 md:grid-cols-2"
        data-testid="workflow-journey-catalogue"
      >
        {BUSINESS_JOURNEY_CATALOGUE.map((journey) => (
          <li key={journey.id}>
            <button
              type="button"
              className="flex h-full w-full flex-col rounded-lg border border-[var(--color-border)] px-4 py-3 text-left hover:bg-[var(--color-muted)]/30"
              data-testid={`workflow-journey-${journey.id}`}
              onClick={() => router.push(workflowJourneyDetailPath(journey.id))}
            >
              <span className="font-medium text-[var(--color-foreground)]">
                {journey.name}
              </span>
              <span className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {journey.summary}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(workflowHomePath())}
        >
          Back to home
        </Button>
      </div>
    </PageShell>
  );
}

export function WorkflowJourneyDetailView({
  journeyId,
}: {
  readonly journeyId: string;
}) {
  const router = useRouter();
  const journey = getBusinessJourney(journeyId);

  if (!journey) {
    return (
      <PageShell
        title="Journey not found"
        breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Journeys"]}
      >
        <EmptyState
          title="Unknown journey"
          description="Choose a business journey from the catalogue."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(workflowJourneysPath())}
            >
              Open catalogue
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={journey.name}
      description={journey.summary}
      breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Journeys", journey.name]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(workflowJourneysPath())}
        >
          All journeys
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2" data-testid="workflow-journey-detail">
        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Outcomes</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            {journey.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ol>
        </section>
        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Participants</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            {journey.typicalParticipants.map((participant) => (
              <li key={participant}>{participant}</li>
            ))}
          </ul>
        </section>
      </div>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        This journey describes what the business intends to happen. How technology
        executes each step remains below the product boundary.
      </p>
    </PageShell>
  );
}
