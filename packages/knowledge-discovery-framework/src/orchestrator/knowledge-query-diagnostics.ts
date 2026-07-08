/** Query execution diagnostics — observability without provider internals (DF-006). */
export interface KnowledgeQueryDiagnostics {
  readonly queryText: string;
  readonly durationMs: number;
  readonly sourceCount: number;
  readonly queriedSourceCount: number;
  readonly skippedSourceCount: number;
  readonly skippedSourceIds: readonly string[];
  readonly providerSuccessCount: number;
  readonly providerErrorCount: number;
  readonly providerEmptyCount: number;
  readonly providerNotImplementedCount: number;
  readonly mergedDocumentCount: number;
  readonly deduplicatedDocumentCount: number;
  readonly returnedDocumentCount: number;
  readonly rankingStrategyId?: string;
  readonly rankingDurationMs?: number;
  readonly rankingInputCount?: number;
  readonly rankingOutputCount?: number;
  readonly rankingFilteredCount?: number;
}

export function createEmptyKnowledgeQueryDiagnostics(
  queryText = "",
): KnowledgeQueryDiagnostics {
  return {
    queryText,
    durationMs: 0,
    sourceCount: 0,
    queriedSourceCount: 0,
    skippedSourceCount: 0,
    skippedSourceIds: [],
    providerSuccessCount: 0,
    providerErrorCount: 0,
    providerEmptyCount: 0,
    providerNotImplementedCount: 0,
    mergedDocumentCount: 0,
    deduplicatedDocumentCount: 0,
    returnedDocumentCount: 0,
  };
}
