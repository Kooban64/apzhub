import { ExecutionValidationError } from "../../shared/errors";
import { createActorId } from "./value-objects";

export type ExternalExecutionSubmission = {
  readonly id: string;
  readonly sourceSystemId: string;
  readonly agentIdentity: string;
  readonly idempotencyKey: string;
  readonly payloadHash: string;
  readonly signatureMetadata?: string;
  readonly isComplete: boolean;
  readonly correlationId?: string;
  readonly receivedAt: string;
  readonly receivedBy: string;
  readonly quarantineReason?: string;
};

export function createExternalExecutionSubmission(input: {
  readonly id: string;
  readonly sourceSystemId: string;
  readonly agentIdentity: string;
  readonly idempotencyKey: string;
  readonly payloadHash: string;
  readonly signatureMetadata?: string;
  readonly isComplete: boolean;
  readonly correlationId?: string;
  readonly receivedAt: string;
  readonly receivedBy: string;
  readonly quarantineReason?: string;
}): ExternalExecutionSubmission {
  return {
    id: input.id.trim(),
    sourceSystemId: assertExternalField(input.sourceSystemId, "sourceSystemId"),
    agentIdentity: assertExternalField(input.agentIdentity, "agentIdentity"),
    idempotencyKey: assertExternalField(input.idempotencyKey, "idempotencyKey"),
    payloadHash: assertExternalField(input.payloadHash, "payloadHash"),
    ...(input.signatureMetadata?.trim()
      ? { signatureMetadata: input.signatureMetadata.trim() }
      : {}),
    isComplete: input.isComplete,
    ...(input.correlationId?.trim()
      ? { correlationId: input.correlationId.trim() }
      : {}),
    receivedAt: input.receivedAt.trim(),
    receivedBy: createActorId(input.receivedBy),
    ...(input.quarantineReason?.trim()
      ? { quarantineReason: input.quarantineReason.trim() }
      : {}),
  };
}

function assertExternalField(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ExecutionValidationError(`${field} is required for external ingestion`);
  }
  return trimmed;
}

export function findSubmissionByIdempotencyKey(
  submissions: readonly ExternalExecutionSubmission[],
  sourceSystemId: string,
  idempotencyKey: string,
): ExternalExecutionSubmission | undefined {
  return submissions.find(
    (submission) =>
      submission.sourceSystemId === sourceSystemId &&
      submission.idempotencyKey === idempotencyKey,
  );
}

export function submissionKey(sourceSystemId: string, idempotencyKey: string): string {
  return `${sourceSystemId}:${idempotencyKey}`;
}
