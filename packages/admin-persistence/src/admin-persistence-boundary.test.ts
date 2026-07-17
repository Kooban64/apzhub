import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");

describe("admin-persistence boundaries", () => {
  it("depends on contracts/core/config and not platform-services", () => {
    const pkg = JSON.parse(
      readFileSync(
        join(ROOT, "packages/admin-persistence/package.json"),
        "utf8",
      ),
    ) as { dependencies?: Record<string, string> };
    expect(pkg.dependencies?.["@apzhub/admin-contracts"]).toBeTruthy();
    expect(pkg.dependencies?.["@apzhub/admin-core"]).toBeTruthy();
    expect(pkg.dependencies?.["@apzhub/config"]).toBeTruthy();
    expect(pkg.dependencies?.["@apzhub/platform-services"]).toBeUndefined();
  });
});
