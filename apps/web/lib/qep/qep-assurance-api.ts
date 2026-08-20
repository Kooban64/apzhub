import type {
  CertificationExceptionRecord,
  PresentedQualityRisk,
  QualityGateDefinitionRecord,
  QualityGateEvaluationRecord,
  ReadinessSnapshot,
} from "@apzhub/qep-assurance/domain";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  if (body.data === undefined) throw new Error("Empty response");
  return body.data;
}

export async function listQualityRisks(
  applicationId: string,
): Promise<readonly PresentedQualityRisk[]> {
  const response = await fetch(
    `/api/v1/qep/risk?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  const body = await parseJson<{ items: readonly PresentedQualityRisk[] }>(response);
  return body.items;
}

export async function createQualityRisk(
  input: Record<string, unknown>,
): Promise<PresentedQualityRisk> {
  const response = await fetch("/api/v1/qep/risk", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "create", ...input }),
  });
  return parseJson(response);
}

export async function mutateQualityRisk(
  input: Record<string, unknown>,
): Promise<PresentedQualityRisk> {
  const response = await fetch("/api/v1/qep/risk", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson(response);
}

export async function listQualityGates(
  applicationId: string,
): Promise<readonly QualityGateDefinitionRecord[]> {
  const response = await fetch(
    `/api/v1/qep/quality-gates?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  const body = await parseJson<{ items: readonly QualityGateDefinitionRecord[] }>(
    response,
  );
  return body.items;
}

export async function createQualityGate(
  input: Record<string, unknown>,
): Promise<QualityGateDefinitionRecord> {
  const response = await fetch("/api/v1/qep/quality-gates", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ gate: QualityGateDefinitionRecord }>(response);
  return body.gate;
}

export async function evaluateQualityGate(
  gateId: string,
  input: Record<string, unknown>,
): Promise<QualityGateEvaluationRecord> {
  const response = await fetch(
    `/api/v1/qep/quality-gates/${encodeURIComponent(gateId)}/evaluate`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const body = await parseJson<{ evaluation: QualityGateEvaluationRecord }>(response);
  return body.evaluation;
}

export async function listGateEvaluations(
  applicationId: string,
): Promise<readonly QualityGateEvaluationRecord[]> {
  const response = await fetch(
    `/api/v1/qep/quality-gates/evaluations?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  const body = await parseJson<{ items: readonly QualityGateEvaluationRecord[] }>(
    response,
  );
  return body.items;
}

export type ReadinessPayload = {
  readonly posture: ReadinessSnapshot["posture"];
  readonly snapshot: ReadinessSnapshot;
  readonly evaluations: readonly QualityGateEvaluationRecord[];
  readonly risks: readonly PresentedQualityRisk[];
  readonly definitions: readonly QualityGateDefinitionRecord[];
};

export async function getReadiness(input: {
  readonly applicationId: string;
  readonly changeEventId?: string;
}): Promise<ReadinessPayload> {
  const search = new URLSearchParams({ applicationId: input.applicationId });
  if (input.changeEventId) search.set("changeEventId", input.changeEventId);
  const response = await fetch(`/api/v1/qep/readiness?${search.toString()}`, {
    cache: "no-store",
  });
  return parseJson(response);
}

export async function authoriseCertificationException(input: {
  readonly gateEvaluationId: string;
  readonly reason: string;
}): Promise<CertificationExceptionRecord> {
  const response = await fetch("/api/v1/qep/certification/exceptions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ exception: CertificationExceptionRecord }>(response);
  return body.exception;
}
