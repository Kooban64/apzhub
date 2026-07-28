#!/usr/bin/env node
/**
 * APZQEP-ENG-010 — QEP engineering foundation audit.
 * Confirms stubs exist and no business domain implementation packages are claimed.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const errors = [];

function assert(cond, msg) {
  if (!cond) errors.push(msg);
}

const packages = [
  "packages/qep-types",
  "packages/qep-contracts",
  "packages/qep-foundation",
  "packages/qep-ui",
  "integrations/qep-github",
];
for (const p of packages) {
  assert(existsSync(join(root, p, "package.json")), `missing ${p}/package.json`);
  assert(existsSync(join(root, p, "src/index.ts")), `missing ${p}/src/index.ts`);
}

const modulesDir = join(root, "modules");
assert(existsSync(modulesDir), "modules/ missing");
const modules = readdirSync(modulesDir).filter((n) => n.startsWith("qep-"));
assert(modules.length === 22, `expected 22 qep modules, found ${modules.length}`);
for (const m of modules) {
  assert(
    existsSync(join(modulesDir, m, "module.yaml")),
    `missing modules/${m}/module.yaml`,
  );
}

const services = readdirSync(join(root, "services/qep/services"));
assert(services.length >= 16, `expected >=16 qep services, found ${services.length}`);

const events = readdirSync(join(root, "events/qep"));
assert(events.length >= 8, `expected >=8 qep events, found ${events.length}`);

assert(
  existsSync(join(root, "docs/products/apzqep/engineering/README.md")),
  "missing engineering docs README",
);

// Guard: foundation packages must not contain domain verbs as exports of business ops
const forbidden = [
  "createRequirement",
  "approveVerification",
  "executeSession",
  "certifyRelease",
];
for (const p of packages) {
  const src = join(root, p, "src");
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (full.endsWith(".ts") && !full.endsWith(".test.ts")) {
        const text = readFileSync(full, "utf8");
        for (const token of forbidden) {
          if (
            text.includes(`function ${token}`) ||
            text.includes(`export async function ${token}`)
          ) {
            errors.push(`${p} must not implement ${token}`);
          }
        }
      }
    }
  };
  walk(src);
}

if (errors.length) {
  console.error("APZQEP-ENG-010 foundation audit FAILED");
  for (const e of errors) console.error(" -", e);
  process.exit(1);
}
console.log("APZQEP-ENG-010 foundation audit PASS");
console.log(
  ` modules=${modules.length} services=${services.length} events=${events.length} packages=${packages.length}`,
);
