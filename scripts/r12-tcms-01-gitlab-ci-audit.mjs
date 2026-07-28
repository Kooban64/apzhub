#!/usr/bin/env node
/**
 * R12-TCMS-01 — GitLab CI Reference Adapter (metadata) audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PKG = join(ROOT, "integrations/gitlab-ci");
const PROVIDERS = join(ROOT, "packages/platform-services/src/providers/gitlab-ci");

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
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
      for (const rule of rules) {
        if (rule.skip?.(path, line)) continue;
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

const adapterFiles = walk(join(PKG, "src"));
const providerFiles = walk(PROVIDERS);

scan(adapterFiles, [
  {
    rule: "no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
  {
    rule: "no-http-workbench",
    pattern:
      /NextRequest|NextResponse|\/api\/v1\/testing|workbench-framework|PlatformTesting/,
  },
  {
    rule: "no-mutation-ops",
    // Flag executable mutation calls only — not capability catalogues / denial messages.
    pattern:
      /\.(dispatch|rerun|cancel|triggerPipeline|downloadArtifact)\s*\(|\b(function|async\s+function|const|let)\s+(dispatch|rerun|cancelWorkflow|triggerPipeline|downloadArtifact)\b/,
  },
  {
    rule: "no-vendor-dto-export-from-index",
    pattern: /GitLabCiRestClient|from\s+["']\.\/internal\//,
    skip: (path) => !path.endsWith("integrations/gitlab-ci/src/index.ts"),
  },
  {
    rule: "no-sibling-ci-adapter",
    pattern: /@apzhub\/integration-github-actions/,
  },
]);

scan(providerFiles, [
  {
    rule: "providers-use-public-api-only",
    pattern: /from\s+["']@apzhub\/integration-gitlab-ci\/internal/,
  },
  {
    rule: "no-vendor-rest-in-providers",
    pattern: /GitLabCiRestClient|\/internal\/gitlab-ci/,
  },
  {
    rule: "no-mutation-ops-providers",
    pattern:
      /\.(dispatch|rerun|cancel|triggerPipeline|downloadArtifact)\s*\(|\b(function|async\s+function|const|let)\s+(dispatch|rerun|cancelWorkflow|triggerPipeline|downloadArtifact)\b/,
  },
]);

const pkgJson = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
if (pkgJson.name !== "@apzhub/integration-gitlab-ci") {
  violations.push({
    file: "integrations/gitlab-ci/package.json",
    line: 1,
    rule: "package-name",
    detail: String(pkgJson.name),
  });
}
if (pkgJson.version !== "0.1.0") {
  violations.push({
    file: "integrations/gitlab-ci/package.json",
    line: 1,
    rule: "package-version",
    detail: String(pkgJson.version),
  });
}

const indexSrc = readFileSync(join(PKG, "src/index.ts"), "utf8");
if (!indexSrc.includes("createGitLabCiPipelineResultAdapter")) {
  violations.push({
    file: "integrations/gitlab-ci/src/index.ts",
    line: 1,
    rule: "export-parse-adapter",
    detail: "missing createGitLabCiPipelineResultAdapter",
  });
}
if (!indexSrc.includes("GITLAB_CI_UNSUPPORTED_OPERATIONS")) {
  // may be re-exported via capabilities — check capabilities export path
  if (!indexSrc.includes("GITLAB_CI_UNSUPPORTED_OPERATIONS")) {
    violations.push({
      file: "integrations/gitlab-ci/src/index.ts",
      line: 1,
      rule: "export-unsupported-ops",
      detail: "missing GITLAB_CI_UNSUPPORTED_OPERATIONS",
    });
  }
}

const adapterSrc = readFileSync(join(PKG, "src/gitlab-ci-adapter.ts"), "utf8");
if (!adapterSrc.includes("createHttpIntegrationClient")) {
  violations.push({
    file: "integrations/gitlab-ci/src/gitlab-ci-adapter.ts",
    line: 1,
    rule: "shared-http-transport",
    detail: "must use createHttpIntegrationClient",
  });
}

const manifest = readFileSync(join(PKG, "integration.yaml"), "utf8");
if (!/id:\s*gitlab-ci/.test(manifest) && !/id:\s*["']gitlab-ci["']/.test(manifest)) {
  violations.push({
    file: "integrations/gitlab-ci/integration.yaml",
    line: 1,
    rule: "manifest-id",
    detail: "expected id gitlab-ci",
  });
}

const platformPkg = JSON.parse(
  readFileSync(join(ROOT, "packages/platform-services/package.json"), "utf8"),
);
const deps = {
  ...(platformPkg.dependencies ?? {}),
  ...(platformPkg.devDependencies ?? {}),
};
if (!deps["@apzhub/integration-gitlab-ci"]) {
  violations.push({
    file: "packages/platform-services/package.json",
    line: 1,
    rule: "platform-dependency",
    detail: "missing @apzhub/integration-gitlab-ci",
  });
}

const createPs = readFileSync(
  join(ROOT, "packages/platform-services/src/services/create-platform-services.ts"),
  "utf8",
);
if (!createPs.includes("createPlatformServicesWithGitLabCi")) {
  violations.push({
    file: "packages/platform-services/src/services/create-platform-services.ts",
    line: 1,
    rule: "composition-factory",
    detail: "missing createPlatformServicesWithGitLabCi",
  });
}
if (!createPs.includes("registerGitLabCiProviders")) {
  violations.push({
    file: "packages/platform-services/src/services/create-platform-services.ts",
    line: 1,
    rule: "provider-registration",
    detail: "missing registerGitLabCiProviders",
  });
}

const catalogue = readFileSync(
  join(ROOT, "packages/testing-contracts/src/enums/catalogue.ts"),
  "utf8",
);
if (!catalogue.includes('"gitlab_ci"')) {
  violations.push({
    file: "packages/testing-contracts/src/enums/catalogue.ts",
    line: 1,
    rule: "provider-kind",
    detail: "gitlab_ci missing from PIPELINE_PROVIDER_KINDS",
  });
}

if (violations.length === 0) {
  console.log("R12-TCMS-01 audit: PASS (0 violations)");
  process.exit(0);
}

console.error(`R12-TCMS-01 audit: FAIL (${violations.length} violation(s))`);
for (const v of violations) {
  console.error(`  [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
}
process.exit(1);
