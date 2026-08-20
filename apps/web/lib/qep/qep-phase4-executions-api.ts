import type {
  DefinitionSnapshot,
  ExecutionRelation,
  PresentedExecution,
  PresentedPlan,
  ScopeSnapshot,
  StrategySnapshot,
} from "@apzhub/qep-test-management";
import type { TestExecutionDto } from "@apzhub/qep-test-execution";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  if (body.data === undefined) throw new Error("Empty response");
  return body.data;
}

export type ProviderExecutionSidecar = {
  readonly id: string;
  readonly providerId: string;
  readonly state: string;
  readonly correlationId: string;
  readonly artifacts: readonly {
    readonly artifactId: string;
    readonly kind: string;
    readonly name: string;
    readonly contentType: string;
    readonly uri?: string;
    readonly sha256?: string;
  }[];
  readonly logRefs: readonly { readonly name: string; readonly uri?: string }[];
};

export type ExecutionInvestigation = {
  readonly presented: PresentedExecution | null;
  readonly testExecution: TestExecutionDto | null;
  readonly definition: DefinitionSnapshot | null;
  readonly scope: ScopeSnapshot | null;
  readonly strategy: StrategySnapshot | null;
  readonly relation: ExecutionRelation | null;
  readonly automation: readonly {
    readonly automationExecutionId: string;
    readonly correlationId?: string;
  }[];
  readonly providerExecutions: readonly ProviderExecutionSidecar[];
  readonly testCase: {
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly priority: string;
    readonly type: string;
    readonly preconditions: readonly string[];
    readonly criterionIds: readonly string[];
    readonly suiteIds: readonly string[];
    readonly unbound: boolean;
  } | null;
  readonly history: {
    readonly executionId: string;
    readonly entries: readonly {
      readonly action?: string;
      readonly at?: string;
      readonly actorId?: string;
      readonly summary?: string;
    }[];
  };
  readonly defects: readonly {
    readonly defect: {
      readonly defectId: string;
      readonly number?: string;
      readonly title: string;
      readonly status: string;
    };
  }[];
  readonly linkedRecords: {
    readonly requirement: readonly string[];
    readonly acceptanceCriteria: readonly string[];
    readonly testCase: readonly string[];
    readonly suite: readonly string[];
    readonly testPlan: readonly string[];
    readonly execution: readonly string[];
    readonly evidence: readonly string[];
    readonly defects: readonly string[];
    readonly rerun: readonly string[];
    readonly retest: readonly string[];
  };
};

export async function listPresentedExecutions(
  applicationId: string,
  includeUnbound = false,
): Promise<readonly PresentedExecution[]> {
  const search = new URLSearchParams({ applicationId });
  if (includeUnbound) search.set("includeUnbound", "true");
  const response = await fetch(
    `/api/v1/qep/presented-executions?${search.toString()}`,
    {
      cache: "no-store",
    },
  );
  return parseJson(response);
}

export async function startPlanExecution(planId: string): Promise<{
  readonly executions: readonly TestExecutionDto[];
  readonly count: number;
}> {
  const response = await fetch(
    `/api/v1/qep/test-plans/${encodeURIComponent(planId)}/start-execution`,
    { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
  );
  return parseJson(response);
}

export async function getExecutionInvestigation(
  executionId: string,
): Promise<ExecutionInvestigation> {
  const response = await fetch(
    `/api/v1/qep/executions/${encodeURIComponent(executionId)}/investigation`,
    { cache: "no-store" },
  );
  return parseJson(response);
}

export async function createRetest(
  executionId: string,
  defectId: string,
): Promise<{ readonly execution: TestExecutionDto }> {
  const response = await fetch(
    `/api/v1/qep/executions/${encodeURIComponent(executionId)}/retest`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ defectId }),
    },
  );
  return parseJson(response);
}

export async function createRerun(
  executionId: string,
): Promise<{ readonly execution: TestExecutionDto; readonly originalId: string }> {
  const response = await fetch(
    `/api/v1/qep/executions/${encodeURIComponent(executionId)}/rerun`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    },
  );
  return parseJson(response);
}

export async function createExecutionDefect(input: {
  readonly testExecutionId: string;
  readonly title: string;
  readonly description?: string;
  readonly severity?: "critical" | "major" | "minor" | "trivial";
}): Promise<{ readonly defectId: string }> {
  const response = await fetch("/api/v1/qep/defects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ defectId?: string; defect?: { defectId?: string } }>(
    response,
  );
  const defectId = body.defectId ?? body.defect?.defectId;
  if (!defectId) throw new Error("defect.create.failed");
  return { defectId };
}

export type { PresentedExecution, PresentedPlan };
