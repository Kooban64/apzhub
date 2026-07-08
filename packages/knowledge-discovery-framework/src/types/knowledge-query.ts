/** Query input for knowledge discovery — orchestrated by DF-006. */
export interface KnowledgeQuery {
  readonly text: string;
  readonly limit?: number;
  readonly filters?: Readonly<Record<string, unknown>>;
  readonly workspaceId?: string;
}
