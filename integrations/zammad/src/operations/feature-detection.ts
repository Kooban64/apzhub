import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { ZammadRestClient } from "../internal/zammad-rest-client";
import type { ZammadFeatureDetectionResult } from "./types";

export interface FeatureDetectionDeps {
  readonly client: ZammadRestClient;
  readonly clock: { now(): string };
  readonly probes?: readonly {
    readonly capabilityId: string;
    readonly endpoint: string;
    readonly optional: boolean;
    readonly run: (
      context: IntegrationRequestContext,
    ) => Promise<{ readonly statusCode?: number }>;
  }[];
}

function extractStatusCode(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    return Number((error as { statusCode?: number }).statusCode);
  }
  return undefined;
}

/**
 * Probe optional Zammad endpoints safely.
 * Never creates production records; never fails startup for optional gaps.
 */
export async function detectZammadFeatures(
  context: IntegrationRequestContext,
  deps: FeatureDetectionDeps,
): Promise<ZammadFeatureDetectionResult> {
  const probes = deps.probes ?? [
    {
      capabilityId: "webhooks",
      endpoint: "/api/v1/webhooks",
      optional: true,
      run: async (ctx) => {
        try {
          await deps.client.listWebhooks(ctx);
          return { statusCode: 200 };
        } catch (error) {
          return { statusCode: extractStatusCode(error) };
        }
      },
    },
    {
      capabilityId: "history",
      endpoint: "/api/v1/ticket_history/{id}",
      optional: true,
      run: async (ctx) => {
        // Non-destructive probe: list tickets with page size 1, then history if any.
        // If no tickets exist, treat history endpoint as assumed available (unverified).
        try {
          const page = await deps.client.listTickets(ctx, { page: 1, per_page: 1 });
          const first = page.items[0];
          if (!first) {
            return { statusCode: 200 };
          }
          await deps.client.listTicketHistory(ctx, first.id);
          return { statusCode: 200 };
        } catch (error) {
          return { statusCode: extractStatusCode(error) };
        }
      },
    },
    {
      capabilityId: "search",
      endpoint: "/api/v1/tickets/search",
      optional: true,
      run: async (ctx) => {
        try {
          await deps.client.searchTickets(ctx, "a", { page: 1, per_page: 1 });
          return { statusCode: 200 };
        } catch (error) {
          return { statusCode: extractStatusCode(error) };
        }
      },
    },
  ];

  const detections: Array<{
    readonly capabilityId: string;
    readonly endpoint: string;
    readonly available: boolean;
    readonly optional: boolean;
    readonly statusCode?: number;
    readonly note: string;
  }> = [];
  const unsupportedEndpoints: string[] = [];
  const unavailableCapabilities: string[] = [];
  const versionSpecificNotes: string[] = [];

  for (const probe of probes) {
    try {
      const result = await probe.run(context);
      const available = result.statusCode === undefined || result.statusCode < 400;
      detections.push({
        capabilityId: probe.capabilityId,
        endpoint: probe.endpoint,
        available,
        optional: probe.optional,
        statusCode: result.statusCode,
        note: available
          ? "endpoint_reachable"
          : probe.optional
            ? "optional_endpoint_unavailable"
            : "required_endpoint_unavailable",
      });

      if (!available) {
        unsupportedEndpoints.push(probe.endpoint);
        unavailableCapabilities.push(probe.capabilityId);
        if (result.statusCode === 404) {
          versionSpecificNotes.push(
            `${probe.capabilityId}: endpoint returned 404 — may be version or permission specific`,
          );
        }
        if (result.statusCode === 403) {
          versionSpecificNotes.push(
            `${probe.capabilityId}: endpoint returned 403 — permission-restricted`,
          );
        }
      }
    } catch {
      detections.push({
        capabilityId: probe.capabilityId,
        endpoint: probe.endpoint,
        available: false,
        optional: probe.optional,
        note: "probe_failed_safely",
      });
      if (probe.optional) {
        unsupportedEndpoints.push(probe.endpoint);
        unavailableCapabilities.push(probe.capabilityId);
      }
    }
  }

  return {
    probedAt: deps.clock.now(),
    unsupportedEndpoints: [...new Set(unsupportedEndpoints)],
    unavailableCapabilities: [...new Set(unavailableCapabilities)],
    versionSpecificNotes,
    detections,
  };
}
