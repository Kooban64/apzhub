import fs from "node:fs";
import path from "node:path";

import YAML from "yaml";

const SPEC_FILENAME = "LAW-OpenAPI-v1.yaml";

function resolveOpenApiSpecPath(): string {
  const candidates = [
    path.resolve(process.cwd(), "docs/specs", SPEC_FILENAME),
    path.resolve(process.cwd(), "../../docs/specs", SPEC_FILENAME),
    path.resolve(__dirname, "../../../../../docs/specs", SPEC_FILENAME),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`OpenAPI specification not found: ${SPEC_FILENAME}`);
}

let cachedYaml: string | undefined;

/** Load the canonical OpenAPI YAML specification from docs/specs (LAW-014-07). */
export function loadOpenApiSpecYaml(): string {
  cachedYaml ??= fs.readFileSync(resolveOpenApiSpecPath(), "utf8");
  return cachedYaml;
}

/** Parse OpenAPI YAML to a JSON-serialisable object. */
export function loadOpenApiSpecObject(): Record<string, unknown> {
  return YAML.parse(loadOpenApiSpecYaml()) as Record<string, unknown>;
}

export function getOpenApiSpecPath(): string {
  return resolveOpenApiSpecPath();
}

export function resetOpenApiSpecCache(): void {
  cachedYaml = undefined;
}

export const LAW_API_OPENAPI_YAML_URL = "/api/law/v1/openapi.yaml";
export const LAW_API_OPENAPI_JSON_URL = "/api/law/v1/openapi.json";
export const LAW_API_DOCS_URL = "/api/docs";
