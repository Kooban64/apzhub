import type {
  PresentedExecution,
  PresentedPlan,
  PresentedSuite,
  PresentedTestCase,
} from "@apzhub/qep-test-management";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  if (body.data === undefined) throw new Error("Empty response");
  return body.data;
}

export async function listTestCases(
  applicationId: string,
): Promise<readonly PresentedTestCase[]> {
  const response = await fetch(
    `/api/v1/qep/test-cases?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  return parseJson(response);
}

export async function getTestCase(id: string): Promise<PresentedTestCase> {
  const response = await fetch(`/api/v1/qep/test-cases/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  const body = await parseJson<{ testCase: PresentedTestCase }>(response);
  return body.testCase;
}

export async function createTestCase(input: {
  readonly applicationId: string;
  readonly title: string;
  readonly description?: string;
  readonly type?: string;
  readonly priority?: string;
  readonly preconditions?: readonly string[];
  readonly steps?: readonly {
    readonly order: number;
    readonly action: string;
    readonly testDataRef?: string;
    readonly expectedResult: string;
  }[];
}): Promise<PresentedTestCase> {
  const response = await fetch("/api/v1/qep/test-cases", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ testCase: PresentedTestCase }>(response);
  return body.testCase;
}

export async function updateTestCase(
  id: string,
  input: Record<string, unknown>,
): Promise<PresentedTestCase> {
  const response = await fetch(`/api/v1/qep/test-cases/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ testCase: PresentedTestCase }>(response);
  return body.testCase;
}

export async function linkTestCaseCriterion(
  testCaseId: string,
  criterionId: string,
): Promise<void> {
  const response = await fetch(
    `/api/v1/qep/test-cases/${encodeURIComponent(testCaseId)}/criteria`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ criterionId }),
    },
  );
  await parseJson(response);
}

export async function listTestSuites(
  applicationId: string,
): Promise<readonly PresentedSuite[]> {
  const response = await fetch(
    `/api/v1/qep/test-suites?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  return parseJson(response);
}

export async function getTestSuite(id: string): Promise<PresentedSuite> {
  const response = await fetch(`/api/v1/qep/test-suites/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  const body = await parseJson<{ suite: PresentedSuite }>(response);
  return body.suite;
}

export async function createTestSuite(input: {
  readonly applicationId: string;
  readonly name: string;
  readonly description?: string;
}): Promise<PresentedSuite> {
  const response = await fetch("/api/v1/qep/test-suites", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ suite: PresentedSuite }>(response);
  return body.suite;
}

export async function addSuiteMember(
  suiteId: string,
  specificationId: string,
): Promise<PresentedSuite> {
  const response = await fetch(
    `/api/v1/qep/test-suites/${encodeURIComponent(suiteId)}/members`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ specificationId }),
    },
  );
  const body = await parseJson<{ suite: PresentedSuite }>(response);
  return body.suite;
}

export async function listTestPlans(
  applicationId: string,
): Promise<readonly PresentedPlan[]> {
  const response = await fetch(
    `/api/v1/qep/test-plans?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  return parseJson(response);
}

export async function getTestPlan(id: string): Promise<PresentedPlan> {
  const response = await fetch(`/api/v1/qep/test-plans/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  const body = await parseJson<{ plan: PresentedPlan }>(response);
  return body.plan;
}

export async function createTestPlan(input: {
  readonly applicationId: string;
  readonly title: string;
  readonly objective: string;
  readonly description?: string;
}): Promise<PresentedPlan> {
  const response = await fetch("/api/v1/qep/test-plans", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ plan: PresentedPlan }>(response);
  return body.plan;
}

export async function addPlanMember(
  planId: string,
  input: { readonly suiteId?: string; readonly specificationId?: string },
): Promise<PresentedPlan> {
  const response = await fetch(
    `/api/v1/qep/test-plans/${encodeURIComponent(planId)}/members`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const body = await parseJson<{ plan: PresentedPlan }>(response);
  return body.plan;
}

export async function addPlanStrategy(
  planId: string,
  input: Record<string, unknown>,
): Promise<PresentedPlan> {
  const response = await fetch(
    `/api/v1/qep/test-plans/${encodeURIComponent(planId)}/strategy`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const body = await parseJson<{ plan: PresentedPlan }>(response);
  return body.plan;
}

export async function listPlanExecutions(
  planId: string,
): Promise<readonly PresentedExecution[]> {
  const response = await fetch(
    `/api/v1/qep/test-plans/${encodeURIComponent(planId)}/executions`,
    { cache: "no-store" },
  );
  return parseJson(response);
}
