/**
 * APZNOTIFY-006 — Notification wave closeout certification harness.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZNOTIFY-006 Notification Wave Closeout", () => {
  it("passes wave closeout audit (0 violations)", () => {
    const script = join(
      ROOT,
      "scripts/apznotify-006-notification-wave-closeout-audit.mjs",
    );
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("retains frozen package versions", () => {
    const versions: Record<string, string> = {
      "packages/notification-contracts/package.json": "0.2.0",
      "packages/notification-core/package.json": "0.2.0",
      "packages/notification-persistence/package.json": "0.1.0",
      "packages/platform-services/package.json": "0.21.0",
      "packages/platform-service-contracts/package.json": "0.16.0",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("ships freeze notice and recommends APZNOTIFY-007 only", () => {
    const freeze = readFileSync(
      join(
        ROOT,
        "docs/architecture/APZHUB-Notification-Architecture-Freeze-Notice.md",
      ),
      "utf8",
    );
    expect(freeze).toMatch(/frozen/i);
    const completion = readFileSync(
      join(ROOT, "docs/sprint/APZNOTIFY-006-completion-report.md"),
      "utf8",
    );
    expect(completion).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
    expect(completion).toContain("APZNOTIFY-007");
    expect(completion).toMatch(/do not implement/i);
  });

  it("keeps delivery routes absent at freeze", () => {
    for (const omitted of [
      "apps/web/app/api/v1/notifications/send",
      "apps/web/app/api/v1/notifications/providers",
      "apps/web/app/api/v1/notifications/email",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
  });
});
