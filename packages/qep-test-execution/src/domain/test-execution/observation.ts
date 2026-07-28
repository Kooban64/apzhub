import { ExecutionValidationError } from "../../shared/errors";
import { EXECUTION_OBSERVATION_MAX } from "./constants";
import { createActorId, createExecutionText } from "./value-objects";

export type ExecutionObservation = {
  readonly id: string;
  readonly body: string;
  readonly actorId: string;
  readonly recordedAt: string;
  readonly severityHint?: "info" | "warning" | "critical";
  readonly structured?: Readonly<Record<string, string>>;
};

export function createExecutionObservation(input: {
  readonly id: string;
  readonly body: string;
  readonly actorId: string;
  readonly recordedAt: string;
  readonly severityHint?: "info" | "warning" | "critical";
  readonly structured?: Readonly<Record<string, string>>;
}): ExecutionObservation {
  const body = createExecutionText(input.body, "observation body");
  if (body.length > EXECUTION_OBSERVATION_MAX) {
    throw new ExecutionValidationError(
      `observation body exceeds maximum length of ${EXECUTION_OBSERVATION_MAX}`,
    );
  }
  return {
    id: input.id.trim(),
    body,
    actorId: createActorId(input.actorId),
    recordedAt: input.recordedAt.trim(),
    ...(input.severityHint ? { severityHint: input.severityHint } : {}),
    ...(input.structured ? { structured: { ...input.structured } } : {}),
  };
}
