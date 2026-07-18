import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry) && !entry.includes(".test.")) out.push(full);
  }
  return out;
}

describe("metrics-persistence boundary", () => {
  it("forbids HTTP, gateway, workbench, platform-services, provider SDKs", () => {
    const root = join(__dirname);
    const files = walk(root);
    const banned = [
      /apps\/web/,
      /\/api\/v1\//,
      /NextRequest/,
      /workbench-framework/,
      /@apzhub\/platform-services/,
      /from ["']@grafana/,
      /from ["']prom-client/,
      /from ["']@opentelemetry/,
    ];
    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const rule of banned) {
        if (rule.test(text)) hits.push(`${file} :: ${rule}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
