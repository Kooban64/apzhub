import type { QepRequirementDto } from "@apzhub/qep-contracts";
import type {
  CoverageState,
  PresentedCriterion,
  PresentedStory,
  QepAcceptanceCriterion,
  QepCriterionVerificationLink,
  QepUserStory,
  ResultState,
} from "@apzhub/qep-definition";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  if (body.data === undefined) throw new Error("Empty response");
  return body.data;
}

export type DefinitionRequirementRow = {
  readonly requirement: QepRequirementDto;
  readonly storyCount: number;
  readonly criterionCount: number;
  readonly coveredCount: number;
  readonly gapCount: number;
  readonly coverage: CoverageState;
  readonly coverageLabel: string;
};

export type RequirementDefinition = {
  readonly requirement: QepRequirementDto;
  readonly stories: readonly PresentedStory[];
  readonly criteria: readonly PresentedCriterion[];
  readonly coverage: {
    readonly coverage: CoverageState;
    readonly result: ResultState;
    readonly criterionCount: number;
    readonly coveredCount: number;
    readonly gapCount: number;
    readonly coverageLabel: string;
  };
  readonly audit: readonly {
    readonly id: string;
    readonly action: string;
    readonly actorUserId: string;
    readonly createdAt: string;
    readonly detailsJson: Readonly<Record<string, unknown>>;
  }[];
};

export async function listDefinitionRequirements(applicationId: string): Promise<{
  readonly items: readonly DefinitionRequirementRow[];
}> {
  const response = await fetch(
    `/api/v1/qep/definition/requirements?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  const items = await parseJson<readonly DefinitionRequirementRow[]>(response);
  return { items };
}

export async function getRequirementDefinition(
  requirementId: string,
): Promise<RequirementDefinition> {
  const response = await fetch(
    `/api/v1/qep/requirements/${encodeURIComponent(requirementId)}/definition`,
    { cache: "no-store" },
  );
  return parseJson(response);
}

export async function createUserStory(input: {
  readonly applicationId: string;
  readonly requirementId: string;
  readonly title: string;
  readonly description?: string;
  readonly storyType?: string;
  readonly status?: string;
  readonly priority?: string;
  readonly estimatePoints?: number;
}): Promise<{ readonly story: QepUserStory }> {
  const response = await fetch("/api/v1/qep/user-stories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson(response);
}

export async function patchUserStory(
  storyId: string,
  body: Record<string, unknown>,
): Promise<{ readonly story: QepUserStory }> {
  const response = await fetch(
    `/api/v1/qep/user-stories/${encodeURIComponent(storyId)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  return parseJson(response);
}

export async function createAcceptanceCriterion(input: {
  readonly applicationId: string;
  readonly requirementId: string;
  readonly text: string;
  readonly userStoryId?: string;
  readonly required?: boolean;
}): Promise<{ readonly criterion: QepAcceptanceCriterion }> {
  const response = await fetch("/api/v1/qep/acceptance-criteria", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson(response);
}

export async function patchAcceptanceCriterion(
  criterionId: string,
  body: Record<string, unknown>,
): Promise<{ readonly criterion: QepAcceptanceCriterion }> {
  const response = await fetch(
    `/api/v1/qep/acceptance-criteria/${encodeURIComponent(criterionId)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  return parseJson(response);
}

export async function linkCriterionVerification(
  criterionId: string,
  input: {
    readonly assetKind: "test_specification";
    readonly assetId: string;
    readonly latestResult?: "pass" | "fail" | "blocked";
  },
): Promise<{ readonly link: QepCriterionVerificationLink }> {
  const response = await fetch(
    `/api/v1/qep/acceptance-criteria/${encodeURIComponent(criterionId)}/verification`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return parseJson(response);
}

export type { PresentedCriterion, PresentedStory };
