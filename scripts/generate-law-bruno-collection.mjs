#!/usr/bin/env node
/**
 * Generate Bruno collection from LAW-OpenAPI-v1.yaml (LAW-014-07).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const specPath = path.join(repoRoot, "docs/specs/LAW-OpenAPI-v1.yaml");
const outputRoot = path.join(repoRoot, "docs/specs/collections/bruno/LAW-OpenAPI-v1");
const publicRoot = path.join(
  repoRoot,
  "apps/web/public/specs/collections/bruno/LAW-OpenAPI-v1",
);

const spec = YAML.parse(fs.readFileSync(specPath, "utf8"));

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildBruFile(method, pathKey, operation) {
  const permission = operation["x-required-permission"];
  const status = operation["x-implementation-status"] ?? "planned";
  const hasBody = Boolean(operation.requestBody?.content?.["application/json"]);

  const lines = [
    "meta {",
    `  name: ${method.toUpperCase()} ${pathKey}`,
    "  type: http",
    "  seq: 1",
    "}",
    "",
    `${method} {`,
    "  url: {{baseUrl}}" + pathKey,
    "  body: " + (hasBody ? "json" : "none"),
    "  auth: inherit",
    "}",
    "",
    "headers {",
    "  x-tenant-id: {{tenantId}}",
    "  x-correlation-id: {{correlationId}}",
  ];

  if (hasBody) {
    lines.push("  Content-Type: application/json");
  }

  lines.push("}", "");

  if (hasBody) {
    lines.push("body:json {", "  {", "    ", "  }", "}", "");
  }

  if (permission || status) {
    lines.push("docs {");
    if (operation.summary) {
      lines.push(`  ${operation.summary}`);
    }
    if (permission) {
      lines.push(`  Permission: ${permission}`);
    }
    lines.push(`  Implementation: ${status}`);
    lines.push("}", "");
  }

  return lines.join("\n");
}

function writeCollection(rootDir) {
  fs.rmSync(rootDir, { recursive: true, force: true });
  fs.mkdirSync(rootDir, { recursive: true });

  fs.writeFileSync(
    path.join(rootDir, "bruno.json"),
    JSON.stringify(
      { version: "1", name: "LAW-OpenAPI-v1", type: "collection" },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(rootDir, "collection.bru"),
    ["meta {", "  name: APZHUB Law Platform API v1", "}", ""].join("\n"),
  );

  fs.mkdirSync(path.join(rootDir, "environments"), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, "environments", "local.bru"),
    [
      "vars {",
      "  baseUrl: http://localhost:3300/api/law/v1",
      "  tenantId: t0000001-0000-4000-8000-000000000001",
      "  correlationId: bruno-corr-001",
      "}",
      "",
    ].join("\n"),
  );

  const tagDirs = new Map();

  for (const [pathKey, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const method of ["get", "post", "patch", "delete"]) {
      const operation = pathItem[method];
      if (!operation) {
        continue;
      }

      const tag = operation.tags?.[0] ?? "Other";
      if (!tagDirs.has(tag)) {
        const tagDir = path.join(rootDir, slugify(tag));
        fs.mkdirSync(tagDir, { recursive: true });
        fs.writeFileSync(
          path.join(tagDir, "folder.bru"),
          ["meta {", `  name: ${tag}`, "  seq: 1", "}", ""].join("\n"),
        );
        tagDirs.set(tag, tagDir);
      }

      const fileName = `${slugify(method + pathKey)}.bru`;
      fs.writeFileSync(
        path.join(tagDirs.get(tag), fileName),
        buildBruFile(method, pathKey, operation),
      );
    }
  }
}

writeCollection(outputRoot);
writeCollection(publicRoot);

console.log(`Wrote Bruno collection to ${outputRoot}`);
