import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");

describe("configuration-core boundaries", () => {
  it("does not import persistence, apps, or platform-services", () => {
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "packages/configuration-core/package.json"), "utf8"),
    ) as { dependencies?: Record<string, string> };
    expect(pkg.dependencies?.["@apzhub/configuration-persistence"]).toBeUndefined();
    expect(pkg.dependencies?.["@apzhub/platform-services"]).toBeUndefined();
    expect(pkg.dependencies?.["@apzhub/configuration-contracts"]).toBeTruthy();
  });
});
