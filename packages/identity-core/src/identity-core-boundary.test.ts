import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("identity-core boundary", () => {
  it("depends on identity-contracts only", () => {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, "../package.json"), "utf8"),
    );
    expect(pkg.dependencies).toEqual({
      "@apzhub/identity-contracts": "workspace:*",
    });
    expect(pkg.dependencies["@apzhub/identity-persistence"]).toBeUndefined();
    expect(pkg.dependencies["@apzhub/platform-services"]).toBeUndefined();
  });
});
