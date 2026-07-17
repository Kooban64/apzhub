/**
 * APZNOTIFY-005 — Dependency / boundary certification (static package graph).
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

describe("APZNOTIFY-005 dependency boundaries", () => {
  it("contracts do not import core, persistence, services, or delivery SDKs", () => {
    const d = deps("packages/notification-contracts/package.json");
    expect(d["@apzhub/notification-core"]).toBeUndefined();
    expect(d["@apzhub/notification-persistence"]).toBeUndefined();
    expect(d["@apzhub/platform-services"]).toBeUndefined();
    expect(d.nodemailer).toBeUndefined();
    expect(d.twilio).toBeUndefined();
    expect(d.meilisearch).toBeUndefined();
  });

  it("core does not import persistence implementations or apps", () => {
    const d = deps("packages/notification-core/package.json");
    expect(d["@apzhub/notification-persistence"]).toBeUndefined();
    expect(d["@apzhub/platform-services"]).toBeUndefined();
    expect(d.nodemailer).toBeUndefined();
  });

  it("persistence does not import platform services or UI", () => {
    const d = deps("packages/notification-persistence/package.json");
    expect(d["@apzhub/platform-services"]).toBeUndefined();
    expect(d.nodemailer).toBeUndefined();
  });

  it("platform-services depends on notification packages without delivery providers", () => {
    const d = deps("packages/platform-services/package.json");
    expect(d["@apzhub/notification-contracts"]).toBeTruthy();
    expect(d["@apzhub/notification-core"]).toBeTruthy();
    expect(d.nodemailer).toBeUndefined();
    expect(d.twilio).toBeUndefined();
    expect(d.meilisearch).toBeUndefined();
  });
});
