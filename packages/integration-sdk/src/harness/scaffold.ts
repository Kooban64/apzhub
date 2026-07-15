import type { AdapterFileMap, ScaffoldAdapterInput } from "./types";
import { listRequiredTemplatePaths } from "./template";

export interface AdapterScaffoldResult {
  readonly vendorId: string;
  readonly packageName: string;
  readonly displayName: string;
  readonly files: AdapterFileMap;
  readonly checklist: readonly string[];
  readonly generatedAt: string;
}

function capitalise(value: string): string {
  return value.length === 0 ? value : value[0]!.toUpperCase() + value.slice(1);
}

/** Convert vendor-id / vendor_id into a valid PascalCase TypeScript identifier. */
function toPascalCase(vendorId: string): string {
  return vendorId
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => capitalise(part))
    .join("");
}

function toConstCase(vendorId: string): string {
  return vendorId
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.toUpperCase())
    .join("_");
}

function toVendorId(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!cleaned) {
    throw new Error("vendorId is required");
  }
  return cleaned;
}

/**
 * Generate an in-memory adapter package file tree following REFERENCE-ADAPTER-STANDARD.
 * Does NOT generate Platform Services or business functionality.
 */
export function scaffoldAdapter(input: ScaffoldAdapterInput): AdapterScaffoldResult {
  const vendorId = toVendorId(input.vendorId);
  const Vendor = toPascalCase(vendorId);
  const VENDOR_CONST = toConstCase(vendorId);
  const VENDOR_DOC = vendorId.toUpperCase();
  const displayName = input.displayName.trim() || Vendor;
  const packageName = `@apzhub/integration-${vendorId}`;
  const version = input.packageVersion ?? "0.1.0";
  const capabilityId = input.capabilityId ?? `integration.${vendorId}`;
  const capabilities = input.declaredCapabilities ?? [
    "authentication",
    "health",
    "diagnostics",
  ];
  const description =
    input.description ??
    `${displayName} CE integration adapter for APZHUB (scaffold — no business logic)`;
  const owner = input.owner ?? packageName;

  const files: Record<string, string> = {
    "package.json": JSON.stringify(
      {
        name: packageName,
        version,
        private: true,
        type: "module",
        description,
        exports: { ".": "./src/index.ts" },
        scripts: {
          typecheck: "tsc --noEmit -p tsconfig.json",
          lint: "eslint src/",
          test: `vitest run --config ../../vitest.config.ts integrations/${vendorId}`,
        },
        dependencies: {
          "@apzhub/integration-sdk": "workspace:*",
          "@apzhub/platform-service-contracts": "workspace:*",
        },
      },
      null,
      2,
    ),
    "tsconfig.json": JSON.stringify(
      {
        extends: "../../tsconfig.base.json",
        compilerOptions: { rootDir: "src", outDir: "dist" },
        include: ["src/**/*.ts"],
      },
      null,
      2,
    ),
    "integration.yaml": [
      `id: ${vendorId}`,
      `name: ${displayName}`,
      `version: ${version}`,
      `package: ${packageName}`,
      `capabilityId: ${capabilityId}`,
      "capabilities:",
      ...capabilities.map((c) => `  - ${c}`),
      "layer: adapter",
      "engine: self-hosted-ce",
      "notes:",
      "  - Scaffold only — implement vendor translation, not Platform Services",
      "",
    ].join("\n"),
    "README.md": [
      `# ${packageName}`,
      "",
      `${displayName} integration adapter scaffold.`,
      "",
      "## Boundary",
      "",
      "- Extends IntegrationAdapterBase from @apzhub/integration-sdk",
      "- Must NOT depend on @apzhub/platform-services",
      "- Must NOT use EntityMappingStore inside the adapter",
      "- Must NOT implement Platform Services, Gateway, UI, Event Bus, or notifications",
      "",
      "## Next steps",
      "",
      "1. Fill integration.yaml capabilities",
      "2. Implement config / error mapper / internal REST client",
      "3. Add mappers + testing mocks",
      "4. Run SDK harness certification before Wave closeout",
      "",
    ].join("\n"),
    [`docs/${VENDOR_DOC}-ADAPTER.md`]: [
      `# ${displayName} Adapter`,
      "",
      `Scaffold guide for ${packageName}.`,
      "",
      "## Architecture",
      "",
      "Adapter → Integration SDK → Vendor REST (internal).",
      "No Platform Service business logic in this package.",
      "",
    ].join("\n"),
    [`docs/${VENDOR_DOC}-OPERATIONS.md`]: [
      `# ${displayName} Operations`,
      "",
      "Operations / certification guide placeholder.",
      "",
      "- Capability certification",
      "- Compatibility matrix",
      "- Readiness / health classification",
      "",
    ].join("\n"),
    "docs/COMPLETION-CHECKLIST.md": [
      `# ${displayName} Completion Checklist`,
      "",
      "- [ ] integration.yaml complete",
      "- [ ] Extends IntegrationAdapterBase",
      "- [ ] Config validation",
      "- [ ] VendorErrorMapper",
      "- [ ] Health + diagnostics",
      "- [ ] Mock vendor API under src/testing/",
      "- [ ] Boundary audit (no platform-services / MappingStore)",
      "- [ ] SDK harness certification pass",
      "- [ ] Docs complete",
      "",
      "**Do not** implement Platform Services, Gateway HTTP, Workbench UI, or Event Bus here.",
      "",
    ].join("\n"),
    "src/index.ts": [
      `export { ${Vendor}Adapter } from "./${vendorId}-adapter";`,
      `export { create${Vendor}Adapter, dispose${Vendor}Adapter } from "./${vendorId}-factory";`,
      `export {`,
      `  normalize${Vendor}Configuration,`,
      `  validate${Vendor}Configuration,`,
      `} from "./${vendorId}-config";`,
      `export { create${Vendor}BootstrapConfiguration } from "./${vendorId}-bootstrap";`,
      `export { create${Vendor}VendorErrorMapper } from "./${vendorId}-error-mapper";`,
      "",
      `export const ${VENDOR_CONST}_ADAPTER_VERSION = "${version}";`,
      "",
    ].join("\n"),
    [`src/${vendorId}-adapter.ts`]: [
      `import { IntegrationAdapterBase } from "@apzhub/integration-sdk/adapter";`,
      `import type { AdapterContext, AdapterBootstrapConfiguration } from "@apzhub/integration-sdk/adapter";`,
      `import type { IntegrationHealthCheck } from "@apzhub/integration-sdk/diagnostics";`,
      `import type { IntegrationRequestContext } from "@apzhub/integration-sdk";`,
      "",
      `/** ${displayName} adapter stub — extend with vendor translation only. */`,
      `export class ${Vendor}Adapter extends IntegrationAdapterBase {`,
      `  constructor(context: AdapterContext, configuration: AdapterBootstrapConfiguration) {`,
      `    super(context, configuration);`,
      `  }`,
      "",
      `  protected override async onPerformHealthChecks(`,
      `    _context: IntegrationRequestContext,`,
      `  ): Promise<IntegrationHealthCheck[]> {`,
      `    return [{ name: "${vendorId}_engine", status: "warn", message: "Scaffold — not connected" }];`,
      `  }`,
      `}`,
      "",
    ].join("\n"),
    [`src/${vendorId}-factory.ts`]: [
      `import { createAdapterFactory } from "@apzhub/integration-sdk/adapter";`,
      `import type { AdapterBootstrapConfiguration } from "@apzhub/integration-sdk/adapter";`,
      `import { ${Vendor}Adapter } from "./${vendorId}-adapter";`,
      "",
      `export interface Create${Vendor}AdapterInput {`,
      `  readonly configuration: AdapterBootstrapConfiguration;`,
      `  readonly autoInitialise?: boolean;`,
      `}`,
      "",
      `export async function create${Vendor}Adapter(input: Create${Vendor}AdapterInput) {`,
      `  const factory = createAdapterFactory();`,
      `  return factory.create(${Vendor}Adapter, {`,
      `    configuration: input.configuration,`,
      `    autoInitialise: input.autoInitialise ?? true,`,
      `  });`,
      `}`,
      "",
      `export async function dispose${Vendor}Adapter(adapter: ${Vendor}Adapter): Promise<void> {`,
      `  await adapter.dispose("shutdown");`,
      `}`,
      "",
    ].join("\n"),
    [`src/${vendorId}-bootstrap.ts`]: [
      `import type { AdapterBootstrapConfiguration } from "@apzhub/integration-sdk/adapter";`,
      "",
      `export function create${Vendor}BootstrapConfiguration(`,
      `  overrides: Partial<AdapterBootstrapConfiguration> = {},`,
      `): AdapterBootstrapConfiguration {`,
      `  return {`,
      `    manifest: {`,
      `      integrationId: "${vendorId}",`,
      `      adapterId: "${vendorId}-adapter",`,
      `      name: "${displayName}",`,
      `      version: "${version}",`,
      `      capabilityId: "${capabilityId}",`,
      `      declaredCapabilities: ${JSON.stringify(capabilities)},`,
      `      owner: "${owner}",`,
      `      description: "${description.replace(/"/g, '\\"')}",`,
      `      ...overrides.manifest,`,
      `    },`,
      `    connection: overrides.connection,`,
      `  };`,
      `}`,
      "",
    ].join("\n"),
    [`src/${vendorId}-config.ts`]: [
      `export interface ${Vendor}Configuration {`,
      `  readonly baseUrl: string;`,
      `  readonly apiTokenRef: string;`,
      `}`,
      "",
      `export function normalize${Vendor}Configuration(`,
      `  input: Partial<${Vendor}Configuration>,`,
      `): ${Vendor}Configuration {`,
      `  return {`,
      `    baseUrl: (input.baseUrl ?? "").replace(/\\/$/, ""),`,
      `    apiTokenRef: input.apiTokenRef ?? "",`,
      `  };`,
      `}`,
      "",
      `export function validate${Vendor}Configuration(config: ${Vendor}Configuration): {`,
      `  readonly ok: boolean;`,
      `  readonly issues: readonly string[];`,
      `} {`,
      `  const issues: string[] = [];`,
      `  if (!config.baseUrl) issues.push("baseUrl is required");`,
      `  if (!config.apiTokenRef) issues.push("apiTokenRef is required");`,
      `  return { ok: issues.length === 0, issues };`,
      `}`,
      "",
    ].join("\n"),
    [`src/${vendorId}-error-mapper.ts`]: [
      `import type { VendorErrorInput, VendorErrorMapper, TranslatedIntegrationError } from "@apzhub/integration-sdk/errors";`,
      `import { createIntegrationError } from "@apzhub/integration-sdk/errors";`,
      "",
      `export function create${Vendor}VendorErrorMapper(): VendorErrorMapper {`,
      `  return {`,
      `    integrationId: "${vendorId}",`,
      `    map(input: VendorErrorInput): TranslatedIntegrationError | null {`,
      `      const status = input.statusCode ?? 0;`,
      `      const category =`,
      `        status === 401 || status === 403`,
      `          ? "authentication"`,
      `          : status === 404`,
      `            ? "not_found"`,
      `            : "vendor_unavailable";`,
      `      return {`,
      `        error: createIntegrationError({`,
      `          category,`,
      `          code: "${vendorId}.vendor_error",`,
      `          message: input.vendorMessage ?? "${displayName} vendor error",`,
      `          correlationId: input.context.correlationId,`,
      `          retryable: status >= 500,`,
      `          vendorStatusCode: status || undefined,`,
      `        }),`,
      `        severity: status >= 500 ? "error" : "warning",`,
      `      };`,
      `    },`,
      `  };`,
      `}`,
      "",
    ].join("\n"),
    "src/capabilities/placeholder.ts": [
      `/** Capability placeholder — register real vendor capabilities here. */`,
      `export const ${VENDOR_CONST}_SCAFFOLD_CAPABILITIES = ${JSON.stringify(capabilities)} as const;`,
      "",
    ].join("\n"),
    "src/mappers/placeholder.ts": [
      `/** Mapping placeholder — implement vendor DTO ↔ canonical DTO here. */`,
      `export const ${VENDOR_CONST}_MAPPING_PLACEHOLDER = true;`,
      "",
    ].join("\n"),
    "src/models/canonical.ts": [
      `/** Canonical model placeholders — no Platform Service DTOs. */`,
      `export interface ${Vendor}ResourceRef {`,
      `  readonly id: string;`,
      `}`,
      "",
    ].join("\n"),
    "src/internal/rest-client.ts": [
      `/** Package-private REST client placeholder — never export from index. */`,
      `export class ${Vendor}RestClient {`,
      `  constructor(private readonly baseUrl: string) {}`,
      `  getBaseUrl(): string {`,
      `    return this.baseUrl;`,
      `  }`,
      `}`,
      "",
    ].join("\n"),
    "src/operations/stub.ts": [
      `/** Operations stub — certification / readiness live here when ops milestone starts. */`,
      `export function ${vendorId}OperationsStub(): { readonly status: "scaffold" } {`,
      `  return { status: "scaffold" };`,
      `}`,
      "",
    ].join("\n"),
    "src/events/placeholder.ts": [
      `/** Events placeholder — webhook/polling translation only; no Event Bus publish. */`,
      `export const ${VENDOR_CONST}_EVENTS_PLACEHOLDER = true;`,
      "",
    ].join("\n"),
    "src/transport/placeholder.ts": [
      `/** Transport placeholder — prefer SDK TransportClient / mock transport in tests. */`,
      `export const ${VENDOR_CONST}_TRANSPORT_PLACEHOLDER = true;`,
      "",
    ].join("\n"),
    "src/health/stub.ts": [
      `/** Health stub — prefer SDK HealthProvider via IntegrationAdapterBase. */`,
      `export const ${VENDOR_CONST}_HEALTH_STUB = true;`,
      "",
    ].join("\n"),
    "src/diagnostics/stub.ts": [
      `/** Diagnostics stub — prefer SDK DiagnosticsProvider; never include secrets. */`,
      `export const ${VENDOR_CONST}_DIAGNOSTICS_STUB = true;`,
      "",
    ].join("\n"),
    "src/testing/mock-api.ts": [
      `/** Mock ${displayName} API for contract tests — exportable for platform certification. */`,
      `export function createMock${Vendor}Fetch(): typeof fetch {`,
      `  return async () =>`,
      `    new Response(JSON.stringify({ ok: true }), {`,
      `      status: 200,`,
      `      headers: { "content-type": "application/json" },`,
      `    });`,
      `}`,
      "",
    ].join("\n"),
    "src/testing/fixtures.ts": [
      `export const ${VENDOR_CONST}_TEST_FIXTURES = {`,
      `  tenantId: "tenant-test",`,
      `  correlationId: "corr-test",`,
      `} as const;`,
      "",
    ].join("\n"),
    "src/validation/placeholder.ts": [
      `/** Request validation placeholder. */`,
      `export const ${VENDOR_CONST}_VALIDATION_PLACEHOLDER = true;`,
      "",
    ].join("\n"),
    [`src/${vendorId}-adapter.test.ts`]: [
      `import { describe, expect, it } from "vitest";`,
      `import { create${Vendor}BootstrapConfiguration } from "./${vendorId}-bootstrap";`,
      "",
      `describe("${Vendor}Adapter scaffold", () => {`,
      `  it("builds bootstrap configuration", () => {`,
      `    const config = create${Vendor}BootstrapConfiguration();`,
      `    expect(config.manifest.integrationId).toBe("${vendorId}");`,
      `  });`,
      `});`,
      "",
    ].join("\n"),
  };

  // Ensure required template paths are represented
  for (const required of listRequiredTemplatePaths(vendorId)) {
    if (!(required in files) && !required.endsWith("/")) {
      files[required] = `// scaffold placeholder for ${required}\n`;
    }
    if (
      required.endsWith("/") &&
      !Object.keys(files).some((k) => k.startsWith(required))
    ) {
      files[`${required}placeholder.ts`] = `// scaffold placeholder for ${required}\n`;
    }
  }

  const checklist = [
    "Fill integration.yaml with real capabilities",
    "Implement internal REST client (package-private)",
    "Implement VendorErrorMapper categories",
    "Add mappers for canonical DTOs",
    "Add mock vendor API under src/testing/",
    "Run AdapterBoundaryValidator",
    "Run AdapterCertification via SDK harness",
    "Complete docs/{VENDOR}-ADAPTER.md",
    "Do NOT add Platform Services or business orchestration",
  ];

  return {
    vendorId,
    packageName,
    displayName,
    files,
    checklist,
    generatedAt: new Date().toISOString(),
  };
}

export class AdapterScaffold {
  generate(input: ScaffoldAdapterInput): AdapterScaffoldResult {
    return scaffoldAdapter(input);
  }
}

export function createAdapterScaffold(): AdapterScaffold {
  return new AdapterScaffold();
}
