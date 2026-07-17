import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("observe-persistence boundary", () => {
  it("does not import HTTP, gateway, workbench, or provider SDKs", () => {
    const root = join(process.cwd(), "packages/observe-persistence/src");
    const files = [
      "factories.ts",
      "index.ts",
      "in-memory/repositories.ts",
      "postgres/repositories.ts",
    ];
    for (const file of files) {
      const source = readFileSync(join(root, file), "utf8");
      expect(source).not.toMatch(/@apzhub\/platform-services/);
      expect(source).not.toMatch(/NextRequest|createRouteHandler|\/api\/v1\//);
      expect(source).not.toMatch(
        /from ["']@grafana|prom-client|@opentelemetry\/|winston-loki/,
      );
      expect(source).not.toMatch(/workbench-framework|\/workspace\/observe/);
    }
  });
});
