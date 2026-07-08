import { describe, expect, it } from "vitest";
import { bootstrapKnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";
import { mapPlatformCapabilitiesToActionRecords } from "@apzhub/command-framework/server";
import { Runtime } from "@apzhub/platform-runtime/server";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { registerLawTrustKnowledge } from "./register-law-trust-knowledge";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

describe("registerLawTrustKnowledge", () => {
  it("registers trust help sources", async () => {
    await Runtime.bootstrap({ workspaceRoot, failFast: false });
    const capabilityRecords = mapPlatformCapabilitiesToActionRecords(
      Runtime.registry().findAll(),
    );
    const population = bootstrapKnowledgeRegistry({ capabilityRecords });
    expect(population.ok).toBe(true);

    registerLawTrustKnowledge(population.registry!);

    for (const sourceId of [
      "legal.help.trust.dashboard",
      "legal.help.trust.transactions",
      "legal.help.trust.reconciliation",
      "legal.help.trust.reports",
    ]) {
      expect(population.registry!.hasSource(sourceId)).toBe(true);
    }
  });
});
