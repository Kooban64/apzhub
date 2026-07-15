import type { HarnessCheckOutcome, HarnessCheckResult } from "../types";
import { summariseOutcome } from "../certification/report";

export interface BoundaryValidationInput {
  /** Relative path → file contents map (preferred for harness / CI without FS). */
  readonly files: Readonly<Record<string, string>>;
  readonly extraForbiddenPatterns?: readonly RegExp[];
}

export interface BoundaryValidationResult {
  readonly overall: HarnessCheckOutcome;
  readonly checks: readonly HarnessCheckResult[];
  readonly violations: readonly string[];
  readonly summary: string;
}

export const DEFAULT_FORBIDDEN_IMPORT_PATTERNS: readonly RegExp[] = [
  /from\s+["']@apzhub\/platform-services["']/,
  /from\s+["']@apzhub\/platform-services\//,
  /require\s*\(\s*["']@apzhub\/platform-services/,
  /EntityMappingStore/,
  /from\s+["']@apzhub\/event-notification-framework/,
  /from\s+["'].*\/packages\/platform-services/,
];

/** Patterns that suggest circular / provider leak smells in adapter packages. */
export const DEFAULT_PROVIDER_LEAK_PATTERNS: readonly RegExp[] = [
  /from\s+["']@apzhub\/integration-plane["']/,
  /from\s+["']@apzhub\/integration-zammad["']/,
  /export\s+.*PlaneRestClient|export\s+.*ZammadRestClient/,
  /from\s+["']\.\.\/internal\/.*["'].*\/\/\s*public/,
];

/**
 * Validate adapter boundary rules against an in-memory file contents map
 * (or any string map). Does not require filesystem access.
 */
export class AdapterBoundaryValidator {
  validate(input: BoundaryValidationInput): BoundaryValidationResult {
    const checks: HarnessCheckResult[] = [];
    const violations: string[] = [];
    const patterns = [
      ...DEFAULT_FORBIDDEN_IMPORT_PATTERNS,
      ...DEFAULT_PROVIDER_LEAK_PATTERNS,
      ...(input.extraForbiddenPatterns ?? []),
    ];

    for (const [path, content] of Object.entries(input.files)) {
      if (path.endsWith(".test.ts") || path.endsWith(".md")) {
        continue;
      }
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          const message = `${path}: matched ${pattern}`;
          violations.push(message);
          checks.push({
            id: `boundary.${path}.${pattern.source.slice(0, 40)}`,
            name: `Boundary ${path}`,
            outcome: "fail",
            message,
          });
        }
      }
    }

    if (violations.length === 0) {
      checks.push({
        id: "boundary.clean",
        name: "Adapter boundary clean",
        outcome: "pass",
        message: `Scanned ${Object.keys(input.files).length} files — no forbidden imports`,
      });
    }

    // Circular dependency smell: mutual package imports between adapters
    const joined = Object.values(input.files).join("\n");
    const importsPlane = /@apzhub\/integration-plane/.test(joined);
    const importsZammad = /@apzhub\/integration-zammad/.test(joined);
    if (importsPlane && importsZammad) {
      const message = "Circular / cross-vendor adapter import smell detected";
      violations.push(message);
      checks.push({
        id: "boundary.circular",
        name: "Cross-vendor circular imports",
        outcome: "fail",
        message,
      });
    } else {
      checks.push({
        id: "boundary.circular",
        name: "Cross-vendor circular imports",
        outcome: "pass",
        message: "No cross-vendor adapter import cycle detected",
      });
    }

    const overall = summariseOutcome(checks.map((c) => c.outcome));
    return {
      overall,
      checks,
      violations,
      summary:
        overall === "pass"
          ? "Adapter boundary validation passed"
          : `Adapter boundary validation failed (${violations.length} violation(s))`,
    };
  }
}

export function createAdapterBoundaryValidator(): AdapterBoundaryValidator {
  return new AdapterBoundaryValidator();
}

export function validateAdapterBoundary(
  input: BoundaryValidationInput,
): BoundaryValidationResult {
  return createAdapterBoundaryValidator().validate(input);
}
