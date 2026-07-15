#!/usr/bin/env node
/**
 * APZDOCS-005 — Document Workbench boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
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
    else if (/\.(ts|tsx|mjs|js|yaml|yml)$/.test(entry) && !entry.endsWith(".d.ts")) {
      out.push(full);
    }
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

const componentFiles = walk(join(ROOT, "apps/web/components/documents"));
const libFiles = walk(join(ROOT, "apps/web/lib/documents")).filter(
  (f) => !f.includes("document-boundary"),
);

scan([...componentFiles, ...libFiles], [
  {
    rule: "ui-no-document-core",
    pattern: /@apzhub\/document-core|@apzhub\/document-persistence|@apzhub\/document-storage/,
  },
  {
    rule: "ui-no-platform-services",
    pattern: /@apzhub\/platform-services|getPlatformServiceGateway/,
  },
  {
    rule: "ui-no-binary",
    pattern: /FormData|multipart\/form-data|createReadStream|arrayBuffer\(/,
  },
]);

const view = join(ROOT, "apps/web/components/documents/platform-documents-view.tsx");
if (!existsSync(view)) {
  violations.push({
    file: "apps/web/components/documents/platform-documents-view.tsx",
    line: 1,
    rule: "missing-workbench-view",
    detail: "Platform Documents view required",
  });
} else {
  const content = readFileSync(view, "utf8");
  if (!content.includes("@/lib/documents/document-api")) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "view-must-use-document-api",
      detail: "Workbench must call document-api facades",
    });
  }
  if (/\bfetch\s*\(/.test(content)) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "view-no-direct-fetch",
      detail: "No direct fetch from workbench view",
    });
  }
}

const workbenchPage = readFileSync(
  join(ROOT, "apps/web/components/workbench-page.tsx"),
  "utf8",
);
if (!workbenchPage.includes("DocumentsWorkspaceRouter")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-documents-router",
    detail: "WorkbenchPage must mount DocumentsWorkspaceRouter",
  });
}

const parentManifest = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-documents/module.yaml",
);
if (!existsSync(parentManifest)) {
  violations.push({
    file: "packages/workbench-framework/manifests/platform-documents/module.yaml",
    line: 1,
    rule: "missing-manifest",
    detail: "platform-documents manifest required",
  });
} else {
  const yaml = readFileSync(parentManifest, "utf8");
  if (!yaml.includes("document.read") || !yaml.includes("/workspace/documents")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-incomplete",
      detail: "Expected document.read permission and /workspace/documents route",
    });
  }
}

const requiredChildren = [
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
];
for (const child of requiredChildren) {
  const path = join(
    ROOT,
    `packages/workbench-framework/manifests/platform-documents-${child}/module.yaml`,
  );
  if (!existsSync(path)) {
    violations.push({
      file: rel(path),
      line: 1,
      rule: "missing-child-manifest",
      detail: `Missing sidebar manifest platform-documents-${child}`,
    });
  }
}

if (violations.length > 0) {
  console.error("APZDOCS-005 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZDOCS-005 architecture audit PASSED");
console.log("  - workbench uses document-api only");
console.log("  - no document-core / persistence / storage / gateway in UI");
console.log("  - manifests present for Documents navigation");
console.log("  - WorkbenchPage mounts DocumentsWorkspaceRouter");
process.exit(0);
