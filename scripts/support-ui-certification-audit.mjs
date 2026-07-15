#!/usr/bin/env node
/**
 * OSS-110-14 — Support Module UI certification static audit.
 *
 * Composes UI boundary rules, workbench/manifest wiring checks, out-of-scope
 * feature absence (Event Bus / webhooks / binary transfer), and provider-native
 * ID leakage scans for Support presentation code.
 *
 * Exit 0 = PASS; exit 1 = FAIL.
 * Writes docs/sprint/OSS-110-14-dependency-audit.json unless --no-json.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const WRITE_JSON = !process.argv.includes("--no-json");

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */
/** @typedef {{ id: string; ok: boolean; detail: string }} Check */

/** @type {Violation[]} */
const violations = [];
/** @type {Check[]} */
const checks = [];
/** @type {Map<string, Set<string>>} */
const importGraph = new Map();

const UI_ROOTS = ["apps/web/components/support", "apps/web/lib/support"];

const REQUIRED_MANIFESTS = [
  {
    path: "services/support/manifests/support/module.yaml",
    id: "support",
    level: "activity-bar",
    route: "/workspace/support",
  },
  {
    path: "services/support/manifests/support-requests/module.yaml",
    id: "support-requests",
    level: "sidebar",
    route: "/workspace/support/requests",
  },
  {
    path: "services/support/manifests/support-organizations/module.yaml",
    id: "support-organizations",
    level: "sidebar",
    route: "/workspace/support/organizations",
  },
  {
    path: "services/support/manifests/support-groups/module.yaml",
    id: "support-groups",
    level: "sidebar",
    route: "/workspace/support/groups",
  },
  {
    path: "services/support/manifests/support-users/module.yaml",
    id: "support-users",
    level: "sidebar",
    route: "/workspace/support/users",
  },
  {
    path: "services/support/manifests/support-search/module.yaml",
    id: "support-search",
    level: "sidebar",
    route: "/workspace/support/search",
  },
  {
    path: "services/support/manifests/support-analytics/module.yaml",
    id: "support-analytics",
    level: "sidebar",
    route: "/workspace/support/analytics",
  },
];

const BOUNDARY_FORBIDDEN = [
  {
    rule: "no-zammad-integration",
    pattern: /@apzhub\/integration-zammad|from\s+["'][^"']*integration-zammad/,
  },
  {
    rule: "no-entity-mapping-store",
    pattern: /EntityMappingStore|entity-mapping|mapping-store/,
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
  {
    rule: "no-database-import",
    pattern:
      /from\s+["'](?:drizzle-orm|drizzle|postgres|prisma|pg|pg\/[^"']+)["']|@apzhub\/config\/db/,
  },
  {
    rule: "no-adapter-import",
    pattern: /@apzhub\/integration-|integrations\/zammad|integrations\/plane/,
  },
];

const OUT_OF_SCOPE = [
  {
    rule: "no-event-bus-ui",
    pattern:
      /\bEventBus\b|event-bus|publishSupportEvent|useEventBus|PlatformEventBus/,
  },
  {
    rule: "no-webhook-ui",
    pattern: /\bwebhook\b/i,
  },
  {
    rule: "no-binary-attachment-ui",
    pattern:
      /type\s*=\s*["']file["']|FormData\b|createObjectURL|downloadBlob|attachmentUpload|uploadAttachment|downloadAttachment|binaryTransfer/,
  },
];

const PROVIDER_NATIVE_ID = [
  {
    rule: "no-provider-native-id",
    pattern: /_zammad_|sreq_zammad_|sorg_zammad_|sgrp_zammad_|suser_zammad_|sart_zammad_/,
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

function recordImport(fromLabel, toSpec) {
  if (!importGraph.has(fromLabel)) importGraph.set(fromLabel, new Set());
  importGraph.get(fromLabel).add(toSpec);
}

function addCheck(id, ok, detail) {
  checks.push({ id, ok, detail });
  if (!ok) {
    violations.push({
      file: "(check)",
      line: 0,
      rule: id,
      detail,
    });
  }
}

function runBoundaryScript() {
  const script = join(ROOT, "scripts/support-ui-boundary-audit.mjs");
  if (!existsSync(script)) {
    addCheck("ui-boundary-script", false, "scripts/support-ui-boundary-audit.mjs missing");
    return;
  }
  const result = spawnSync(process.execPath, [script], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const ok = result.status === 0;
  addCheck(
    "ui-boundary-script",
    ok,
    ok
      ? "scripts/support-ui-boundary-audit.mjs PASS"
      : `boundary audit failed: ${(result.stderr || result.stdout || "").trim().slice(0, 400)}`,
  );
}

function verifyManifests() {
  const serviceYaml = join(ROOT, "services/support/service.yaml");
  addCheck(
    "support-service-yaml",
    existsSync(serviceYaml),
    existsSync(serviceYaml)
      ? "services/support/service.yaml present"
      : "services/support/service.yaml missing",
  );

  for (const manifest of REQUIRED_MANIFESTS) {
    const abs = join(ROOT, manifest.path);
    if (!existsSync(abs)) {
      addCheck(`manifest-${manifest.id}`, false, `Missing ${manifest.path}`);
      continue;
    }
    const content = readFileSync(abs, "utf8");
    const problems = [];
    if (!new RegExp(`^id:\\s*${manifest.id}\\s*$`, "m").test(content)) {
      problems.push(`id must be ${manifest.id}`);
    }
    if (!/status:\s*enabled/.test(content)) {
      problems.push("module.status must be enabled");
    }
    if (!new RegExp(`level:\\s*${manifest.level}`).test(content)) {
      problems.push(`workbench.navigation.level must be ${manifest.level}`);
    }
    if (!content.includes(`route: ${manifest.route}`)) {
      problems.push(`route must include ${manifest.route}`);
    }
    if (manifest.level === "activity-bar") {
      if (!/workspace:\s*support/.test(content)) {
        problems.push("activity-bar workspace must be support");
      }
      if (!/icon:\s*life-buoy/.test(content)) {
        problems.push("activity-bar icon should be life-buoy");
      }
      if (!/permission:\s*support\.requests\.list/.test(content)) {
        problems.push("activity-bar permission must be support.requests.list");
      }
    }
    addCheck(
      `manifest-${manifest.id}`,
      problems.length === 0,
      problems.length === 0
        ? `${manifest.path} enabled (${manifest.level})`
        : `${manifest.path}: ${problems.join("; ")}`,
    );
  }
}

function verifyWorkbenchWiring() {
  const rel = "apps/web/components/workbench-page.tsx";
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) {
    addCheck("workbench-wiring", false, `${rel} missing`);
    return;
  }
  const content = readFileSync(abs, "utf8");
  const problems = [];
  if (!content.includes('from "@/components/support/support-workspace-router"')) {
    problems.push("missing SupportWorkspaceRouter import");
  }
  if (!content.includes('from "@/lib/support/routes"') || !content.includes("isSupportRoute")) {
    problems.push("missing isSupportRoute import/usage");
  }
  if (!content.includes("<SupportWorkspaceRouter")) {
    problems.push("SupportWorkspaceRouter not rendered");
  }
  if (!/supportActive\s*=\s*isSupportRoute\(pathname\)/.test(content)) {
    problems.push("supportActive = isSupportRoute(pathname) not found");
  }
  addCheck(
    "workbench-wiring",
    problems.length === 0,
    problems.length === 0
      ? "workbench-page wires isSupportRoute → SupportWorkspaceRouter"
      : problems.join("; "),
  );
}

function verifySupportApi() {
  const rel = "apps/web/lib/support/support-api.ts";
  const abs = join(ROOT, rel);
  if (!existsSync(abs)) {
    addCheck("support-api-v1", false, `${rel} missing`);
    return;
  }
  const content = readFileSync(abs, "utf8");
  const problems = [];
  if (!content.includes('"/api/v1"') && !content.includes("'/api/v1'")) {
    problems.push("must declare API_BASE /api/v1");
  }
  if (/fetch\(\s*[`'"]\/api\/(?!v1)/.test(content)) {
    problems.push("found fetch to non-/api/v1 path");
  }
  if (/https?:\/\//.test(content) && /zammad/i.test(content)) {
    problems.push("appears to call Zammad HTTP directly");
  }
  addCheck(
    "support-api-v1",
    problems.length === 0,
    problems.length === 0 ? "support-api.ts uses /api/v1 only" : problems.join("; "),
  );
}

/**
 * @param {string} file
 * @param {string} rel
 * @param {string} content
 * @param {{ rule: string; pattern: RegExp }[]} rules
 * @param {(line: string, rel: string) => boolean} [allow]
 */
function applyLineRules(file, rel, content, rules, allow) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const rule of rules) {
      if (!rule.pattern.test(line)) continue;
      if (allow?.(line, rel)) continue;
      // Attachment metadata disclaimer is required, not a binary UI.
      if (
        rule.rule === "no-binary-attachment-ui" &&
        /Binary access not available/.test(line)
      ) {
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
}

function scanUiFiles(allFiles) {
  for (const file of allFiles) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    const isTest = rel.includes(".test.") || rel.includes(".spec.");
    if (isTest) continue;

    const content = readFileSync(file, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const importMatch = line.match(
        /(?:from\s+|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/,
      );
      if (importMatch) {
        const spec = importMatch[1];
        if (spec.startsWith("@apzhub/") || spec.startsWith("@/")) {
          recordImport("support-ui", spec);
        }
      }
    }

    applyLineRules(file, rel, content, BOUNDARY_FORBIDDEN, (line, fileRel) => {
      // errors.ts may mention provider keywords when sanitizing messages
      if (fileRel.endsWith("lib/support/errors.ts") && /zammad|provider/i.test(line)) {
        return true;
      }
      return false;
    });

    // Product label "Zammad" must not appear in UI (except sanitizer allowlist).
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (/\bzammad\b/i.test(line) && !rel.endsWith("lib/support/errors.ts")) {
        violations.push({
          file: rel,
          line: i + 1,
          rule: "no-zammad-label",
          detail: line.trim().slice(0, 200),
        });
      }
    }

    applyLineRules(file, rel, content, OUT_OF_SCOPE);
    applyLineRules(file, rel, content, PROVIDER_NATIVE_ID);
  }

  const boundaryOk = !violations.some((v) =>
    [
      "no-zammad-integration",
      "no-entity-mapping-store",
      "no-platform-services-impl",
      "no-gateway-import",
      "no-dangerously-set-inner-html",
      "no-database-import",
      "no-adapter-import",
      "no-zammad-label",
    ].includes(v.rule),
  );
  addCheck(
    "ui-forbidden-imports",
    boundaryOk,
    boundaryOk
      ? "No forbidden gateway/provider/adapter/mapping/DB imports in Support UI"
      : "Forbidden imports or Zammad labels found in Support UI",
  );

  const oosOk = !violations.some((v) =>
    ["no-event-bus-ui", "no-webhook-ui", "no-binary-attachment-ui"].includes(v.rule),
  );
  addCheck(
    "ui-out-of-scope-absent",
    oosOk,
    oosOk
      ? "No Event Bus / webhook / binary attachment UI in Support presentation"
      : "Out-of-scope Event Bus / webhook / binary UI patterns found",
  );

  const idOk = !violations.some((v) => v.rule === "no-provider-native-id");
  addCheck(
    "ui-no-provider-native-ids",
    idOk,
    idOk
      ? "No provider-native ID patterns (_zammad_ / s*_zammad_*) in Support UI"
      : "Provider-native ID patterns found in Support UI display code",
  );
}

function verifyNoteReplySafety(allFiles) {
  const note = allFiles.find((f) => f.endsWith("internal-note-composer.tsx"));
  const reply = allFiles.find((f) => f.endsWith("customer-reply-composer.tsx"));
  const attach = allFiles.find((f) => f.endsWith("support-ui.tsx"));

  if (!note) {
    addCheck("internal-note-safety", false, "internal-note-composer.tsx missing");
  } else {
    const content = readFileSync(note, "utf8");
    const ok =
      content.includes('value="internal"') &&
      /visibility/.test(content) &&
      !/value=["']public["']/.test(content);
    addCheck(
      "internal-note-safety",
      ok,
      ok
        ? "InternalNoteComposer forces visibility=internal"
        : "InternalNoteComposer must force visibility=internal (no public override)",
    );
  }

  if (!reply) {
    addCheck("customer-reply-safety", false, "customer-reply-composer.tsx missing");
  } else {
    const content = readFileSync(reply, "utf8");
    const hasWarning = /customer-visible/i.test(content);
    addCheck(
      "customer-reply-safety",
      hasWarning,
      hasWarning
        ? "CustomerReplyComposer shows customer-visible warning"
        : "CustomerReplyComposer missing customer-visible warning",
    );
  }

  if (!attach) {
    addCheck("attachment-metadata-only", false, "support-ui.tsx missing");
  } else {
    const content = readFileSync(attach, "utf8");
    const ok =
      content.includes("AttachmentMetadataList") &&
      content.includes("Binary access not available") &&
      !/type\s*=\s*["']file["']/.test(content);
    addCheck(
      "attachment-metadata-only",
      ok,
      ok
        ? "AttachmentMetadataList shows metadata + Binary access not available"
        : "Attachment UI must be metadata-only with Binary access not available",
    );
  }
}

function main() {
  runBoundaryScript();
  verifyManifests();
  verifyWorkbenchWiring();
  verifySupportApi();

  /** @type {string[]} */
  const allFiles = [];
  for (const root of UI_ROOTS) {
    walk(join(ROOT, root), allFiles);
  }

  scanUiFiles(allFiles);
  verifyNoteReplySafety(allFiles);

  // Deduplicate identical check-originated violations that were also line-scanned
  const uniqueViolations = [];
  const seen = new Set();
  for (const v of violations) {
    const key = `${v.file}:${v.line}:${v.rule}:${v.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueViolations.push(v);
  }
  violations.length = 0;
  violations.push(...uniqueViolations);

  const failedChecks = checks.filter((c) => !c.ok).length;
  const verdict =
    violations.length === 0 && failedChecks === 0 ? "PASS" : "FAIL";

  const report = {
    milestone: "OSS-110-14",
    scannedAt: new Date().toISOString(),
    scanRoots: [...UI_ROOTS, "services/support", "apps/web/components/workbench-page.tsx"],
    filesScanned: allFiles.length,
    checkCount: checks.length,
    checks,
    violationCount: violations.length,
    violations,
    importGraph: Object.fromEntries(
      [...importGraph.entries()].map(([k, v]) => [k, [...v].sort()]),
    ),
    verticalDependencyAudit: {
      script: "scripts/support-vertical-dependency-audit.mjs",
      note: "Re-run separately; expected still PASS for HTTP/provider/service layers",
    },
    verdict,
  };

  if (WRITE_JSON) {
    const outDir = join(ROOT, "docs/sprint");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(
      join(outDir, "OSS-110-14-dependency-audit.json"),
      `${JSON.stringify(report, null, 2)}\n`,
    );
  }

  // Machine-readable one-liner for CI parsers
  console.log(
    `SUPPORT_UI_CERT_AUDIT verdict=${verdict} checks=${checks.length} failedChecks=${failedChecks} violations=${violations.length} files=${allFiles.length}`,
  );

  for (const check of checks) {
    console.log(`  [${check.ok ? "PASS" : "FAIL"}] ${check.id} — ${check.detail}`);
  }

  if (violations.length > 0) {
    console.error(`Support UI certification audit FAILED (${violations.length} violation(s)):`);
    for (const v of violations) {
      const loc = v.line > 0 ? `${v.file}:${v.line}` : v.file;
      console.error(`  [${v.rule}] ${loc} — ${v.detail}`);
    }
  } else {
    console.log("Support UI certification audit PASSED.");
  }

  if (WRITE_JSON) {
    console.log("Wrote docs/sprint/OSS-110-14-dependency-audit.json");
  }

  process.exit(verdict === "PASS" ? 0 : 1);
}

main();
