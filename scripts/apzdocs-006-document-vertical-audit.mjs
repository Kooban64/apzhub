#!/usr/bin/env node
/**
 * APZDOCS-006 — Document Platform vertical architecture / dependency / boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Certified path:
 * Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz
 *   → Platform Document Services → Document Core → Persistence / Storage Coordinator
 *     → Storage Providers → Canonical Contracts
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */
/** @type {Violation[]} */
const violations = [];
/** @type {{ file: string; note: string }[]} */
const observations = [];

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

function scan(files, rules, { skipTests = true } = {}) {
  for (const file of files) {
    const path = rel(file);
    if (skipTests && (path.includes(".test.") || path.includes(".spec."))) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const rule of rules) {
        if (rule.pattern.test(line)) {
          if (rule.allow?.(path, line)) continue;
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

function requireExists(path, rule) {
  if (!existsSync(join(ROOT, path))) {
    violations.push({
      file: path,
      line: 1,
      rule,
      detail: `Required artefact missing: ${path}`,
    });
  }
}

// --- Workbench ---
scan(walk(join(ROOT, "apps/web/components/documents")), [
  { rule: "workbench-no-document-core", pattern: /@apzhub\/document-core/ },
  {
    rule: "workbench-no-document-persistence",
    pattern: /@apzhub\/document-persistence/,
  },
  { rule: "workbench-no-document-storage", pattern: /@apzhub\/document-storage/ },
  { rule: "workbench-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "workbench-no-gateway",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
  },
  { rule: "workbench-no-handlers", pattern: /lib\/api\/v1\/handlers\/documents/ },
  {
    rule: "workbench-no-binary",
    pattern: /FormData|multipart\/form-data|createReadStream/,
  },
]);

// --- Typed client ---
scan(walk(join(ROOT, "apps/web/lib/documents")), [
  { rule: "client-no-document-core", pattern: /@apzhub\/document-core/ },
  { rule: "client-no-document-persistence", pattern: /@apzhub\/document-persistence/ },
  { rule: "client-no-document-storage", pattern: /@apzhub\/document-storage/ },
  { rule: "client-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "client-no-gateway",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
  },
  {
    rule: "client-no-binary",
    pattern: /FormData|multipart\/form-data|createReadStream/,
  },
]);

{
  const client = readFileSync(
    join(ROOT, "apps/web/lib/documents/document-client.ts"),
    "utf8",
  );
  if (!client.includes("/api/v1/documents")) {
    violations.push({
      file: "apps/web/lib/documents/document-client.ts",
      line: 1,
      rule: "client-must-target-documents-api",
      detail: "Typed client must call /api/v1/documents only",
    });
  }
}

// --- HTTP handlers / routes ---
scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
    f.includes("documents"),
  ),
  [
    { rule: "handlers-no-document-core", pattern: /@apzhub\/document-core/ },
    {
      rule: "handlers-no-document-persistence",
      pattern: /@apzhub\/document-persistence/,
    },
    { rule: "handlers-no-document-storage", pattern: /@apzhub\/document-storage/ },
    {
      rule: "handlers-no-storage-sdk",
      pattern: /@aws-sdk\/client-s3|createReadStream|putObject/,
    },
  ],
);

{
  const handler = readFileSync(
    join(ROOT, "apps/web/lib/api/v1/handlers/documents.ts"),
    "utf8",
  );
  if (!handler.includes("getPlatformServiceGateway")) {
    violations.push({
      file: "apps/web/lib/api/v1/handlers/documents.ts",
      line: 1,
      rule: "handlers-must-use-gateway",
      detail: "HTTP handlers must call getPlatformServiceGateway",
    });
  }
}

scan(walk(join(ROOT, "apps/web/app/api/v1/documents")), [
  {
    rule: "routes-no-document-core",
    pattern: /@apzhub\/document-core|@apzhub\/document-storage/,
  },
  {
    rule: "routes-no-binary",
    pattern: /FormData|multipart\/form-data|createReadStream/,
  },
]);

for (const file of walk(join(ROOT, "apps/web/app/api/v1/documents"))) {
  if (file.includes(".test.")) continue;
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

// --- Platform services document layer ---
// Composition root (create-document-platform-services.ts) may wire persistence/storage factories.
// Thin service impls must never import storage SDKs or call providers.
scan(
  walk(join(ROOT, "packages/platform-services/src/services/documents")).filter(
    (f) => !f.endsWith("create-document-platform-services.ts"),
  ),
  [
    {
      rule: "services-no-storage-sdk",
      pattern: /@aws-sdk\/client-s3|@apzhub\/document-storage/,
    },
    {
      rule: "services-no-apps-web",
      pattern: /apps\/web|from ["']@\/|next\/server/,
    },
    {
      rule: "services-no-binary-transfer",
      pattern: /FormData|multipart\/form-data|createReadStream/,
    },
  ],
);

scan(walk(join(ROOT, "packages/platform-services/src/services/documents")), [
  {
    rule: "services-no-apps-web",
    pattern: /apps\/web|from ["']@\/|next\/server/,
  },
]);

{
  const factory = readFileSync(
    join(
      ROOT,
      "packages/platform-services/src/services/documents/create-document-platform-services.ts",
    ),
    "utf8",
  );
  if (!factory.includes("createDocumentPlatformFoundation")) {
    violations.push({
      file: "packages/platform-services/src/services/documents/create-document-platform-services.ts",
      line: 1,
      rule: "factory-must-use-document-core",
      detail: "Production factory must compose Document Core foundation",
    });
  }
  observations.push({
    file: "packages/platform-services/src/services/documents/create-document-platform-services.ts",
    note: "Composition root wires persistence/storage factories into Document Core — providers are not called from thin service impls.",
  });
}

// --- Document core ---
scan(walk(join(ROOT, "packages/document-core/src")), [
  {
    rule: "core-no-apps-web",
    pattern: /apps\/web|from ["']@\/|next\/server/,
  },
  {
    rule: "core-no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
  {
    rule: "core-no-product-leakage",
    pattern: /@apzhub\/integration-plane|@apzhub\/integration-zammad|kimai|paperless/i,
  },
]);

// --- Persistence ---
scan(walk(join(ROOT, "packages/document-persistence/src")), [
  {
    rule: "persistence-no-apps-web",
    pattern: /apps\/web|from ["']@\/|next\/server/,
  },
  {
    rule: "persistence-no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
  {
    rule: "persistence-no-storage-sdk",
    pattern: /@aws-sdk\/client-s3|@apzhub\/document-storage/,
  },
]);

// --- Storage providers ---
scan(walk(join(ROOT, "packages/document-storage/src")), [
  {
    rule: "storage-no-apps-web",
    pattern: /apps\/web|from ["']@\/|next\/server/,
  },
  {
    rule: "storage-no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
  {
    rule: "storage-no-product-modules",
    pattern: /@apzhub\/integration-plane|@apzhub\/integration-zammad|services\/testing/,
  },
  {
    rule: "storage-no-azure-gcs",
    pattern: /@azure\/storage-blob|@google-cloud\/storage|BlobServiceClient/,
  },
]);

// --- Contracts ---
scan(walk(join(ROOT, "packages/document-contracts/src")), [
  {
    rule: "contracts-no-core",
    pattern: /@apzhub\/document-core/,
  },
  {
    rule: "contracts-no-persistence",
    pattern: /@apzhub\/document-persistence/,
  },
  {
    rule: "contracts-no-storage",
    pattern: /@apzhub\/document-storage/,
  },
  {
    rule: "contracts-no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
  {
    rule: "contracts-no-apps",
    pattern: /apps\/web|next\/server/,
  },
]);

// --- Authz map / OpenAPI / manifests / shell mount ---
{
  const authMap = readFileSync(
    join(
      ROOT,
      "packages/platform-services/src/authorization/operation-authorization-map.ts",
    ),
    "utf8",
  );
  if (!authMap.includes("documentPlatformOps")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-document-ops",
      detail: "documentPlatformOps must be registered",
    });
  }
}

{
  const openapi = readFileSync(
    join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
    "utf8",
  );
  if (!openapi.includes("Platform Documents") || !openapi.includes("/documents:")) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-missing-documents",
      detail: "OpenAPI must include Platform Documents and /documents paths",
    });
  }
}

{
  const page = readFileSync(
    join(ROOT, "apps/web/components/workbench-page.tsx"),
    "utf8",
  );
  if (!page.includes("DocumentsWorkspaceRouter")) {
    violations.push({
      file: "apps/web/components/workbench-page.tsx",
      line: 1,
      rule: "shell-missing-documents-router",
      detail: "WorkbenchPage must mount DocumentsWorkspaceRouter",
    });
  }
}

requireExists(
  "packages/workbench-framework/manifests/platform-documents/module.yaml",
  "missing-parent-manifest",
);
for (const child of [
  "overview",
  "library",
  "versions",
  "collections",
  "folders",
  "tags",
  "relationships",
  "retention",
  "audit",
  "diagnostics",
  "metadata",
]) {
  requireExists(
    `packages/workbench-framework/manifests/platform-documents-${child}/module.yaml`,
    "missing-child-manifest",
  );
}

// Observations (not violations)
observations.push({
  file: "apps/web/lib/api/v1/handlers/documents.ts",
  note: "Handlers import asDocumentId helpers from document-contracts (DTO brands only) — allowed; never document-core.",
});
observations.push({
  file: "testing/playwright",
  note: "Playwright Document Workbench may be LIMITED by unrelated Next.js slug conflict (relationshipId vs resourceType).",
});

if (violations.length > 0) {
  console.error("APZDOCS-006 Document Vertical Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZDOCS-006 Document Vertical Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log(
  "  - Workbench / typed client / HTTP / services / core / persistence / storage / contracts boundaries intact",
);
console.log("  - Dependency direction respected; no Azure/GCS providers");
console.log("  - OpenAPI Platform Documents + manifests + shell mount present");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
