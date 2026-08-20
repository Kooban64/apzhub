import type {
  QepApplication,
  QepApplicationEnvironment,
  QepApplicationExecutionTarget,
  QepApplicationRepositoryLink,
} from "@apzhub/qep-applications";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  if (body.data === undefined) throw new Error("Empty response");
  return body.data;
}

const BASE = "/api/v1/qep/applications";

export type PresentedQepApplication = QepApplication & {
  readonly ownerDisplayName: string;
  readonly projectRefs: readonly string[];
};

export type LegacyAssociationReport = {
  readonly resolvedCount: number;
  readonly unresolved: readonly { readonly projectRef: string }[];
};

export async function listApplications(params?: {
  readonly q?: string;
  readonly status?: string;
  readonly owner?: string;
}): Promise<{
  readonly applications: readonly PresentedQepApplication[];
  readonly legacyAssociations?: LegacyAssociationReport;
}> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.status) search.set("status", params.status);
  if (params?.owner) search.set("owner", params.owner);
  const qs = search.toString();
  const response = await fetch(`${BASE}${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  return parseJson(response);
}

export async function createApplication(input: {
  readonly name: string;
  readonly key: string;
  readonly description?: string;
  readonly status?: "setup" | "active";
}): Promise<{ readonly application: QepApplication }> {
  const response = await fetch(BASE, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson(response);
}

export type ApplicationDetail = {
  readonly application: PresentedQepApplication;
  readonly setup: {
    readonly repositories: "configured" | "not_configured";
    readonly environments: "configured" | "not_configured";
    readonly executionTargets: "configured" | "not_configured";
    readonly integrations: "configured" | "not_configured";
  };
  readonly counts: {
    readonly repositories: number;
    readonly environments: number;
    readonly executionTargets: number;
  };
};

export async function getApplication(
  applicationId: string,
): Promise<ApplicationDetail> {
  const response = await fetch(`${BASE}/${encodeURIComponent(applicationId)}`, {
    cache: "no-store",
  });
  return parseJson(response);
}

export type ApplicationRepositoryRow = QepApplicationRepositoryLink & {
  readonly fullName?: string;
  readonly defaultBranch?: string;
  readonly state: string;
  readonly sourceAccess: string;
};

export async function listApplicationRepositories(
  applicationId: string,
): Promise<{ readonly items: readonly ApplicationRepositoryRow[] }> {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(applicationId)}/repositories`,
    { cache: "no-store" },
  );
  return parseJson(response);
}

export async function attachApplicationRepository(
  applicationId: string,
  scmRepositoryId: string,
): Promise<void> {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(applicationId)}/repositories`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scmRepositoryId }),
    },
  );
  await parseJson(response);
}

export async function listApplicationEnvironments(
  applicationId: string,
): Promise<{ readonly items: readonly QepApplicationEnvironment[] }> {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(applicationId)}/environments`,
    { cache: "no-store" },
  );
  return parseJson(response);
}

export async function createApplicationEnvironment(
  applicationId: string,
  input: {
    readonly name: string;
    readonly category: QepApplicationEnvironment["category"];
    readonly description?: string;
    readonly baseUrl?: string;
  },
): Promise<{ readonly item: QepApplicationEnvironment }> {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(applicationId)}/environments`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return parseJson(response);
}

export async function listApplicationExecutionTargets(
  applicationId: string,
): Promise<{ readonly items: readonly QepApplicationExecutionTarget[] }> {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(applicationId)}/execution-targets`,
    { cache: "no-store" },
  );
  return parseJson(response);
}

export async function createApplicationExecutionTarget(
  applicationId: string,
  input: {
    readonly name: string;
    readonly targetType: string;
    readonly environmentId?: string;
    readonly status?: QepApplicationExecutionTarget["status"];
    readonly config?: Readonly<Record<string, unknown>>;
  },
): Promise<{ readonly item: QepApplicationExecutionTarget }> {
  const response = await fetch(
    `${BASE}/${encodeURIComponent(applicationId)}/execution-targets`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return parseJson(response);
}
