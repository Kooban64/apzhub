import type {
  PresentedExperienceActivity,
  PresentedExperiencePlan,
  PresentedExploratorySession,
} from "@apzhub/qep-experience/domain";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  if (body.data === undefined) throw new Error("Empty response");
  return body.data;
}

export async function listExploratorySessions(
  applicationId: string,
): Promise<readonly PresentedExploratorySession[]> {
  const response = await fetch(
    `/api/v1/qep/exploratory-sessions?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  return parseJson(response);
}

export async function getExploratorySession(
  id: string,
): Promise<PresentedExploratorySession> {
  const response = await fetch(
    `/api/v1/qep/exploratory-sessions/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
    },
  );
  const body = await parseJson<{ session: PresentedExploratorySession }>(response);
  return body.session;
}

export async function createExploratorySession(input: {
  readonly applicationId: string;
  readonly name: string;
  readonly mission: string;
  readonly scope: string;
  readonly environmentId?: string;
  readonly areas?: readonly string[];
}): Promise<PresentedExploratorySession> {
  const response = await fetch("/api/v1/qep/exploratory-sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ session: PresentedExploratorySession }>(response);
  return body.session;
}

export async function patchExploratorySession(
  id: string,
  input: Record<string, unknown>,
): Promise<PresentedExploratorySession> {
  const response = await fetch(
    `/api/v1/qep/exploratory-sessions/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const body = await parseJson<{ session: PresentedExploratorySession }>(response);
  return body.session;
}

export async function exploratorySessionAction(
  id: string,
  action: string,
  extra: Record<string, unknown> = {},
): Promise<PresentedExploratorySession> {
  const response = await fetch(
    `/api/v1/qep/exploratory-sessions/${encodeURIComponent(id)}/actions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    },
  );
  const body = await parseJson<{ session: PresentedExploratorySession }>(response);
  return body.session;
}

export async function listExperiencePlans(
  applicationId: string,
): Promise<readonly PresentedExperiencePlan[]> {
  const response = await fetch(
    `/api/v1/qep/experience-plans?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  return parseJson(response);
}

export async function getExperiencePlan(id: string): Promise<PresentedExperiencePlan> {
  const response = await fetch(
    `/api/v1/qep/experience-plans/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
    },
  );
  const body = await parseJson<{ plan: PresentedExperiencePlan }>(response);
  return body.plan;
}

export async function createExperiencePlan(input: {
  readonly applicationId: string;
  readonly name: string;
  readonly mission: string;
  readonly scope: string;
  readonly environmentId?: string;
  readonly disciplines?: readonly string[];
}): Promise<PresentedExperiencePlan> {
  const response = await fetch("/api/v1/qep/experience-plans", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ plan: PresentedExperiencePlan }>(response);
  return body.plan;
}

export async function experiencePlanAction(
  id: string,
  action: string,
  extra: Record<string, unknown> = {},
): Promise<{ plan?: PresentedExperiencePlan; activity?: PresentedExperienceActivity }> {
  const response = await fetch(
    `/api/v1/qep/experience-plans/${encodeURIComponent(id)}/actions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    },
  );
  return parseJson(response);
}

export async function getExperienceActivity(
  id: string,
): Promise<PresentedExperienceActivity> {
  const response = await fetch(
    `/api/v1/qep/experience-activities/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
    },
  );
  const body = await parseJson<{ activity: PresentedExperienceActivity }>(response);
  return body.activity;
}

export async function experienceActivityAction(
  id: string,
  action: string,
  extra: Record<string, unknown> = {},
): Promise<PresentedExperienceActivity> {
  const response = await fetch(
    `/api/v1/qep/experience-activities/${encodeURIComponent(id)}/actions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    },
  );
  const body = await parseJson<{ activity: PresentedExperienceActivity }>(response);
  return body.activity;
}

export async function createQualityCapture(
  input: Record<string, unknown>,
): Promise<unknown> {
  const response = await fetch("/api/v1/qep/quality-capture", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson(response);
}

export async function qualityIssueAction(
  issueId: string,
  action: string,
  extra: Record<string, unknown> = {},
): Promise<unknown> {
  const response = await fetch(
    `/api/v1/qep/quality-issues/${encodeURIComponent(issueId)}/actions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    },
  );
  return parseJson(response);
}

export async function attachQualityEvidence(input: {
  readonly evidenceId: string;
  readonly targetKind: string;
  readonly targetId: string;
}): Promise<void> {
  const response = await fetch("/api/v1/qep/quality-evidence", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  await parseJson(response);
}

export async function addQualityTrace(input: {
  readonly fromKind: "exploratory_session" | "experience_plan";
  readonly fromId: string;
  readonly toKind: string;
  readonly toId: string;
}): Promise<void> {
  const response = await fetch("/api/v1/qep/quality-traces", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  await parseJson(response);
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy);
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function captureAndAttachEvidence(input: {
  readonly applicationId: string;
  readonly targetKind: string;
  readonly targetId: string;
  readonly title: string;
  readonly body?: string;
}): Promise<string> {
  const text = input.body?.trim() || input.title.trim() || "Phase 5 evidence";
  const bytes = new TextEncoder().encode(text);
  const capture = await fetch("/api/v1/qep/evidence", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      projectId: input.applicationId,
      mediaType: "text/plain",
      contentBase64: btoa(String.fromCharCode(...bytes)),
      contentHash: await sha256Hex(bytes),
      title: input.title.trim() || "Phase 5 evidence",
    }),
  });
  const created = await parseJson<{ id?: string }>(capture);
  if (!created.id) throw new Error("evidence.id_missing");
  await attachQualityEvidence({
    evidenceId: created.id,
    targetKind: input.targetKind,
    targetId: input.targetId,
  });
  return created.id;
}
