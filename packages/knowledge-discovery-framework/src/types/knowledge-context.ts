/** Runtime context supplied to knowledge providers during query (DF-006+). */
export interface KnowledgeContext {
  readonly permissions?: readonly string[];
  readonly activeWorkspaceId?: string;
  readonly sessionId?: string;
  readonly recentDocumentIds?: readonly string[];
  readonly frequencyMap?: Readonly<Record<string, number>>;
  readonly pinnedDocumentIds?: readonly string[];
}
