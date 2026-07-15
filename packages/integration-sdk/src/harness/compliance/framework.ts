import { listRequiredTemplatePaths, REFERENCE_ADAPTER_TEMPLATE } from "../template";
import type { HarnessCheckOutcome, HarnessCheckResult } from "../types";
import type { AdapterComplianceInput, AdapterComplianceResult } from "./types";
import { summariseOutcome } from "../certification/report";

const DEFAULT_FORBIDDEN_DEPS = [
  "@apzhub/platform-services",
  "@apzhub/event-notification-framework",
] as const;

function pass(id: string, name: string, message: string): HarnessCheckResult {
  return { id, name, outcome: "pass", message };
}

function fail(id: string, name: string, message: string): HarnessCheckResult {
  return { id, name, outcome: "fail", message };
}

function warn(id: string, name: string, message: string): HarnessCheckResult {
  return { id, name, outcome: "warn", message };
}

/**
 * Compliance checks against Reference Adapter Standard — package layout,
 * required interfaces/capabilities, dependency rules, and docs completeness.
 */
export class AdapterCompliance {
  assess(input: AdapterComplianceInput): AdapterComplianceResult {
    const { structure } = input;
    const checks: HarnessCheckResult[] = [];
    const files = structure.files;
    const fileKeys = Object.keys(files);

    // Package layout
    const requiredPaths = listRequiredTemplatePaths(structure.vendorId);
    for (const path of requiredPaths) {
      if (path.endsWith("/")) {
        const hasDir = fileKeys.some(
          (k) => k.startsWith(path) || k.startsWith(path.slice(0, -1)),
        );
        checks.push(
          hasDir
            ? pass(
                `layout.${path}`,
                `Directory ${path}`,
                "Present in declared structure",
              )
            : fail(
                `layout.${path}`,
                `Directory ${path}`,
                "Missing from declared structure",
              ),
        );
      } else {
        checks.push(
          path in files
            ? pass(`layout.${path}`, `File ${path}`, "Present in declared structure")
            : fail(`layout.${path}`, `File ${path}`, "Missing from declared structure"),
        );
      }
    }

    // Forbidden paths
    for (const forbidden of REFERENCE_ADAPTER_TEMPLATE.forbiddenPaths) {
      const hit = fileKeys.some((k) => k.startsWith(forbidden.replace(/\/$/, "")));
      checks.push(
        hit
          ? fail(
              `layout.forbidden.${forbidden}`,
              `Forbidden path ${forbidden}`,
              "Must not exist",
            )
          : pass(
              `layout.forbidden.${forbidden}`,
              `Forbidden path ${forbidden}`,
              "Absent",
            ),
      );
    }

    // Required interfaces
    const interfaces = input.requiredInterfaces ??
      structure.requiredInterfaces ?? [
        "IntegrationAdapterBase",
        "health",
        "diagnostics",
      ];
    const allContent = Object.values(files).join("\n");
    for (const iface of interfaces) {
      const present = allContent.includes(iface);
      checks.push(
        present
          ? pass(
              `iface.${iface}`,
              `Interface/symbol ${iface}`,
              "Found in package sources",
            )
          : warn(
              `iface.${iface}`,
              `Interface/symbol ${iface}`,
              "Not found in declared file contents",
            ),
      );
    }

    // Capabilities
    const requiredCaps = input.requiredCapabilities ?? [
      "authentication",
      "health",
      "diagnostics",
    ];
    const declared = structure.declaredCapabilities ?? [];
    for (const cap of requiredCaps) {
      checks.push(
        declared.includes(cap)
          ? pass(`cap.${cap}`, `Capability ${cap}`, "Declared")
          : fail(`cap.${cap}`, `Capability ${cap}`, "Not declared"),
      );
    }

    // Dependency rules
    const deps = structure.dependencies ?? {};
    const forbidden = input.forbiddenDependencies ?? DEFAULT_FORBIDDEN_DEPS;
    for (const dep of forbidden) {
      checks.push(
        dep in deps
          ? fail(
              `deps.${dep}`,
              `Forbidden dependency ${dep}`,
              "Must not depend on this package",
            )
          : pass(`deps.${dep}`, `Forbidden dependency ${dep}`, "Not present"),
      );
    }
    checks.push(
      "@apzhub/integration-sdk" in deps ||
        Object.values(files).some((c) => c.includes("@apzhub/integration-sdk"))
        ? pass("deps.sdk", "Depends on integration-sdk", "SDK dependency present")
        : warn(
            "deps.sdk",
            "Depends on integration-sdk",
            "SDK dependency not found in package.json deps",
          ),
    );

    // Docs completeness
    const requiredDocs = input.requiredDocs ??
      structure.docsPresent ?? [
        `docs/${structure.vendorId.toUpperCase()}-ADAPTER.md`,
        "README.md",
      ];
    for (const doc of requiredDocs) {
      checks.push(
        doc in files || fileKeys.some((k) => k === doc || k.endsWith(doc))
          ? pass(`docs.${doc}`, `Doc ${doc}`, "Present")
          : fail(`docs.${doc}`, `Doc ${doc}`, "Missing"),
      );
    }

    const outcomes = checks.map((c) => c.outcome);
    const overall = summariseOutcome(outcomes) as HarnessCheckOutcome;
    const failed = checks.filter((c) => c.outcome === "fail").length;

    return {
      vendorId: structure.vendorId,
      overall,
      checks,
      summary:
        overall === "pass"
          ? `${structure.packageName} complies with Reference Adapter Standard`
          : `${structure.packageName} compliance ${overall}: ${failed} failing check(s)`,
    };
  }
}

export function createAdapterCompliance(): AdapterCompliance {
  return new AdapterCompliance();
}

export function assessAdapterCompliance(
  input: AdapterComplianceInput,
): AdapterComplianceResult {
  return createAdapterCompliance().assess(input);
}
