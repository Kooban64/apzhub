import type {
  ReportingRequestContext,
  ReportGenerationMetadata,
  ReportTemplate,
  ReportTypeId,
} from "@apzhub/reporting-contracts";

/** Product-owned built-in template catalogue. */
export interface BuiltinTemplateCatalogue {
  list(reportType?: ReportTypeId): readonly ReportTemplate[];
  get(templateId: string): ReportTemplate | undefined;
  defaultIdFor(reportType: ReportTypeId): string;
  listReportTypes(): readonly ReportTypeId[];
}

export type ReportTemplateCreateInput = Omit<
  ReportTemplate,
  "createdAt" | "updatedAt" | "revision" | "builtin"
> & {
  readonly builtin?: boolean;
  readonly organisationId?: string;
};

/** Persistence port for custom templates (product-owned store). */
export interface ReportTemplateRepositoryPort {
  list(ctx: ReportingRequestContext): Promise<readonly ReportTemplate[]>;
  get(ctx: ReportingRequestContext, templateId: string): Promise<ReportTemplate | null>;
  create(
    ctx: ReportingRequestContext,
    input: ReportTemplateCreateInput,
  ): Promise<ReportTemplate>;
}

export type ReportMetadataCreateInput = {
  readonly id?: string;
  readonly requestId: string;
  readonly templateId: string;
  readonly reportType: ReportTypeId;
  readonly outputFormat: string;
  readonly parametersJson: string;
  readonly generatedAt: string;
  readonly generatedBy: string;
  readonly version: string;
  readonly checksumSha256: string;
  readonly byteLength: number;
  readonly preview: boolean;
  readonly organisationId?: string;
};

/** Persistence port for generation metadata (product-owned store). */
export interface ReportMetadataRepositoryPort {
  create(
    ctx: ReportingRequestContext,
    input: ReportMetadataCreateInput,
  ): Promise<ReportGenerationMetadata>;
  get(
    ctx: ReportingRequestContext,
    metadataId: string,
  ): Promise<ReportGenerationMetadata | null>;
  list(ctx: ReportingRequestContext): Promise<readonly ReportGenerationMetadata[]>;
  archive(
    ctx: ReportingRequestContext,
    metadataId: string,
  ): Promise<ReportGenerationMetadata>;
}

export class ReportingDomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "ReportingDomainError";
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  kind: string,
  id: string,
): T {
  if (value == null) {
    throw new ReportingDomainError("not_found", `${kind} not found: ${id}`, {
      kind,
      id,
    });
  }
  return value;
}
