/**
 * Template metadata describing the expected package layout from
 * REFERENCE-ADAPTER-STANDARD (directory structure §3).
 */

export interface AdapterTemplateFileSpec {
  readonly path: string;
  readonly required: boolean;
  readonly description: string;
  readonly category:
    | "manifest"
    | "package"
    | "bootstrap"
    | "adapter"
    | "config"
    | "capabilities"
    | "mappers"
    | "models"
    | "internal"
    | "operations"
    | "events"
    | "transport"
    | "health"
    | "diagnostics"
    | "testing"
    | "docs"
    | "validation";
}

export interface AdapterTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly standardReference: string;
  readonly files: readonly AdapterTemplateFileSpec[];
  readonly forbiddenPaths: readonly string[];
  readonly requiredExports: readonly string[];
}

const REFERENCE_FILES: readonly AdapterTemplateFileSpec[] = [
  {
    path: "integration.yaml",
    required: true,
    description: "Integration manifest (026) — before code",
    category: "manifest",
  },
  {
    path: "package.json",
    required: true,
    description: "Package manifest @apzhub/integration-{vendor}",
    category: "package",
  },
  {
    path: "tsconfig.json",
    required: true,
    description: "TypeScript project config",
    category: "package",
  },
  {
    path: "README.md",
    required: true,
    description: "Package README with boundary notes",
    category: "docs",
  },
  {
    path: "docs/{VENDOR}-ADAPTER.md",
    required: true,
    description: "Adapter guide",
    category: "docs",
  },
  {
    path: "docs/{VENDOR}-OPERATIONS.md",
    required: false,
    description: "Operations / certification guide",
    category: "docs",
  },
  {
    path: "docs/COMPLETION-CHECKLIST.md",
    required: false,
    description: "Adapter completion checklist",
    category: "docs",
  },
  {
    path: "src/index.ts",
    required: true,
    description: "Public exports only",
    category: "package",
  },
  {
    path: "src/{vendor}-adapter.ts",
    required: true,
    description: "Extends IntegrationAdapterBase",
    category: "adapter",
  },
  {
    path: "src/{vendor}-factory.ts",
    required: true,
    description: "Adapter factory entry",
    category: "bootstrap",
  },
  {
    path: "src/{vendor}-bootstrap.ts",
    required: true,
    description: "Bootstrap configuration",
    category: "bootstrap",
  },
  {
    path: "src/{vendor}-config.ts",
    required: true,
    description: "Configuration normalisation / validation",
    category: "config",
  },
  {
    path: "src/{vendor}-error-mapper.ts",
    required: true,
    description: "VendorErrorMapper implementation",
    category: "adapter",
  },
  {
    path: "src/capabilities/",
    required: true,
    description: "Capability declarations",
    category: "capabilities",
  },
  {
    path: "src/mappers/",
    required: true,
    description: "Vendor DTO ↔ canonical DTO mappers",
    category: "mappers",
  },
  {
    path: "src/models/",
    required: true,
    description: "Canonical + input types",
    category: "models",
  },
  {
    path: "src/internal/",
    required: true,
    description: "REST client — never exported publicly",
    category: "internal",
  },
  {
    path: "src/operations/",
    required: false,
    description: "Certification, readiness, health",
    category: "operations",
  },
  {
    path: "src/events/",
    required: false,
    description: "Event translation placeholders",
    category: "events",
  },
  {
    path: "src/testing/",
    required: true,
    description: "Mock vendor API + fixtures",
    category: "testing",
  },
  {
    path: "src/validation/",
    required: false,
    description: "Request validation helpers",
    category: "validation",
  },
  {
    path: "src/health/",
    required: false,
    description: "Health stubs (optional — may use SDK health)",
    category: "health",
  },
  {
    path: "src/diagnostics/",
    required: false,
    description: "Diagnostics stubs",
    category: "diagnostics",
  },
  {
    path: "src/transport/",
    required: false,
    description: "Transport placeholder / vendor client bridge",
    category: "transport",
  },
];

export const REFERENCE_ADAPTER_TEMPLATE: AdapterTemplate = {
  id: "reference-adapter-standard",
  name: "Reference Adapter Standard Template",
  description:
    "Expected package structure from docs/architecture/REFERENCE-ADAPTER-STANDARD.md §3",
  standardReference: "REFERENCE-ADAPTER-STANDARD",
  files: REFERENCE_FILES,
  forbiddenPaths: [
    "src/platform-services/",
    "src/gateway/",
    "src/http/",
    "src/ui/",
    "src/notifications/",
    "src/event-bus/",
  ],
  requiredExports: [
    "create{Vendor}Adapter",
    "{Vendor}Adapter",
    "normalize{Vendor}Configuration",
    "validate{Vendor}Configuration",
  ],
};

export function getAdapterTemplate(id = "reference-adapter-standard"): AdapterTemplate {
  if (id !== REFERENCE_ADAPTER_TEMPLATE.id) {
    throw new Error(`Unknown adapter template: ${id}`);
  }
  return REFERENCE_ADAPTER_TEMPLATE;
}

export function listRequiredTemplatePaths(vendorId: string): readonly string[] {
  const vendor = vendorId.toLowerCase();
  const vendorUpper = vendor.toUpperCase();
  const vendorPascal = vendor
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => capitalise(part))
    .join("");
  return REFERENCE_ADAPTER_TEMPLATE.files
    .filter((f) => f.required)
    .map((f) =>
      f.path
        .replaceAll("{vendor}", vendor)
        .replaceAll("{VENDOR}", vendorUpper)
        .replaceAll("{Vendor}", vendorPascal),
    );
}

function capitalise(value: string): string {
  return value.length === 0 ? value : value[0]!.toUpperCase() + value.slice(1);
}
