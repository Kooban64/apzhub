export type DependencyGraphErrorCode =
  | "INVALID_INPUT"
  | "MISSING_DEPENDENCY"
  | "CYCLE_DETECTED"
  | "EMPTY_GRAPH"
  | "VERSION_CONFLICT";

export interface DependencyGraphError {
  code: DependencyGraphErrorCode;
  message: string;
  capabilityId?: string;
  dependencyId?: string;
  cycle?: readonly string[];
  field?: string;
}

export function dependencyGraphError(
  code: DependencyGraphErrorCode,
  message: string,
  details: Omit<DependencyGraphError, "code" | "message"> = {},
): DependencyGraphError {
  return { code, message, ...details };
}
