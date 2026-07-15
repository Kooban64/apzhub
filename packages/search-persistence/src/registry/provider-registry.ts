/**
 * Production search provider registry (APZSEARCH-002).
 * No provider execution — registration and metadata only.
 */

import {
  asSearchProviderId,
  FOUNDATION_SEARCH_CAPABILITIES,
  isSafeSearchDiagnosticsPayload,
  searchProviderDuplicate,
  searchProviderNotFound,
  SearchDomainError,
  validateSearchProviderConfiguration,
  type SearchCapabilities,
  type SearchProvider,
  type SearchProviderId,
  type SearchProviderRegistrationInput,
  type SearchProviderRegistry,
  type SearchProviderRegistryOps,
  type SearchRequestContext,
} from "@apzhub/search-contracts";
import { randomUUID } from "node:crypto";

import {
  assertProviderPermission,
  SearchAuthorizationError,
} from "../authorization";
import type { SearchPersistenceBundle } from "../ports";
import type { SearchRepositoryContext } from "../types";

function toRepoCtx(context: SearchRequestContext): SearchRepositoryContext {
  return {
    tenantId: context.tenantId,
    organisationId: context.organisationId,
    actorUserId: context.actorUserId,
    permissions: context.permissions,
    correlationId: context.correlationId,
  };
}

function toSearchProvider(
  record: {
    id: string;
    kind: SearchProvider["kind"];
    label: string;
    enabled: boolean;
    active?: boolean;
    ownership?: SearchProvider["ownership"];
    version?: string;
    capabilities: SearchCapabilities;
  },
): SearchProvider {
  return {
    id: asSearchProviderId(record.id),
    kind: record.kind,
    label: record.label,
    enabled: record.enabled,
    active: record.active,
    ownership: record.ownership ?? "tenant",
    version: record.version,
    capabilities: record.capabilities,
  };
}

export type SearchProviderRegistryBundle = SearchProviderRegistry &
  SearchProviderRegistryOps & {
    getProviderDiagnostics(
      context: SearchRequestContext,
      providerId: SearchProviderId,
    ): Promise<Readonly<Record<string, unknown>>>;
    getProviderHealth(
      context: SearchRequestContext,
      providerId: SearchProviderId,
    ): Promise<{ status: string; message?: string; checkedAt: string } | null>;
    getProviderConfiguration(
      context: SearchRequestContext,
      providerId: SearchProviderId,
    ): Promise<Readonly<Record<string, unknown>> | null>;
  };

export function createSearchProviderRegistry(
  persistence: SearchPersistenceBundle,
  options: {
    readonly now?: () => string;
    readonly id?: () => string;
  } = {},
): SearchProviderRegistryBundle {
  const now = options.now ?? (() => new Date().toISOString());
  const id = options.id ?? (() => randomUUID());

  return {
    async listProviders(context) {
      const ctx = toRepoCtx(context);
      const rows = await persistence.providers.list(ctx);
      return rows.map(toSearchProvider);
    },

    async getProvider(context, providerId) {
      const ctx = toRepoCtx(context);
      const row = await persistence.providers.get(ctx, providerId);
      return row ? toSearchProvider(row) : null;
    },

    async register(context, input: SearchProviderRegistrationInput) {
      assertProviderPermission(toRepoCtx(context));
      const ctx = toRepoCtx(context);
      const validation = validateSearchProviderConfiguration(input.configuration);
      if (!validation.valid) {
        throw new SearchDomainError(
          "configuration_invalid",
          `invalid provider configuration: ${validation.issues.join("; ")}`,
          { issues: [...validation.issues] },
        );
      }
      if (input.configuration.providerId !== input.providerId) {
        throw new SearchDomainError(
          "invalid_input",
          "configuration.providerId must match providerId",
        );
      }
      if (input.configuration.providerKind !== input.kind) {
        throw new SearchDomainError(
          "invalid_input",
          "configuration.providerKind must match kind",
        );
      }

      const existing = await persistence.providers.get(ctx, input.providerId);
      if (existing && !existing.deletedAt) {
        throw searchProviderDuplicate(input.providerId);
      }

      const ts = now();
      const capabilities = {
        ...FOUNDATION_SEARCH_CAPABILITIES,
        ...input.capabilities,
        semantic: false as const,
        vector: false as const,
        fuzzy: false as const,
      };

      await persistence.providers.upsert(ctx, {
        id: input.providerId,
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        kind: input.kind,
        label: input.label,
        version: input.version,
        enabled: true,
        active: Boolean(input.active),
        ownership: (input as { ownership?: "platform" | "tenant" | "organisation" })
          .ownership ?? "tenant",
        capabilities,
        configuration: input.configuration,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });

      if (input.active) {
        await persistence.providers.setActive(ctx, input.providerId);
      }

      await persistence.providerRegistrations.create(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        providerId: input.providerId,
        kind: input.kind,
        label: input.label,
        version: input.version,
        registeredAt: ts,
        registeredBy: ctx.actorUserId,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });

      await persistence.providerStatuses.upsert(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        providerId: input.providerId,
        status: "UNKNOWN",
        message: "Registered — no live engine probe (APZSEARCH-002)",
        checkedAt: ts,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });

      await persistence.capabilities.upsert(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        providerId: input.providerId,
        capabilities,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });

      await persistence.audits.append(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        action: "search.provider.registered",
        actorUserId: ctx.actorUserId,
        correlationId: ctx.correlationId,
        detail: {
          providerId: input.providerId,
          kind: input.kind,
        },
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
    },

    async unregister(context, providerId) {
      assertProviderPermission(toRepoCtx(context));
      const ctx = toRepoCtx(context);
      const existing = await persistence.providers.get(ctx, providerId);
      if (!existing) {
        throw searchProviderNotFound(providerId);
      }
      const ts = now();
      await persistence.providers.softDelete(ctx, providerId);
      await persistence.providerRegistrations.markUnregistered(
        ctx,
        providerId,
        ts,
      );
      await persistence.providerStatuses.upsert(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        providerId,
        status: "UNAVAILABLE",
        message: "Provider unregistered",
        checkedAt: ts,
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
      await persistence.audits.append(ctx, {
        id: id(),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        action: "search.provider.unregistered",
        actorUserId: ctx.actorUserId,
        correlationId: ctx.correlationId,
        detail: { providerId },
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      });
    },

    async setActiveProvider(context, providerId) {
      assertProviderPermission(toRepoCtx(context));
      const ctx = toRepoCtx(context);
      if (providerId === null) {
        await persistence.providers.clearActive(ctx);
        return;
      }
      await persistence.providers.setActive(ctx, providerId);
    },

    async getActiveProviderId(context) {
      const ctx = toRepoCtx(context);
      const rows = await persistence.providers.list(ctx);
      const active = rows.find((r) => r.active);
      return active ? asSearchProviderId(active.id) : null;
    },

    async getProviderDiagnostics(context, providerId) {
      if (
        !context.permissions.includes("search.*") &&
        !context.permissions.includes("search.diagnostics") &&
        !context.permissions.includes("search.provider")
      ) {
        throw new SearchAuthorizationError(
          "search.diagnostics or search.provider permission required",
        );
      }
      const ctx = toRepoCtx(context);
      const provider = await persistence.providers.get(ctx, providerId);
      if (!provider) return { exists: false };
      const status = await persistence.providerStatuses.getByProvider(
        ctx,
        providerId,
      );
      const payload = {
        providerId: provider.id,
        kind: provider.kind,
        version: provider.version,
        enabled: provider.enabled,
        active: provider.active,
        status: status?.status ?? "UNKNOWN",
        capabilities: provider.capabilities,
        endpointPresent: Boolean(
          provider.configuration.endpointMetadata?.baseUrl,
        ),
        authRefsPresent: Boolean(
          provider.configuration.authenticationRefs?.credentialRef,
        ),
      };
      if (!isSafeSearchDiagnosticsPayload(payload)) {
        throw new Error("unsafe diagnostics payload blocked");
      }
      return payload;
    },

    async getProviderHealth(context, providerId) {
      const ctx = toRepoCtx(context);
      const status = await persistence.providerStatuses.getByProvider(
        ctx,
        providerId,
      );
      if (!status) return null;
      return {
        status: status.status,
        message: status.message,
        checkedAt: status.checkedAt,
      };
    },

    async getProviderConfiguration(context, providerId) {
      assertProviderPermission(toRepoCtx(context));
      const ctx = toRepoCtx(context);
      const provider = await persistence.providers.get(ctx, providerId);
      if (!provider) return null;
      // Never return resolved secrets — configuration already stores refs only.
      return {
        ...provider.configuration,
        authenticationRefs: provider.configuration.authenticationRefs
          ? { ...provider.configuration.authenticationRefs }
          : undefined,
      };
    },
  };
}
