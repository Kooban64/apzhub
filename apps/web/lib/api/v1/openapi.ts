import fs from "node:fs";
import path from "node:path";

import YAML from "yaml";

const SPEC_FILENAME = "APZHUB-Platform-OpenAPI-v1.yaml";

function resolvePlatformOpenApiSpecPath(): string {
  const candidates = [
    path.resolve(process.cwd(), "docs/specs", SPEC_FILENAME),
    path.resolve(process.cwd(), "../../docs/specs", SPEC_FILENAME),
    path.resolve(__dirname, "../../../../../../docs/specs", SPEC_FILENAME),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`OpenAPI specification not found: ${SPEC_FILENAME}`);
}

let cachedYaml: string | undefined;

export function loadPlatformOpenApiSpecYaml(): string {
  cachedYaml ??= fs.readFileSync(resolvePlatformOpenApiSpecPath(), "utf8");
  return cachedYaml;
}

export function loadPlatformOpenApiSpecObject(): Record<string, unknown> {
  // Spec reuses response anchors extensively; default yaml maxAliasCount (100) is too low.
  return YAML.parse(loadPlatformOpenApiSpecYaml(), {
    maxAliasCount: 10_000,
  }) as Record<string, unknown>;
}
