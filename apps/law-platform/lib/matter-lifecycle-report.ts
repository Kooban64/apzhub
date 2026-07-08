import { resetSharedLawRepositories } from "./persistence";
import {
  getClientWorkflowDiagnostics,
  resetClientWorkflowDiagnostics,
} from "./clients";
import {
  getMatterWorkflowDiagnostics,
  resetMatterWorkflowDiagnostics,
} from "./matters";
import {
  getDocumentWorkflowDiagnostics,
  resetDocumentWorkflowDiagnostics,
} from "./documents";
import { getTaskWorkflowDiagnostics, resetTaskWorkflowDiagnostics } from "./tasks";
import {
  resetSharedCalendarEventRepository,
  getCalendarEventWorkflowDiagnostics,
  resetCalendarEventWorkflowDiagnostics,
} from "./calendar";
import {
  resetSharedTimeEntryRepository,
  getTimeEntryWorkflowDiagnostics,
  resetTimeEntryWorkflowDiagnostics,
} from "./time";
import {
  resetSharedInvoiceRepository,
  getInvoiceWorkflowDiagnostics,
  resetInvoiceWorkflowDiagnostics,
} from "./billing";
import {
  getLegalSearchWorkflowDiagnostics,
  resetLegalSearchWorkflowDiagnostics,
} from "./search";
import { resetLegalClientEventEnvelopeCounter } from "./publish-legal-client-event";
import { resetLegalMatterEventEnvelopeCounter } from "./publish-legal-matter-event";
import { resetLegalDocumentEventEnvelopeCounter } from "./publish-legal-document-event";
import { resetLegalTaskEventEnvelopeCounter } from "./publish-legal-task-event";
import { resetLegalCalendarEventEnvelopeCounter } from "./publish-legal-calendar-event";
import { resetLegalTimeEventEnvelopeCounter } from "./publish-legal-time-event";
import { resetLegalBillingEventEnvelopeCounter } from "./publish-legal-billing-event";
import { resetLegalSearchEventEnvelopeCounter } from "./publish-legal-search-event";
import { unregisterClientNavigationHandler } from "./clients/client-navigation";
import { unregisterMatterNavigationHandler } from "./matters/matter-navigation";
import { unregisterDocumentNavigationHandler } from "./documents/document-navigation";
import { unregisterTaskNavigationHandler } from "./tasks/task-navigation";
import { unregisterCalendarEventNavigationHandler } from "./calendar/calendar-event-navigation";
import { unregisterTimeEntryNavigationHandler } from "./time/time-entry-navigation";
import { unregisterInvoiceNavigationHandler } from "./billing/invoice-navigation";
import { unregisterLegalSearchNavigationHandler } from "./search/legal-search-navigation";

/** Unified search token used across all lifecycle entities (LAW-011-01). */
export const MATTER_LIFECYCLE_SEARCH_TAG = "LIFECYCLE-E2E-2026";

export interface MatterLifecycleStepReport {
  readonly step: string;
  readonly ok: boolean;
  readonly commandId?: string;
  readonly eventId?: string;
  readonly durationMs: number;
  readonly notificationsAfter: number;
  readonly activitiesAfter: number;
  readonly workspaceDocumentCount?: number;
  readonly workspaceTaskCount?: number;
  readonly workspaceTimeCount?: number;
  readonly workspaceCalendarCount?: number;
  readonly workspaceInvoiceCount?: number;
  readonly warnings: readonly string[];
}

export interface MatterLifecycleExecutionReport {
  readonly startedAt: string;
  readonly completedAt: string;
  readonly totalDurationMs: number;
  readonly steps: readonly MatterLifecycleStepReport[];
  readonly commandsExecuted: number;
  readonly eventsPublished: number;
  readonly notificationsGenerated: number;
  readonly activitiesGenerated: number;
  readonly knowledgeProvidersExercised: readonly string[];
  readonly searchProvidersExercised: readonly string[];
  readonly repositoryMutations: Readonly<Record<string, number>>;
  readonly validationFailures: number;
  readonly warnings: readonly string[];
  readonly navigationRoutes: readonly string[];
}

/** Resets all in-memory repositories, diagnostics, events, and navigation handlers. */
export function resetMatterLifecycleValidationState(): void {
  resetSharedLawRepositories();
  resetSharedCalendarEventRepository();
  resetSharedTimeEntryRepository();
  resetSharedInvoiceRepository();

  resetClientWorkflowDiagnostics();
  resetMatterWorkflowDiagnostics();
  resetDocumentWorkflowDiagnostics();
  resetTaskWorkflowDiagnostics();
  resetCalendarEventWorkflowDiagnostics();
  resetTimeEntryWorkflowDiagnostics();
  resetInvoiceWorkflowDiagnostics();
  resetLegalSearchWorkflowDiagnostics();

  resetLegalClientEventEnvelopeCounter();
  resetLegalMatterEventEnvelopeCounter();
  resetLegalDocumentEventEnvelopeCounter();
  resetLegalTaskEventEnvelopeCounter();
  resetLegalCalendarEventEnvelopeCounter();
  resetLegalTimeEventEnvelopeCounter();
  resetLegalBillingEventEnvelopeCounter();
  resetLegalSearchEventEnvelopeCounter();

  unregisterClientNavigationHandler();
  unregisterMatterNavigationHandler();
  unregisterDocumentNavigationHandler();
  unregisterTaskNavigationHandler();
  unregisterCalendarEventNavigationHandler();
  unregisterTimeEntryNavigationHandler();
  unregisterInvoiceNavigationHandler();
  unregisterLegalSearchNavigationHandler();
}

export function buildMatterLifecycleExecutionReport(input: {
  readonly startedAt: number;
  readonly completedAt: number;
  readonly steps: readonly MatterLifecycleStepReport[];
  readonly knowledgeProvidersExercised: readonly string[];
  readonly searchProvidersExercised: readonly string[];
  readonly navigationRoutes: readonly string[];
  readonly notificationsGenerated: number;
  readonly activitiesGenerated: number;
  readonly warnings?: readonly string[];
}): MatterLifecycleExecutionReport {
  const clientSummary = getClientWorkflowDiagnostics().getSummary();
  const matterSummary = getMatterWorkflowDiagnostics().getSummary();
  const documentSummary = getDocumentWorkflowDiagnostics().getSummary();
  const taskSummary = getTaskWorkflowDiagnostics().getSummary();
  const calendarSummary = getCalendarEventWorkflowDiagnostics().getSummary();
  const timeSummary = getTimeEntryWorkflowDiagnostics().getSummary();
  const invoiceSummary = getInvoiceWorkflowDiagnostics().getSummary();
  const searchSummary = getLegalSearchWorkflowDiagnostics().getSummary();

  const validationFailures =
    clientSummary.validationFailures +
    matterSummary.validationFailures +
    documentSummary.validationFailures +
    taskSummary.validationFailures +
    calendarSummary.validationFailures +
    timeSummary.validationFailures;

  const commandsExecuted =
    clientSummary.commandsExecuted +
    matterSummary.commandsExecuted +
    documentSummary.commandsExecuted +
    taskSummary.commandsExecuted +
    calendarSummary.commandsExecuted +
    timeSummary.commandsExecuted +
    invoiceSummary.commandsExecuted +
    searchSummary.totalRuns;

  const eventsPublished =
    clientSummary.eventsRaised +
    matterSummary.eventsRaised +
    documentSummary.eventsRaised +
    taskSummary.eventsRaised +
    calendarSummary.eventsRaised +
    timeSummary.eventsRaised +
    invoiceSummary.eventsRaised +
    searchSummary.eventsRaised;

  const stepWarnings = input.steps.flatMap((step) => step.warnings);
  const warnings = [...(input.warnings ?? []), ...stepWarnings];

  return {
    startedAt: new Date(input.startedAt).toISOString(),
    completedAt: new Date(input.completedAt).toISOString(),
    totalDurationMs: input.completedAt - input.startedAt,
    steps: input.steps,
    commandsExecuted,
    eventsPublished,
    notificationsGenerated: input.notificationsGenerated,
    activitiesGenerated: input.activitiesGenerated,
    knowledgeProvidersExercised: input.knowledgeProvidersExercised,
    searchProvidersExercised: input.searchProvidersExercised,
    repositoryMutations: {
      clients: clientSummary.repositoryMutations,
      matters: matterSummary.repositoryMutations,
      documents: documentSummary.repositoryMutations,
      tasks: taskSummary.repositoryMutations,
      calendarEvents: calendarSummary.repositoryMutations,
      timeEntries: timeSummary.repositoryMutations,
      invoices: invoiceSummary.successfulRuns,
    },
    validationFailures,
    warnings,
    navigationRoutes: input.navigationRoutes,
  };
}
