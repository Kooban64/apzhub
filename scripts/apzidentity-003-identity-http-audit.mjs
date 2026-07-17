#!/usr/bin/env node
/**
 * APZIDENTITY-003 — Platform Identity Administration HTTP API & Typed Client boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

const identityHandler = join(ROOT, "apps/web/lib/api/v1/handlers/identity.ts");
if (!existsSync(identityHandler)) {
  violations.push({
    file: "apps/web/lib/api/v1/handlers/identity.ts",
    line: 1,
    rule: "handlers-missing",
    detail: "identity handlers required",
  });
} else {
  const content = readFileSync(identityHandler, "utf8");
  if (!content.includes("getPlatformServiceGateway")) {
    violations.push({
      file: rel(identityHandler),
      line: 1,
      rule: "handlers-missing-gateway",
      detail: "identity handlers must call getPlatformServiceGateway",
    });
  }
  if (!content.includes("gateway.identity")) {
    violations.push({
      file: rel(identityHandler),
      line: 1,
      rule: "handlers-missing-identity-facet",
      detail: "handlers must call gateway.identity.*",
    });
  }
  if (
    content.includes("@apzhub/identity-core") ||
    content.includes("@apzhub/identity-persistence") ||
    /from\s+["']drizzle-orm/.test(content) ||
    /from\s+["']postgres/.test(content)
  ) {
    violations.push({
      file: rel(identityHandler),
      line: 1,
      rule: "handlers-forbidden-deps",
      detail: "no identity-core/persistence/drizzle/postgres in handlers",
    });
  }
}

scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) => f.includes("identity")),
  [
    {
      rule: "handlers-no-core",
      pattern:
        /@apzhub\/identity-core|@apzhub\/identity-persistence|from\s+["']drizzle-orm|from\s+["']postgres/,
    },
  ],
);

scan(walk(join(ROOT, "apps/web/lib/identity")), [
  {
    rule: "client-no-platform-services",
    pattern:
      /@apzhub\/platform-services|@apzhub\/identity-core|@apzhub\/identity-persistence|getPlatformServiceGateway/,
  },
  {
    rule: "client-path-constraint",
    pattern: /\/api\/v1\/(?!identity)/,
  },
]);

for (let i = violations.length - 1; i >= 0; i--) {
  if (violations[i].rule === "client-path-constraint") {
    const d = violations[i].detail;
    if (d.includes("/api/v1/identity") || !d.includes("/api/v1/")) {
      violations.splice(i, 1);
    }
  }
}

const clientFile = join(ROOT, "apps/web/lib/identity/identity-client.ts");
if (existsSync(clientFile)) {
  const client = readFileSync(clientFile, "utf8");
  if (
    !client.includes('"/api/v1/identity"') &&
    !client.includes("'/api/v1/identity'") &&
    !client.includes("IDENTITY_API_BASE")
  ) {
    violations.push({
      file: rel(clientFile),
      line: 1,
      rule: "client-missing-base",
      detail: "typed client must target /api/v1/identity",
    });
  }
  for (const method of [
    "login",
    "logout",
    "authenticate",
    "resetPassword",
    "provisionUser",
    "syncDirectory",
    "openWorkbench",
  ]) {
    if (client.includes(`${method}(`)) {
      violations.push({
        file: rel(clientFile),
        line: 1,
        rule: "client-forbidden-runtime-method",
        detail: `typed client must not expose ${method}`,
      });
    }
  }
}

const identityRoutes = walk(join(ROOT, "apps/web/app/api/v1/identity"));
if (identityRoutes.length === 0) {
  violations.push({
    file: "apps/web/app/api/v1/identity",
    line: 1,
    rule: "routes-missing",
    detail: "Expected /api/v1/identity routes to exist",
  });
}
for (const file of identityRoutes) {
  const content = readFileSync(file, "utf8");
  if (!content.includes("withPlatformApiAuth")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-missing-auth",
      detail: "Identity HTTP routes must use withPlatformApiAuth",
    });
  }
}

const forbiddenSegments = [
  "login",
  "logout",
  "password",
  "passwords",
  "session",
  "sessions",
  "oauth",
  "oidc",
  "saml",
  "scim",
  "ldap",
  "mfa",
  "token",
  "tokens",
  "provision",
  "provisioning",
  "entra",
  "directory-sync",
  "workbench",
  "execute",
  "runtime",
  "ai",
  "assist",
  "events",
  "stream",
];
for (const file of identityRoutes) {
  const path = rel(file);
  for (const segment of forbiddenSegments) {
    if (
      path.includes(`/identity/${segment}/`) ||
      path.endsWith(`/identity/${segment}/route.ts`)
    ) {
      violations.push({
        file: path,
        line: 1,
        rule: "forbidden-http-segment",
        detail: `Forbidden identity HTTP segment present: ${segment}`,
      });
    }
  }
}

const workbench = join(ROOT, "apps/web/app/workspace/identity");
if (existsSync(workbench)) {
  violations.push({
    file: rel(workbench),
    line: 1,
    rule: "workbench-forbidden",
    detail: "Identity Workbench is out of scope for APZIDENTITY-003",
  });
}

const openapi = readFileSync(
  join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
  "utf8",
);
if (!openapi.includes("\n  /identity/users:")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-identity",
    detail: "Expected /identity/users paths in OpenAPI",
  });
}
if (!openapi.includes("name: Platform Identity Administration")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-tag",
    detail: "Expected Platform Identity Administration tag",
  });
}
if (!openapi.includes("version: 1.7.0")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-version",
    detail: "Expected OpenAPI info.version 1.7.0",
  });
}
for (const bad of [
  "/identity/login",
  "/identity/password",
  "/identity/oauth",
  "/identity/scim",
  "/identity/workbench",
]) {
  if (openapi.includes(`\n  ${bad}:`)) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-forbidden-auth",
      detail: `OpenAPI must not document ${bad}`,
    });
  }
}

const bootstrap = readFileSync(
  join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
  "utf8",
);
if (!bootstrap.includes("isIdentityServiceEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-flag",
    detail: "Bootstrap must wire APZHUB_IDENTITY_ENABLED",
  });
}
if (!bootstrap.includes("identityEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-identity",
    detail: "Gateway bootstrap must wire identity platform services",
  });
}

if (violations.length > 0) {
  console.error("APZIDENTITY-003 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZIDENTITY-003 architecture audit PASSED");
console.log("  handlers → gateway.identity.* only");
console.log("  typed client → /api/v1/identity only");
console.log("  bootstrap wires identity platform services");
console.log("  OpenAPI Platform Identity Administration + 1.7.0 present");
console.log("  no login/password/oauth/scim/workbench routes");
console.log("  no Identity Workbench");
process.exit(0);
