/** Platform provider capability keys — one provider per capability per integration. */
export type PlatformProviderCapability =
  | "workspace"
  | "project"
  | "task"
  | "team"
  | "user"
  | "search"
  | "support_request"
  | "support_organization"
  | "support_group"
  | "support_user"
  | "support_article"
  | "support_search"
  | "support_history"
  | "support_analytics"
  | "support_sync"
  | "support_webhook"
  | "pipeline"
  | "pipeline_run"
  | "pipeline_artifact"
  | "pipeline_repository"
  | "pipeline_workflow"
  | "pipeline_job"
  | "pipeline_step"
  | "pipeline_summary";

export interface ProviderRegistration<TProvider = unknown> {
  /** Unique provider instance identifier, e.g. `plane-workspace`. */
  readonly providerId: string;
  /** Integration manifest id, e.g. `plane`. */
  readonly integrationId: string;
  readonly capability: PlatformProviderCapability;
  /** Lower values win when selecting the default provider. */
  readonly priority: number;
  readonly provider: TProvider;
  /** When false the provider remains registered but is skipped during resolution. */
  readonly enabled?: boolean;
}

export interface ProviderSelectionCriteria {
  readonly tenantId: string;
  readonly capability: PlatformProviderCapability;
  readonly preferredProviderId?: string;
  readonly preferredIntegrationId?: string;
  /**
   * When operating on an existing mapped entity, the mapping's provider
   * takes precedence over the active/default provider (OSS-110-03).
   */
  readonly mappedProviderId?: string;
  readonly mappedIntegrationId?: string;
}
