import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createDefaultEventRegistry } from "@apzhub/event-notification-framework";

import { registerLawEvents } from "../../apps/law-platform/lib/register-law-events";

const LEGAL_EVENTS_ROOT = path.resolve(__dirname, "../../events/legal");

const TRUST_EVENT_KEYS = [
  "legal.trust.account.created",
  "legal.trust.allocation.created",
  "legal.trust.allocation.reversed",
  "legal.trust.allocation.updated",
  "legal.trust.approval.approved",
  "legal.trust.approval.cancelled",
  "legal.trust.approval.rejected",
  "legal.trust.approval.submitted",
  "legal.trust.draft.cancelled",
  "legal.trust.draft.created",
  "legal.trust.draft.posted",
  "legal.trust.draft.validated",
  "legal.trust.interest.accrued",
  "legal.trust.interest.approved",
  "legal.trust.interest.posted",
  "legal.trust.ledger.opened",
  "legal.trust.reconciliation.completed",
  "legal.trust.reconciliation.failed",
  "legal.trust.reconciliation.started",
  "legal.trust.report.generated",
  "legal.trust.reversal.posted",
  "legal.trust.reversal.requested",
  "legal.trust.transaction.posted",
  "legal.trust.transaction.reversed",
  "legal.trust.transfer.approved",
  "legal.trust.transfer.created",
  "legal.trust.transfer.posted",
  "legal.trust.transfer.reversed",
] as const;

function listEventYamlKeys(): string[] {
  if (!existsSync(LEGAL_EVENTS_ROOT)) {
    return [];
  }

  const keys: string[] = [];
  for (const entry of readdirSync(LEGAL_EVENTS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const yamlPath = path.join(LEGAL_EVENTS_ROOT, entry.name, "event.yaml");
    if (!existsSync(yamlPath)) {
      continue;
    }
    const text = readFileSync(yamlPath, "utf8");
    const match = text.match(/eventKey:\s*(\S+)/);
    if (match) {
      keys.push(match[1]);
    }
  }
  return keys.sort();
}

describe("APZHUB-LAW-ADOPT-003 EAB-01 legal event manifests", () => {
  it("provides event.yaml for every registerLawEvents eventId", () => {
    const registry = createDefaultEventRegistry();
    registerLawEvents(registry);
    const registered = [...registry.list()].map((e) => e.eventId).sort();
    const manifests = new Set(listEventYamlKeys());

    const missing = registered.filter((id) => !manifests.has(id));
    expect(missing).toEqual([]);
  });

  it("provides event.yaml for trust runtime event keys", () => {
    const manifests = new Set(listEventYamlKeys());
    const missing = TRUST_EVENT_KEYS.filter((id) => !manifests.has(id));
    expect(missing).toEqual([]);
  });
});
