/**
 * SPR-APZQEP-202 — CI / JUnit / Allure ingest linked to a changeEventId.
 */

import { randomUUID } from "node:crypto";

import type { AutomationProviderId } from "@apzhub/platform-automation";

import { getQepAutomationRuntime } from "@/lib/qep/automation-runtime";

export async function ingestCiResultForChange(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly providerId: AutomationProviderId;
  readonly payload: unknown;
  readonly requestedBy: string;
  readonly correlationId?: string;
}) {
  const runtime = getQepAutomationRuntime();
  return runtime.enqueueAndRun({
    tenantId: input.tenantId,
    providerId: input.providerId,
    correlationId: input.correlationId ?? randomUUID(),
    requestedBy: input.requestedBy,
    target: {
      kind: "custom",
      name: `ci-${input.providerId}`,
      entry:
        typeof input.payload === "string"
          ? input.payload
          : JSON.stringify(input.payload),
      metadata: {
        changeEventId: input.changeEventId,
        domain: "ci",
        source: "spr-apzqep-202",
      },
    },
  });
}

export function isCiAutomationProvider(
  providerId: string,
): providerId is AutomationProviderId {
  return (
    providerId === "ci" ||
    providerId === "junit" ||
    providerId === "allure" ||
    providerId === "vitest"
  );
}
