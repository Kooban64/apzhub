import type { ZammadExtendedCapabilityId } from "../zammad-bootstrap";

export interface ZammadPlaceholderCapability {
  readonly capabilityId: ZammadExtendedCapabilityId;
  readonly registered: true;
  readonly implemented: false;
  readonly description: string;
}

/**
 * Deferred capability catalogue — metadata only.
 * Articles (OSS-102-04), search/history/analytics (OSS-102-05),
 * and events/synchronisation/webhooks (OSS-102-06) are implemented.
 * Attachments remain metadata-only via articles until binary transfer lands.
 */
export const ZAMMAD_PLACEHOLDER_CAPABILITIES: readonly ZammadPlaceholderCapability[] = [
  {
    capabilityId: "attachments",
    registered: true,
    implemented: false,
    description:
      "Binary attachment transfer deferred — metadata available via articles capability",
  },
] as const;

export function getZammadPlaceholderCapability(
  capabilityId: ZammadExtendedCapabilityId,
): ZammadPlaceholderCapability | undefined {
  return ZAMMAD_PLACEHOLDER_CAPABILITIES.find(
    (capability) => capability.capabilityId === capabilityId,
  );
}

export function listRegisteredPlaceholderCapabilityIds(): readonly ZammadExtendedCapabilityId[] {
  return ZAMMAD_PLACEHOLDER_CAPABILITIES.map((capability) => capability.capabilityId);
}
