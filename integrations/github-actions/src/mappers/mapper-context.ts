export interface MapperContext {
  readonly tenantId: string;
  readonly correlationId?: string;
  readonly owner?: string;
  readonly repo?: string;
}
