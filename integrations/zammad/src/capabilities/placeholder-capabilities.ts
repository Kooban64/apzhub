import type { ZammadExtendedCapabilityId } from "../zammad-bootstrap";

export interface ZammadPlaceholderCapability {
  readonly capabilityId: ZammadExtendedCapabilityId;
  readonly registered: true;
  readonly implemented: false;
  readonly description: string;
}

/**
 * Deferred capability catalogue — metadata only.
 * Attachments binary transfer delivered under R12-SUP-02 / APZHUB-ENG-0004.
 * No remaining Wave 2 placeholders.
 */
export const ZAMMAD_PLACEHOLDER_CAPABILITIES: readonly ZammadPlaceholderCapability[] =
  [] as const;

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
