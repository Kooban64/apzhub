#!/usr/bin/env node
/**
 * OSS-110-13 — Support Module UI static boundary audit.
 * Scans apps/web/components/support and apps/web/lib/support for forbidden
 * imports/strings (Zammad, providers, gateway, mapping, platform-services impl).
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */

/** @type {Violation[]} */
const violations = [];

const SCAN_ROOTS = [
  "apps/web/components/support",
  "apps/web/lib/support",
];

const FORBIDDEN = [
  {
    rule: "no-zammad-integration",
    pattern: /@apzhub\/integration-zammad|from\s+["'][^"']*integration-zammad/,
  },
  {
    rule: "no-entity-mapping-store",
    pattern: /EntityMappingStore/,
  },
  {
    rule: "no-platform-services-impl",
    pattern:
      /@apzhub\/platform-services(?:\/|"|')|support-service-impls|support-mapping-helpers|providers\/zammad/,
  },
  {
    rule: "no-gateway-import",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
  },
  {
    rule: "no-dangerously-set-inner-html",
    pattern: /dangerouslySetInnerHTML\s*=/,
  },
];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

function scanFile(file) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (rel.includes(".test.") || rel.includes(".spec.")) return;

  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of FORBIDDEN) {
      if (rule.pattern.test(line)) {
        // errors.ts may mention provider keywords when sanitizing messages
        if (rel.endsWith("lib/support/errors.ts") && /zammad|provider/i.test(line)) {
          continue;
        }
        violations.push({
          file: rel,
          line: i + 1,
          rule: rule.rule,
          detail: line.trim().slice(0, 200),
        });
      }
    }

    if (/\bzammad\b/i.test(line) && !rel.endsWith("lib/support/errors.ts")) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "no-zammad-label",
        detail: line.trim().slice(0, 200),
      });
    }
  }

  if (rel.endsWith("lib/support/support-api.ts")) {
    if (!content.includes('"/api/v1"')) {
      violations.push({
        file: rel,
        line: 1,
        rule: "must-use-api-v1",
        detail: "support-api.ts must call /api/v1 only",
      });
    }
    if (/fetch\(\s*[`'"]\/api\/(?!v1)/.test(content)) {
      violations.push({
        file: rel,
        line: 1,
        rule: "non-v1-fetch",
        detail: "Found fetch to non-/api/v1 path",
      });
    }
  }
}

for (const root of SCAN_ROOTS) {
  for (const file of walk(join(ROOT, root))) {
    scanFile(file);
  }
}

if (violations.length > 0) {
  console.error(`Support UI boundary audit FAILED (${violations.length} violation(s)):`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
  }
  process.exit(1);
}

console.log("Support UI boundary audit PASSED.");
process.exit(0);
