import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PKG = join(__dirname, "../../..");
const TIME = join(__dirname);

function collectTs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectTs(full));
    else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) out.push(full);
  }
  return out;
}

describe("Time platform services boundaries", () => {
  it("depends on integration-kimai and contracts", () => {
    const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      version: string;
    };
    expect(pkg.version).toBe("0.32.0");
    expect(pkg.dependencies?.["@apzhub/integration-kimai"]).toBe("workspace:*");
    expect(pkg.dependencies?.["@apzhub/platform-service-contracts"]).toBe(
      "workspace:*",
    );
  });

  it("does not create HTTP or Workbench surfaces", () => {
    for (const file of collectTs(TIME)) {
      const body = readFileSync(file, "utf8");
      expect(body, file).not.toMatch(/NextRequest|\/api\/v1\/time/);
      expect(body, file).not.toMatch(/apps\/web\/components\/time/);
      expect(body, file).not.toMatch(/from\s+["']react["']/);
    }
  });

  it("consumes Kimai domain-capable adapter 0.2.0", () => {
    const kimaiPkg = JSON.parse(
      readFileSync(join(PKG, "../../integrations/kimai/package.json"), "utf8"),
    ) as { version: string };
    expect(kimaiPkg.version).toBe("0.2.0");
  });
});
