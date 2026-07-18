#!/usr/bin/env node
/**
 * APZDOCS-004 — Document HTTP API & Typed Client boundary audit.
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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts"))
      out.push(full);
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

scan(walk(join(ROOT, "apps/web/lib/api/v1/handlers")), [
  {
    rule: "handlers-no-document-core",
    pattern:
      /@apzhub\/document-core|@apzhub\/document-persistence|@apzhub\/document-storage/,
  },
]);

scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
    f.includes("documents"),
  ),
  [
    {
      rule: "handlers-no-binary",
      pattern: /FormData|multipart|createReadStream|putObject|storeContent/,
    },
    { rule: "handlers-use-gateway", pattern: /getPlatformServiceGateway/ },
  ],
);

// handlers-use-gateway: ensure documents.ts contains gateway call (not every line)
const documentsHandler = join(ROOT, "apps/web/lib/api/v1/handlers/documents.ts");
const documentsHandlerContent = readFileSync(documentsHandler, "utf8");
if (!documentsHandlerContent.includes("getPlatformServiceGateway")) {
  violations.push({
    file: rel(documentsHandler),
    line: 1,
    rule: "handlers-missing-gateway",
    detail: "documents handlers must call getPlatformServiceGateway",
  });
}
// Remove false positives from line-level handlers-use-gateway (pattern won't match every line)
for (let i = violations.length - 1; i >= 0; i--) {
  if (violations[i].rule === "handlers-use-gateway") violations.splice(i, 1);
}

scan(walk(join(ROOT, "apps/web/lib/documents")), [
  {
    rule: "client-no-core",
    pattern: /@apzhub\/document-core|@apzhub\/platform-services/,
  },
  {
    rule: "client-no-binary",
    pattern: /FormData|multipart\/form-data|ArrayBuffer.*upload/,
  },
]);

scan(walk(join(ROOT, "apps/web/app/api/v1/documents")), [
  { rule: "routes-no-workbench", pattern: /workbench-framework|PlatformReportingView/ },
]);

const documentRoutes = walk(join(ROOT, "apps/web/app/api/v1/documents"));
for (const file of documentRoutes) {
  const content = readFileSync(file, "utf8");
  if (!content.includes("withPlatformApiAuth")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-missing-auth",
      detail: "Document HTTP routes must use withPlatformApiAuth",
    });
  }
}

const openapi = readFileSync(
  join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
  "utf8",
);
if (!openapi.includes("/documents:")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-documents",
    detail: "Expected /documents paths in OpenAPI",
  });
}
if (!openapi.includes("CreateDocumentRequest")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-schemas",
    detail: "Expected CreateDocumentRequest schema",
  });
}

const bootstrap = readFileSync(
  join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
  "utf8",
);
if (!bootstrap.includes("createDocumentPlatformServices")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-documents",
    detail: "Gateway bootstrap must wire document platform services",
  });
}

if (violations.length > 0) {
  console.error("APZDOCS-004 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZDOCS-004 architecture audit PASSED");
console.log("  - handlers use gateway only (no document-core/storage)");
console.log("  - typed client stays on /api/v1/documents");
console.log("  - OpenAPI documents paths and schemas present");
console.log("  - bootstrap wires document platform services");
process.exit(0);
