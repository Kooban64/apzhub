import type { AiProposalRecord, DeterministicAnalysis } from "@apzhub/qep-ai";

async function parseJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  if (body.data === undefined) throw new Error("Empty response");
  return body.data;
}

export async function fetchAiCompanion(applicationId: string) {
  const response = await fetch(
    `/api/v1/qep/ai/companion?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  return parseJson<{
    applicationId: string;
    sourceAccess: "authorised" | "not_authorised";
    sourceAuthorised: boolean;
    denied: readonly string[];
    posture: string;
    facts: Record<string, unknown>;
    risks: readonly { id: string; title: string; severity: string; status: string }[];
    gates: readonly { id: string; result: string }[];
    analysis: DeterministicAnalysis;
    contextCounts: { records: number; evidence: number };
  }>(response);
}

export async function fetchAiAnalysis(applicationId: string) {
  const response = await fetch(
    `/api/v1/qep/ai/analysis?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  return parseJson<{ analysis: DeterministicAnalysis; source: string }>(response);
}

export async function askAi(input: {
  readonly applicationId: string;
  readonly question: string;
}) {
  const response = await fetch("/api/v1/qep/ai/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<{
    ephemeral: true;
    answer: string;
    sourceAccess: string;
    sourceAuthorised: boolean;
    provider: string;
  }>(response);
}

export async function generateAiProposal(input: Record<string, unknown>) {
  const response = await fetch("/api/v1/qep/ai/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<{
    draft: true;
    proposalType: string;
    content: Record<string, unknown>;
    provider: string;
    model: string;
    sourceAccess: string;
    sourceAuthorised: boolean;
  }>(response);
}

export async function sendAiProposalToReview(input: Record<string, unknown>) {
  const response = await fetch("/api/v1/qep/ai/proposals", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await parseJson<{ proposal: AiProposalRecord }>(response);
  return body.proposal;
}

export async function listAiProposals(applicationId: string) {
  const response = await fetch(
    `/api/v1/qep/ai/proposals?applicationId=${encodeURIComponent(applicationId)}`,
    { cache: "no-store" },
  );
  const body = await parseJson<{ items: readonly AiProposalRecord[] }>(response);
  return body.items;
}

export async function modifyAiProposal(
  proposalId: string,
  content: Record<string, unknown>,
) {
  const response = await fetch(
    `/api/v1/qep/ai/proposals/${encodeURIComponent(proposalId)}/modify`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content }),
    },
  );
  const body = await parseJson<{ proposal: AiProposalRecord }>(response);
  return body.proposal;
}

export async function rejectAiProposal(proposalId: string) {
  const response = await fetch(
    `/api/v1/qep/ai/proposals/${encodeURIComponent(proposalId)}/reject`,
    { method: "POST" },
  );
  const body = await parseJson<{ proposal: AiProposalRecord }>(response);
  return body.proposal;
}

export async function acceptAiProposal(proposalId: string) {
  const response = await fetch(
    `/api/v1/qep/ai/proposals/${encodeURIComponent(proposalId)}/accept`,
    { method: "POST" },
  );
  const body = await parseJson<{ proposal: AiProposalRecord }>(response);
  return body.proposal;
}

export async function createRiskFromProposal(input: Record<string, unknown>) {
  const response = await fetch("/api/v1/qep/risk", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "create", ...input }),
  });
  return parseJson(response);
}
