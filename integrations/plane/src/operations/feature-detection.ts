import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { PlaneRestClient } from "../internal/plane-rest-client";
import type { PlaneFeatureDetectionResult } from "./types";

export interface FeatureDetectionDeps {
  readonly client: PlaneRestClient;
  readonly clock: { now(): string };
  /** Known optional probe targets. */
  readonly probes?: readonly {
    readonly capabilityId: string;
    readonly endpoint: string;
    readonly optional: boolean;
    readonly run: (
      context: IntegrationRequestContext,
    ) => Promise<{ readonly statusCode?: number }>;
  }[];
}

/**
 * Probe optional Plane endpoints and record capability metadata.
 * Never throws for unsupported optional features — startup must continue.
 */
export async function detectPlaneFeatures(
  context: IntegrationRequestContext,
  deps: FeatureDetectionDeps,
): Promise<PlaneFeatureDetectionResult> {
  const probes = deps.probes ?? [
    {
      capabilityId: "webhooks",
      endpoint: "/api/v1/workspaces/{slug}/webhooks/",
      optional: true,
      run: async (ctx) => {
        try {
          await deps.client.listWebhooks(ctx, { per_page: 1 });
          return { statusCode: 200 };
        } catch (error) {
          const statusCode =
            typeof error === "object" && error !== null && "statusCode" in error
              ? Number((error as { statusCode?: number }).statusCode)
              : undefined;
          return { statusCode };
        }
      },
    },
    {
      capabilityId: "analytics",
      endpoint: "/api/v1/workspaces/{slug}/project-stats/",
      optional: true,
      run: async (ctx) => {
        try {
          await deps.client.getProjectStats(ctx, { per_page: 1 });
          return { statusCode: 200 };
        } catch (error) {
          const statusCode =
            typeof error === "object" && error !== null && "statusCode" in error
              ? Number((error as { statusCode?: number }).statusCode)
              : undefined;
          return { statusCode };
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
            `${probe.capabilityId}: endpoint returned 404 — may be version or edition specific`,
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
