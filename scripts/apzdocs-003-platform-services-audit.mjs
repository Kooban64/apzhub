#!/usr/bin/env node
/**
 * APZDOCS-003 — Document Platform Services / Gateway / Authorization audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */
/** @type {Violation[]} */
const violations = [];

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

function rel(file) {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function scan(files, rules) {
  for (const file of files) {
    const path = rel(file);
    if (path.includes(".test.") || path.includes(".spec.")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const rule of rules) {
        if (rule.pattern.test(line)) {
          violations.push({
            file: path,
            line: i + 1,
            rule: rule.rule,
            detail: line.trim().slice(0, 160),
          });
        }
      }
    }
  }
}

const documentPackages = [
  "packages/document-contracts",
  "packages/document-core",
  "packages/document-persistence",
  "packages/document-storage",
];

for (const root of documentPackages) {
  scan(walk(join(ROOT, root)), [
    { rule: "docs-no-platform-services", pattern: /@apzhub\/platform-services/ },
    { rule: "docs-no-http", pattern: /NextRequest|withPlatformApiAuth|\/api\/v1\/documents/ },
    { rule: "docs-no-workbench", pattern: /workbench-framework|PlatformReportingView/ },
  ]);
}

scan(walk(join(ROOT, "packages/platform-services/src/services/documents")), [
  { rule: "services-no-direct-storage-sdks", pattern: /@aws-sdk\/client-s3|createFilesystemDocumentStorageProvider|createS3DocumentStorageProvider/ },
  { rule: "services-no-http", pattern: /NextRequest|OpenAPIHono|\/api\/v1/ },
  { rule: "services-no-workbench", pattern: /workbench-framework/ },
  { rule: "services-no-binary-transfer", pattern: /storeContent\(|readContent\(|putObject\(|getObject\(/ },
]);

// Gateway must not expose raw storage providers
const gatewayFile = join(ROOT, "packages/platform-services/src/gateway/platform-service-gateway.ts");
const gateway = readFileSync(gatewayFile, "utf8");
if (/DocumentStorageProvider|createFilesystem|createS3/.test(gateway)) {
  violations.push({
    file: rel(gatewayFile),
    line: 1,
    rule: "gateway-no-storage-providers",
    detail: "Gateway must not reference concrete storage providers",
  });
}
if (!/documentsApi|documentVersions|documentStorage/.test(gateway)) {
  violations.push({
    file: rel(gatewayFile),
    line: 1,
    rule: "gateway-missing-document-facets",
    detail: "Expected document gateway facets",
  });
}

// Authorization catalogue must include document permissions
const catalogue = readFileSync(
  join(ROOT, "packages/platform-services/src/authorization/permission-catalogue.ts"),
  "utf8",
);
if (!/PLATFORM_DOCUMENT_PERMISSIONS/.test(catalogue)) {
  violations.push({
    file: "packages/platform-services/src/authorization/permission-catalogue.ts",
    line: 1,
    rule: "authz-missing-document-permissions",
    detail: "Document permissions not spread into platform catalogue",
  });
}

const opMap = readFileSync(
  join(ROOT, "packages/platform-services/src/authorization/operation-authorization-map.ts"),
  "utf8",
);
if (!/documentPlatformOps/.test(opMap)) {
  violations.push({
    file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
    line: 1,
    rule: "authz-missing-document-ops",
    detail: "documentPlatformOps missing from operation map",
  });
}

if (violations.length > 0) {
  console.error("APZDOCS-003 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZDOCS-003 architecture audit PASSED");
console.log("  - document packages do not depend on platform-services");
console.log("  - platform document services do not call storage SDKs or binary APIs");
console.log("  - gateway exposes document facets without storage providers");
console.log("  - authorization catalogue + operation map include document permissions");
process.exit(0);
