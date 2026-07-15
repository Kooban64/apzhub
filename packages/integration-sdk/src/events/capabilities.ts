import {
  INTEGRATION_CAPABILITIES,
  type IntegrationCapabilityId,
  isIntegrationCapabilityId,
} from "../adapter/capability-types";

/**
 * Additive event capability identifiers.
 * Prefer these helpers over hardcoding strings in adapters.
 */
export const EVENT_CAPABILITY_IDS = ["webhooks", "polling"] as const;

export type EventCapabilityId = (typeof EVENT_CAPABILITY_IDS)[number];

export interface WebhookCapabilityDeclaration {
  readonly id: "webhooks";
  readonly operations: readonly string[];
  readonly supportsVerification: boolean;
  readonly supportsReplayProtection: boolean;
  readonly supportsManagement: boolean;
}

export interface PollingCapabilityDeclaration {
  readonly id: "polling";
  readonly modes: readonly string[];
  readonly supportsCheckpoints: boolean;
  readonly supportsResume: boolean;
  readonly supportsIncremental: boolean;
}

export type EventCapabilityDeclaration =
  WebhookCapabilityDeclaration | PollingCapabilityDeclaration;

export function declareWebhookCapability(
  options: {
    readonly operations?: readonly string[];
    readonly supportsVerification?: boolean;
    readonly supportsReplayProtection?: boolean;
    readonly supportsManagement?: boolean;
  } = {},
): WebhookCapabilityDeclaration {
  return {
    id: "webhooks",
    operations: options.operations ?? [
      "list",
      "get",
      "create",
      "update",
      "delete",
      "validate",
    ],
    supportsVerification: options.supportsVerification ?? true,
    supportsReplayProtection: options.supportsReplayProtection ?? true,
    supportsManagement: options.supportsManagement ?? true,
  };
}

export function declarePollingCapability(
  options: {
    readonly modes?: readonly string[];
    readonly supportsCheckpoints?: boolean;
    readonly supportsResume?: boolean;
    readonly supportsIncremental?: boolean;
  } = {},
): PollingCapabilityDeclaration {
  return {
    id: "polling",
    modes: options.modes ?? ["full", "incremental", "resume", "validation"],
    supportsCheckpoints: options.supportsCheckpoints ?? true,
    supportsResume: options.supportsResume ?? true,
    supportsIncremental: options.supportsIncremental ?? true,
  };
}

export function declareEventCapabilities(options?: {
  readonly webhook?: Parameters<typeof declareWebhookCapability>[0];
  readonly polling?: Parameters<typeof declarePollingCapability>[0];
}): readonly EventCapabilityDeclaration[] {
  return [
    declareWebhookCapability(options?.webhook),
    declarePollingCapability(options?.polling),
  ];
}

/**
 * Resolve event capability IDs that are registered in INTEGRATION_CAPABILITIES.
 * Safe when "webhooks" / "polling" are added additively to the SDK enum.
 */
export function resolveRegisteredEventCapabilityIds(
  declared: readonly string[],
): readonly IntegrationCapabilityId[] {
  return declared.filter(isIntegrationCapabilityId);
}

export function listKnownEventCapabilityIds(): readonly string[] {
  const fromEnum = INTEGRATION_CAPABILITIES.filter(
    (id) => id === "webhooks" || id === "polling",
  );
  return [...new Set([...EVENT_CAPABILITY_IDS, ...fromEnum])];
}
