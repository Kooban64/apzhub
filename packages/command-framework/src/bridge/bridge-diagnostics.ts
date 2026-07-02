/** Aggregate diagnostics for bridge translation activity. */
export interface WorkbenchCommandBridgeDiagnostics {
  readonly status: "ready";
  readonly supportedActionIds: readonly string[];
  readonly translationCount: number;
  readonly unsupportedActionCount: number;
  readonly invalidPayloadCount: number;
  readonly lastTranslationAt?: string;
}

export function createInitialBridgeDiagnostics(
  supportedActionIds: readonly string[],
): WorkbenchCommandBridgeDiagnostics {
  return {
    status: "ready",
    supportedActionIds,
    translationCount: 0,
    unsupportedActionCount: 0,
    invalidPayloadCount: 0,
  };
}
