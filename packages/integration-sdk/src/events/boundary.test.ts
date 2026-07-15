import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const EVENTS_ROOT = join(__dirname);

const FORBIDDEN_IMPORT_PATTERNS = [
  /from\s+["']@apzhub\/integration-plane/,
  /from\s+["']@apzhub\/integration-zammad/,
  /from\s+["']@apzhub\/platform-services/,
  /from\s+["']@apzhub\/event-notification-framework/,
  /from\s+["'].*EntityMappingStore/,
  /import\s+.*EntityMappingStore/,
  /integrations\/plane/,
  /integrations\/zammad/,
  /packages\/platform-services/,
];

/** Patterns that would indicate ingress, bus publish, or scheduling slipped into the SDK events layer. */
const FORBIDDEN_RUNTIME_PATTERNS = [
  /createServer\s*\(/,
  /NextResponse\./,
  /export\s+(async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\b/,
  /app\.(get|post|put|patch|delete)\s*\(\s*["'][^"']*webhook/,
  /new\s+CronJob\b/,
  /node-cron/,
  /BullMQ|Bull\b|Agenda\b/,
  /publishToEventBus|eventBus\.publish/,
  /from\s+["']kafkajs["']/,
  /from\s+["']amqplib["']/,
  /from\s+["']nats["']/,
];

const FORBIDDEN_SECRET_FIELD_KEYS = [
  '"secret"',
  '"password"',
  '"token"',
  '"authorization"',
  '"signature"',
  '"rawBody"',
  '"webhookSecret"',
];

function collectTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectTsFiles(full));
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("events architecture boundary", () => {
  it("does not import plane, zammad, platform-services, or EntityMappingStore", () => {
    const files = collectTsFiles(EVENTS_ROOT);
    expect(files.length).toBeGreaterThan(10);

    const violations: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${file}: matched ${pattern}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("does not add webhook ingress, Event Bus publish, or scheduler/worker runtime", () => {
    const files = collectTsFiles(EVENTS_ROOT);
    const violations: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN_RUNTIME_PATTERNS) {
        if (pattern.test(content)) {
          violations.push(`${file}: matched ${pattern}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("diagnostics and metrics snapshots do not serialise secret field keys", () => {
    const sensitiveFiles = [
      join(EVENTS_ROOT, "diagnostics.ts"),
      join(EVENTS_ROOT, "metrics.ts"),
    ];
    const violations: string[] = [];
    for (const file of sensitiveFiles) {
      const content = readFileSync(file, "utf8");
      for (const key of FORBIDDEN_SECRET_FIELD_KEYS) {
        if (content.includes(key)) {
          violations.push(`${file}: contains ${key}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
