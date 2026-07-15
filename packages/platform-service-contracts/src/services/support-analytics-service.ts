import type { ServiceRequestContext } from "../common/context";
import type { SupportIntelligenceSnapshot } from "../domain";

/** Read-only Support intelligence / analytics operations. */
export interface SupportAnalyticsService {
  getSupportIntelligence(
    ctx: ServiceRequestContext,
  ): Promise<SupportIntelligenceSnapshot>;

  getSnapshot(ctx: ServiceRequestContext): Promise<SupportIntelligenceSnapshot>;
}
