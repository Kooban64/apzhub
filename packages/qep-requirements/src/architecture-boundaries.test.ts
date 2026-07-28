import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  QEP_REQUIREMENTS_INFRASTRUCTURE_STATUS,
  QEP_REQUIREMENTS_PROGRAMME,
  QEP_REQUIREMENTS_VERSION,
  REQUIREMENT_DOMAIN_EVENT_TYPES,
} from "./index";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(full));
      continue;
    }
    if (full.endsWith(".ts") && !full.endsWith(".test.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("APZQEP-REQ-001 Requirements capability architecture boundaries", () => {
  it("exports foundation markers and event catalogue", () => {
    expect(QEP_REQUIREMENTS_VERSION).toBe("1.0.0");
    expect(QEP_REQUIREMENTS_PROGRAMME).toBe(
      "APZQEP-REQ-001 ACCEPTED / CLOSED / COMPLETE — Requirements 1.0.0 CERTIFIED FROZEN",
    );
    expect(QEP_REQUIREMENTS_INFRASTRUCTURE_STATUS).toBe("implemented");
    expect(REQUIREMENT_DOMAIN_EVENT_TYPES).toContain("qep.requirement.approved");
    expect(REQUIREMENT_DOMAIN_EVENT_TYPES).toContain("qep.requirement.state_changed");
  });

  it("allows lifecycle-engine in domain and forbids persistence imports", () => {
    const forbidden = [
      "drizzle",
      "postgres",
      "pg",
      "@apzhub/platform-services",
      "next/server",
      "node:fs",
      "fs/promises",
    ];
    const domainFiles = collectSourceFiles(join(packageRoot, "src/domain"));
    for (const file of domainFiles) {
      const content = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(
          content,
          `${relative(packageRoot, file)} must not import ${token}`,
        ).not.toMatch(
          new RegExp(
            `from ["'].*${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}.*["']`,
          ),
        );
      }
      expect(content).not.toMatch(/CREATE TABLE|INSERT INTO|SELECT \*/i);
    }
    const lifecycleEngine = readFileSync(
      join(packageRoot, "src/domain/lifecycle/requirement-lifecycle-engine.ts"),
      "utf8",
    );
    expect(lifecycleEngine).toMatch(/@apzhub\/lifecycle-engine/);
  });

  it("allows drizzle in infrastructure and marks layer implemented", () => {
    const infra = readFileSync(
      join(packageRoot, "src/infrastructure/index.ts"),
      "utf8",
    );
    expect(infra).toMatch(/implemented/);
    const postgres = readFileSync(
      join(packageRoot, "src/infrastructure/postgres/repositories.ts"),
      "utf8",
    );
    expect(postgres).toMatch(/drizzle-orm/);
  });

  it("forbids application layer from importing drizzle directly", () => {
    const applicationFiles = collectSourceFiles(join(packageRoot, "src/application"));
    for (const file of applicationFiles) {
      const content = readFileSync(file, "utf8");
      expect(content, relative(packageRoot, file)).not.toMatch(/drizzle-orm/);
    }
  });
});
