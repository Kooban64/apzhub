import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("identity-persistence boundary", () => {
  it("depends on contracts, core, and config only", () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf8"));
    expect(pkg.dependencies["@apzhub/identity-contracts"]).toBe("workspace:*");
    expect(pkg.dependencies["@apzhub/identity-core"]).toBe("workspace:*");
    expect(pkg.dependencies["@apzhub/config"]).toBe("workspace:*");
    expect(pkg.dependencies["@apzhub/platform-services"]).toBeUndefined();
  });
});
