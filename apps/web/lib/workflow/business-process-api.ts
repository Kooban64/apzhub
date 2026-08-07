/**
 * Business process excellence client — APZ-WORKFLOW-CAPABILITY-001.
 * Calls ONLY `/api/v1/workflow/*` business-language routes.
 */

import { WorkflowApiError } from "./errors";

export type BusinessProcessPublicationStatus =
  "draft" | "review" | "approved" | "retired";

export type BusinessJourneyStage = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly order: number;
  readonly responsibility?: string;
  readonly entryCondition?: string;
  readonly exitCondition?: string;
};

export type BusinessJourneyTransition = {
  readonly id: string;
  readonly fromStageId: string;
  readonly toStageId: string;
  readonly name: string;
  readonly outcome?: string;
};

export type BusinessJourney = {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly outcomes: readonly string[];
  readonly stages: readonly BusinessJourneyStage[];
  readonly transitions: readonly BusinessJourneyTransition[];
  readonly processOwner: string;
  readonly businessSteward: string;
  readonly version: number;
  readonly publicationStatus: BusinessProcessPublicationStatus;
  readonly reviewCycleDays?: number;
  readonly nextReviewAt?: string;
  readonly templateKey?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type BusinessProcessTemplate = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly summary: string;
  readonly defaultOutcomes: readonly string[];
  readonly version: number;
  readonly editable: boolean;
};

export type BusinessProcessMonitoring = {
  readonly journeyId?: string;
  readonly activeInstances: number;
  readonly stalledStages: number;
  readonly overdueTransitions: number;
  readonly completedCount: number;
  readonly completionRatePercent: number;
  readonly byStage: readonly {
    readonly stageId: string;
    readonly stageName: string;
    readonly activeCount: number;
    readonly stalledCount: number;
  }[];
  readonly computedAt: string;
};

export type BusinessProcessAuditEntry = {
  readonly id: string;
  readonly journeyId: string;
  readonly action: string;
  readonly fromStatus?: BusinessProcessPublicationStatus;
  readonly toStatus?: BusinessProcessPublicationStatus;
  readonly actor: string;
  readonly notes?: string;
  readonly at: string;
};

type Options = { readonly signal?: AbortSignal };

async function requestJson<T>(
  path: string,
  init: RequestInit & Options = {},
): Promise<T> {
  const { signal, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`/api/v1${path}`, {
    ...rest,
    signal,
    credentials: "include",
    headers,
  });
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const record =
    typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const error =
    typeof record.error === "object" && record.error !== null
      ? (record.error as Record<string, unknown>)
      : undefined;
  if (!response.ok) {
    throw WorkflowApiError.fromHttp({
      status: response.status,
      message: typeof error?.message === "string" ? error.message : undefined,
      code: typeof error?.code === "string" ? error.code : undefined,
    });
  }
  if (!("data" in record)) {
    throw WorkflowApiError.fromHttp({
      status: 502,
      message: "Unexpected Workflow response envelope.",
    });
  }
  return body as T;
}

type DataEnvelope<T> = { readonly data: T };

export async function listBusinessJourneys(options?: Options) {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly BusinessJourney[] }>
  >("/workflow/business-journeys", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function getBusinessJourney(journeyId: string, options?: Options) {
  const envelope = await requestJson<DataEnvelope<BusinessJourney>>(
    `/workflow/business-journeys/${journeyId}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function createBusinessJourney(
  input: {
    readonly name: string;
    readonly summary: string;
    readonly processOwner: string;
    readonly businessSteward: string;
    readonly outcomes?: readonly string[];
    readonly stages?: readonly Omit<BusinessJourneyStage, "id">[];
    readonly reviewCycleDays?: number;
  },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<BusinessJourney>>(
    "/workflow/business-journeys",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updateBusinessJourney(
  journeyId: string,
  input: Record<string, unknown>,
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<BusinessJourney>>(
    `/workflow/business-journeys/${journeyId}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function transitionJourneyGovernance(
  journeyId: string,
  input: {
    readonly publicationStatus: BusinessProcessPublicationStatus;
    readonly notes?: string;
  },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<BusinessJourney>>(
    `/workflow/business-journeys/${journeyId}/governance`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listJourneyAudit(journeyId: string, options?: Options) {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly BusinessProcessAuditEntry[] }>
  >(`/workflow/business-journeys/${journeyId}/audit`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function listProcessTemplates(options?: Options) {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly BusinessProcessTemplate[] }>
  >("/workflow/process-templates", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function instantiateProcessTemplate(
  templateKey: string,
  input: {
    readonly processOwner: string;
    readonly businessSteward: string;
    readonly name?: string;
  },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<BusinessJourney>>(
    `/workflow/process-templates/${templateKey}/instantiate`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function getProcessMonitoring(journeyId?: string, options?: Options) {
  const qs = journeyId ? `?journeyId=${encodeURIComponent(journeyId)}` : "";
  const envelope = await requestJson<DataEnvelope<BusinessProcessMonitoring>>(
    `/workflow/process-monitoring${qs}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function createProcessInstance(
  input: {
    readonly journeyId: string;
    readonly title: string;
    readonly dueAt?: string;
  },
  options?: Options,
) {
  const envelope = await requestJson<DataEnvelope<{ id: string }>>(
    "/workflow/process-instances",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}
