import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import { throwMissingProvider } from "../../errors/map-provider-error";
import type {
  ProjectProvider,
  SearchProvider,
  SupportAnalyticsProvider,
  SupportArticleProvider,
  SupportGroupProvider,
  SupportHistoryProvider,
  SupportOrganizationProvider,
  SupportProvider,
  SupportSearchProvider,
  SupportSyncProvider,
  SupportUserProvider,
  SupportWebhookProvider,
  TaskProvider,
  TeamProvider,
  UserProvider,
  WorkspaceProvider,
  PipelineArtifactProvider,
  PipelineJobProvider,
  PipelineRepositoryProvider,
  PipelineRunProvider,
  PipelineStepProvider,
  PipelineSummaryProvider,
  PipelineWorkflowProvider,
} from "../capability-providers";
import type { PlatformProviderCapability, ProviderSelectionCriteria } from "../types";
import { ProviderRegistry } from "./provider-registry";

export interface ProviderResolverOptions {
  readonly registry: ProviderRegistry;
}

/**
 * Resolves the effective provider for a requested platform capability.
 *
 * Precedence (OSS-110-03):
 * 1. Explicit preferredProviderId
 * 2. Explicit preferredIntegrationId
 * 3. Mapped provider from an existing entity mapping
 * 4. Active provider selection on the registry
 * 5. Highest priority (lowest priority number) among enabled candidates
 */
export class ProviderResolver {
  constructor(private readonly options: ProviderResolverOptions) {}

  get registry(): ProviderRegistry {
    return this.options.registry;
  }

  resolveWorkspaceProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): WorkspaceProvider {
    return this.resolveProvider("workspace", ctx, criteria) as WorkspaceProvider;
  }

  resolveProjectProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): ProjectProvider {
    return this.resolveProvider("project", ctx, criteria) as ProjectProvider;
  }

  resolveTaskProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): TaskProvider {
    return this.resolveProvider("task", ctx, criteria) as TaskProvider;
  }

  resolveTeamProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): TeamProvider {
    return this.resolveProvider("team", ctx, criteria) as TeamProvider;
  }

  resolveUserProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): UserProvider {
    return this.resolveProvider("user", ctx, criteria) as UserProvider;
  }

  resolveSearchProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SearchProvider {
    return this.resolveProvider("search", ctx, criteria) as SearchProvider;
  }

  resolveSupportRequestProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SupportProvider {
    return this.resolveProvider("support_request", ctx, criteria) as SupportProvider;
  }

  resolveSupportOrganizationProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SupportOrganizationProvider {
    return this.resolveProvider(
      "support_organization",
      ctx,
      criteria,
    ) as SupportOrganizationProvider;
  }

  resolveSupportGroupProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SupportGroupProvider {
    return this.resolveProvider("support_group", ctx, criteria) as SupportGroupProvider;
  }

  resolveSupportUserProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SupportUserProvider {
    return this.resolveProvider("support_user", ctx, criteria) as SupportUserProvider;
  }

  resolveSupportArticleProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SupportArticleProvider {
    return this.resolveProvider(
      "support_article",
      ctx,
      criteria,
    ) as SupportArticleProvider;
  }

  resolveSupportSearchProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SupportSearchProvider {
    return this.resolveProvider(
      "support_search",
      ctx,
      criteria,
    ) as SupportSearchProvider;
  }

  resolveSupportHistoryProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SupportHistoryProvider {
    return this.resolveProvider(
      "support_history",
      ctx,
      criteria,
    ) as SupportHistoryProvider;
  }

  resolveSupportAnalyticsProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SupportAnalyticsProvider {
    return this.resolveProvider(
      "support_analytics",
      ctx,
      criteria,
    ) as SupportAnalyticsProvider;
  }

  resolveSupportSyncProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SupportSyncProvider {
    return this.resolveProvider("support_sync", ctx, criteria) as SupportSyncProvider;
  }

  resolveSupportWebhookProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): SupportWebhookProvider {
    return this.resolveProvider(
      "support_webhook",
      ctx,
      criteria,
    ) as SupportWebhookProvider;
  }

  resolvePipelineRepositoryProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): PipelineRepositoryProvider {
    return this.resolveProvider(
      "pipeline_repository",
      ctx,
      criteria,
    ) as PipelineRepositoryProvider;
  }

  resolvePipelineWorkflowProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): PipelineWorkflowProvider {
    return this.resolveProvider(
      "pipeline_workflow",
      ctx,
      criteria,
    ) as PipelineWorkflowProvider;
  }

  resolvePipelineRunProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): PipelineRunProvider {
    return this.resolveProvider("pipeline_run", ctx, criteria) as PipelineRunProvider;
  }

  resolvePipelineArtifactProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): PipelineArtifactProvider {
    return this.resolveProvider(
      "pipeline_artifact",
      ctx,
      criteria,
    ) as PipelineArtifactProvider;
  }

  resolvePipelineJobProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): PipelineJobProvider {
    return this.resolveProvider("pipeline_job", ctx, criteria) as PipelineJobProvider;
  }

  resolvePipelineStepProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): PipelineStepProvider {
    return this.resolveProvider("pipeline_step", ctx, criteria) as PipelineStepProvider;
  }

  resolvePipelineSummaryProvider(
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): PipelineSummaryProvider {
    return this.resolveProvider(
      "pipeline_summary",
      ctx,
      criteria,
    ) as PipelineSummaryProvider;
  }

  /**
   * Resolves a provider using explicit selection criteria.
   * Useful for tests, admin tooling, and mapping-aware orchestration.
   */
  resolveByCriteria<TProvider>(
    criteria: ProviderSelectionCriteria,
    correlationId: string,
  ): TProvider {
    const candidates = this.options.registry.listCandidates(criteria.capability);
    if (candidates.length === 0) {
      throwMissingProvider(correlationId, criteria.capability);
    }

    if (criteria.preferredProviderId) {
      const match = candidates.find(
        (entry) => entry.providerId === criteria.preferredProviderId,
      );
      if (match) {
        return match.provider as TProvider;
      }
    }

    if (criteria.preferredIntegrationId) {
      const match = candidates.find(
        (entry) => entry.integrationId === criteria.preferredIntegrationId,
      );
      if (match) {
        return match.provider as TProvider;
      }
    }

    if (criteria.mappedProviderId) {
      const match = candidates.find(
        (entry) => entry.providerId === criteria.mappedProviderId,
      );
      if (match) {
        return match.provider as TProvider;
      }
    }

    if (criteria.mappedIntegrationId) {
      const match = candidates.find(
        (entry) => entry.integrationId === criteria.mappedIntegrationId,
      );
      if (match) {
        return match.provider as TProvider;
      }
    }

    const activeId = this.options.registry.getActiveProviderId(criteria.capability);
    if (activeId) {
      const active = candidates.find((entry) => entry.providerId === activeId);
      if (active) {
        return active.provider as TProvider;
      }
    }

    return candidates[0]!.provider as TProvider;
  }

  private resolveProvider(
    capability: PlatformProviderCapability,
    ctx: ServiceRequestContext,
    criteria?: Partial<ProviderSelectionCriteria>,
  ): unknown {
    return this.resolveByCriteria(
      {
        tenantId: ctx.tenantId,
        capability,
        preferredProviderId: criteria?.preferredProviderId,
        preferredIntegrationId: criteria?.preferredIntegrationId,
        mappedProviderId: criteria?.mappedProviderId,
        mappedIntegrationId: criteria?.mappedIntegrationId,
      },
      ctx.correlationId,
    );
  }
}
