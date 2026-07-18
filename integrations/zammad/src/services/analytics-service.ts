import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import { mapSupportIntelligenceSnapshot } from "../mappers/analytics-mapper";
import { mapZammadTicket } from "../mappers/support-ticket-mapper";
import type { SupportIntelligenceSnapshot, SupportTicket } from "../models/canonical";
import { assertValid, validatePageRequest } from "../validation/request-validation";
import { buildZammadListQuery } from "./list-helpers";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

/**
 * Read-only Support intelligence — derived from ticket inventory.
 * Does not invent unsupported engine metrics.
 */
export class ZammadAnalyticsService {
  constructor(private readonly deps: ZammadServiceDeps) {}

  async getSupportIntelligence(
    context: IntegrationRequestContext,
  ): Promise<SupportIntelligenceSnapshot> {
    return this.deps.runner.run(
      context,
      "zammad.analytics.getSupportIntelligence",
      async () => {
        assertValid(validatePageRequest({ page: 1, perPage: 100 }), "analytics.page");

        const list = await this.deps.client.listTickets(
          context,
          buildZammadListQuery({ page: 1, perPage: 100 }),
        );
        const mapperCtx = { tenantId: this.deps.serviceContext.tenantId };
        const tickets: SupportTicket[] = list.items.map((item) =>
          mapZammadTicket(item, mapperCtx),
        );

        let articleCount = 0;
        for (const ticket of tickets.slice(0, 25)) {
          const zammadId = ticket.id.replace(/^sreq_zammad_/, "");
          const articles = await this.deps.client.listTicketArticles(
            context,
            zammadId,
            buildZammadListQuery({ page: 1, perPage: 1 }),
          );
          articleCount += articles.totalCount;
        }

        const capturedAt = this.deps.clock?.now() ?? new Date().toISOString();

        return mapSupportIntelligenceSnapshot({
          tickets,
          articleCount,
          capturedAt,
        });
      },
    );
  }

  /** Alias retained for capability naming symmetry with Plane analytics. */
  async getSnapshot(
    context: IntegrationRequestContext,
  ): Promise<SupportIntelligenceSnapshot> {
    return this.getSupportIntelligence(context);
  }
}
