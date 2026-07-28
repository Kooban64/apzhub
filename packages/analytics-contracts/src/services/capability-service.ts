/**
 * CapabilityService — Analytics capability discovery port (interfaces only).
 * APZHUB-PLATFORM-ANALYTICS-003 — no business logic.
 */

import type { AnalyticsRequestContext } from "../common/context";
import type { AnalyticsCapability } from "../domain/analytics";
import type { AnalyticsCapabilityId } from "../identifiers";

export type CapabilityService = {
  readonly listCapabilities: (
    ctx: AnalyticsRequestContext,
  ) => Promise<readonly AnalyticsCapability[]>;
  readonly getCapability: (
    ctx: AnalyticsRequestContext,
    capabilityId: AnalyticsCapabilityId,
  ) => Promise<AnalyticsCapability>;
};
