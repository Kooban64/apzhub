#!/usr/bin/env node
/**
 * Generate Postman collection and environment from LAW-OpenAPI-v1.yaml (LAW-014-07).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const specPath = path.join(repoRoot, "docs/specs/LAW-OpenAPI-v1.yaml");
const outputDir = path.join(repoRoot, "docs/specs/collections");
const publicDir = path.join(repoRoot, "apps/web/public/specs/collections");

const spec = YAML.parse(fs.readFileSync(specPath, "utf8"));
const baseUrl = "{{baseUrl}}";

function buildRequestItem(method, pathKey, operation, tag) {
  const permission = operation["x-required-permission"];
  const status = operation["x-implementation-status"] ?? "planned";
  const name = `${method.toUpperCase()} ${pathKey}${status !== "implemented" ? " (planned)" : ""}`;

  const headers = [
    { key: "x-tenant-id", value: "{{tenantId}}", type: "text" },
    { key: "x-correlation-id", value: "{{$guid}}", type: "text" },
  ];

  if (method !== "get" && method !== "delete") {
    headers.push({ key: "Content-Type", value: "application/json", type: "text" });
  }

  const item = {
    name,
    request: {
      method: method.toUpperCase(),
      header: headers,
      url: {
        raw: `${baseUrl}${pathKey}`,
        host: ["{{baseUrl}}"],
        path: pathKey.split("/").filter(Boolean),
      },
      description: [
        operation.summary ?? "",
        permission ? `Permission: \`${permission}\`` : "",
        `Status: ${status}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    response: [],
  };

  if (operation.requestBody?.content?.["application/json"]?.schema) {
    item.request.body = {
      mode: "raw",
      raw: "{\n  \n}",
      options: { raw: { language: "json" } },
    };
  }

  return { tag, item };
}

const folders = new Map();

for (const [pathKey, pathItem] of Object.entries(spec.paths ?? {})) {
  for (const method of ["get", "post", "patch", "delete", "put"]) {
    const operation = pathItem[method];
    if (!operation) {
      continue;
    }

    const tag = operation.tags?.[0] ?? "Other";
    const { item } = buildRequestItem(method, pathKey, operation, tag);
    if (!folders.has(tag)) {
      folders.set(tag, []);
    }
    folders.get(tag).push(item);
  }
}

const collection = {
  info: {
    name: "APZHUB Law Platform API v1",
    description: spec.info?.description ?? "Law Platform REST API",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    _postman_id: "law-openapi-v1-collection",
  },
  auth: {
    type: "noauth",
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:3300/api/law/v1" },
    { key: "tenantId", value: "t0000001-0000-4000-8000-000000000001" },
  ],
  item: [...folders.entries()].map(([tag, items]) => ({
    name: tag,
    item: items,
  })),
};

const environment = {
  id: "law-openapi-v1-local",
  name: "Law API — Local Development",
  values: [
    {
      key: "baseUrl",
      value: "http://localhost:3300/api/law/v1",
      type: "default",
      enabled: true,
    },
    {
      key: "tenantId",
      value: "t0000001-0000-4000-8000-000000000001",
      type: "default",
      enabled: true,
    },
    {
      key: "correlationId",
      value: "postman-corr-001",
      type: "default",
      enabled: true,
    },
  ],
  _postman_variable_scope: "environment",
};

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });

const collectionFile = "LAW-OpenAPI-v1.postman_collection.json";
const environmentFile = "LAW-OpenAPI-v1.postman_environment.json";

const collectionJson = JSON.stringify(collection, null, 2);
const environmentJson = JSON.stringify(environment, null, 2);

for (const dir of [outputDir, publicDir]) {
  fs.writeFileSync(path.join(dir, collectionFile), collectionJson);
  fs.writeFileSync(path.join(dir, environmentFile), environmentJson);
}

console.log(`Wrote Postman collection to ${outputDir}/${collectionFile}`);
console.log(`Wrote Postman environment to ${outputDir}/${environmentFile}`);
