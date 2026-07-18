import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import {
  extractProvisionalProviderNativeId,
  isProvisionalProviderId,
  isValidGlobalId,
} from "../mapping/global-id";
import type { CanonicalEntityType } from "../mapping/types";
import type { MappingOrchestrator } from "../orchestration/mapping-orchestrator";
import type { ProviderResolver } from "../providers/registry/provider-resolver";
import type {
  PlatformProviderCapability,
  ProviderRegistration,
} from "../providers/types";

export function assertRequestContext(ctx: ServiceRequestContext): void {
  if (!ctx.tenantId || !ctx.userId || !ctx.correlationId) {
    throw new PlatformServiceError({
      category: "validation",
      code: "INVALID_REQUEST_CONTEXT",
      message: "Service request context requires tenantId, userId, and correlationId",
      correlationId: ctx.correlationId || "missing",
      retryable: false,
    });
  }
}

export function findSupportRegistration(
  resolver: ProviderResolver,
  capability: PlatformProviderCapability,
  provider: unknown,
): ProviderRegistration {
  const match = resolver.registry
    .list(capability)
    .find((entry) => entry.provider === provider);
  if (!match) {
    throw new PlatformServiceError({
      category: "configuration",
      code: "CONFIGURATION_ERROR",
      message: "Provider registration not found for resolved support provider",
      correlationId: "platform-services",
      retryable: false,
      details: { capability },
    });
  }
  return match;
}

export async function resolveOutboundSupportId(
  mapping: MappingOrchestrator,
  ctx: ServiceRequestContext,
  platformId: string,
  entityType: CanonicalEntityType,
): Promise<string> {
  const resolved = await mapping.resolveExisting(ctx, platformId, entityType);
  return resolved.providerNativeId;
}

export async function resolveOptionalOutboundSupportId(
  mapping: MappingOrchestrator,
  ctx: ServiceRequestContext,
  platformId: string | null | undefined,
  entityType: CanonicalEntityType,
): Promise<string | null | undefined> {
  if (platformId === null) return null;
  if (platformId === undefined) return undefined;
  return resolveOutboundSupportId(mapping, ctx, platformId, entityType);
}

export async function toPlatformSupportId(
  mapping: MappingOrchestrator,
  ctx: ServiceRequestContext,
  registration: ProviderRegistration,
  entityType: CanonicalEntityType,
  providerEntityId: string,
  parent?: { platformId: string; providerNativeId: string },
  knownPlatformId?: string,
): Promise<string> {
  if (knownPlatformId) {
    return knownPlatformId;
  }

  if (isValidGlobalId(providerEntityId) && !isProvisionalProviderId(providerEntityId)) {
    return providerEntityId;
  }

  const providerNativeId = extractProvisionalProviderNativeId(
    providerEntityId,
    entityType,
  );
  const existing = await mapping.store.getByProviderNativeId({
    tenantId: ctx.tenantId,
    entityType,
    providerId: registration.providerId,
    providerNativeId,
  });
  if (existing) {
    return existing.platformId;
  }

  return mapping.toPlatformId(
    ctx,
    entityType,
    registration.providerId,
    registration.integrationId,
    providerEntityId,
    parent,
  );
}
