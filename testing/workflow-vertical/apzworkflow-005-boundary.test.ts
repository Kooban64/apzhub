/**
 * APZWORKFLOW-005 — Dependency / boundary certification (static package graph).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

function deps(pkgPath: string): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, pkgPath), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  return {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };
}

describe("APZWORKFLOW-005 dependency boundaries", () => {
  it("contracts do not import core, persistence, services, or engines", () => {
    const d = deps("packages/workflow-contracts/package.json");
    expect(d["@apzhub/workflow-core"]).toBeUndefined();
    expect(d["@apzhub/workflow-persistence"]).toBeUndefined();
    expect(d["@apzhub/platform-services"]).toBeUndefined();
    expect(d.n8n).toBeUndefined();
    expect(d.meilisearch).toBeUndefined();
  });

  it("core does not import persistence implementations or apps", () => {
    const d = deps("packages/workflow-core/package.json");
    expect(d["@apzhub/workflow-persistence"]).toBeUndefined();
    expect(d["@apzhub/platform-services"]).toBeUndefined();
    expect(d.n8n).toBeUndefined();
  });

  it("persistence does not import platform services or UI", () => {
    const d = deps("packages/workflow-persistence/package.json");
    expect(d["@apzhub/platform-services"]).toBeUndefined();
    expect(d.n8n).toBeUndefined();
  });

  it("platform-services depends on workflow packages without introducing n8n", () => {
    const d = deps("packages/platform-services/package.json");
    expect(d["@apzhub/workflow-contracts"]).toBeTruthy();
    expect(d.n8n).toBeUndefined();
    expect(d.meilisearch).toBeUndefined();
  });
});
