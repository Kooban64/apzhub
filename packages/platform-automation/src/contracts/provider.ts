import type {
  AutomationArtifact,
  AutomationExecutionOptions,
  AutomationExecutionTarget,
  AutomationProviderDescriptor,
  AutomationProviderId,
} from "./execution";

export interface ProviderExecutionContext {
  readonly executionId: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly attempt: number;
  readonly target: AutomationExecutionTarget;
  readonly options: AutomationExecutionOptions;
  readonly signal?: AbortSignal;
}

export interface ProviderExecutionResult {
  readonly ok: boolean;
  readonly summary: string;
  readonly artifacts: readonly AutomationArtifact[];
  readonly errorMessage?: string;
  readonly timing?: {
    readonly startedAt: string;
    readonly finishedAt: string;
    readonly durationMs: number;
  };
}

/**
 * Automation Provider Interface — all engines implement this.
 * The Automation Engine depends only on this contract, never on Playwright.
 */
export interface AutomationProvider {
  readonly descriptor: AutomationProviderDescriptor;
  prepare(context: ProviderExecutionContext): Promise<void>;
  execute(context: ProviderExecutionContext): Promise<ProviderExecutionResult>;
  cancel?(context: ProviderExecutionContext): Promise<void>;
  health?(): Promise<{ readonly ok: boolean; readonly detail?: string }>;
}

export type AutomationProviderFactory = () => AutomationProvider;

export function isActiveProvider(provider: AutomationProvider): boolean {
  return provider.descriptor.status === "active";
}

export type { AutomationProviderId };
