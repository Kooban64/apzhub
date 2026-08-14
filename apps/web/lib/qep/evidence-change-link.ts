/**
 * Flagship F3 — link catalogue evidence to an SCM change event (Quality Graph edge).
 */

import { getQepScmRuntime } from "@/lib/qep/scm-runtime";

export type LinkEvidenceToChangeInput = {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly evidenceId: string;
  readonly createdBy: string;
  readonly providerId?: string;
  readonly note?: string;
};

export type LinkEvidenceToChangeResult = {
  readonly linked: boolean;
  readonly linkId?: string;
  readonly reason?: string;
};

async function findChangeEvent(tenantId: string, changeEventId: string) {
  const changes = await getQepScmRuntime().listChangeEvents({
    tenantId,
    limit: 500,
  });
  return changes.find((change) => change.changeEventId === changeEventId);
}

/** Create SCM evidence traceability link for a durable change (idempotent-ish). */
export async function linkEvidenceToChange(
  input: LinkEvidenceToChangeInput,
): Promise<LinkEvidenceToChangeResult> {
  const change = await findChangeEvent(input.tenantId, input.changeEventId);
  if (!change) {
    return { linked: false, reason: "change_not_found" };
  }
  if (!change.repositoryId) {
    return { linked: false, reason: "repository_missing" };
  }

  const runtime = getQepScmRuntime();
  const existing = await runtime.listTraceabilityLinks(change.repositoryId);
  const already = existing.find(
    (link) =>
      link.kind === "evidence" &&
      link.platformRef === input.evidenceId &&
      link.externalRef === change.externalKey,
  );
  if (already) {
    return { linked: true, linkId: already.linkId, reason: "already_linked" };
  }

  const link = await runtime.addTraceabilityLink({
    tenantId: input.tenantId,
    repositoryId: change.repositoryId,
    kind: "evidence",
    externalRef: change.externalKey,
    platformRef: input.evidenceId,
    createdBy: input.createdBy,
    note:
      input.note ??
      `F3 provider evidence (${input.providerId ?? "automation"}) for change ${change.changeEventId}`,
  });

  return { linked: true, linkId: link.linkId };
}
