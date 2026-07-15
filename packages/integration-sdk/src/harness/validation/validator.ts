import type { AdapterPackageStructure, HarnessCheckResult } from "../types";
import { assessAdapterCompliance } from "../compliance/framework";
import { validateAdapterCapabilities } from "./capability-validator";
import { validateAdapterBoundary } from "../boundary/validator";
import type { AdapterCertificationSubject } from "../certification/types";
import { certifyAdapter } from "../certification/engine";

export interface AdapterValidatorInput {
  readonly structure?: AdapterPackageStructure;
  readonly certificationSubject?: AdapterCertificationSubject;
  readonly fileContents?: Readonly<Record<string, string>>;
  readonly declaredCapabilities?: readonly string[];
  readonly requiredCapabilities?: readonly string[];
}

export interface AdapterValidatorResult {
  readonly ok: boolean;
  readonly checks: readonly HarnessCheckResult[];
  readonly summary: string;
}

/**
 * Aggregating validator — compliance + capabilities + boundary (+ optional certification).
 */
export class AdapterValidator {
  validate(input: AdapterValidatorInput): AdapterValidatorResult {
    const checks: HarnessCheckResult[] = [];

    if (input.structure) {
      const compliance = assessAdapterCompliance({ structure: input.structure });
      checks.push(...compliance.checks);
    }

    const caps = validateAdapterCapabilities({
      declared:
        input.declaredCapabilities ?? input.structure?.declaredCapabilities ?? [],
      required: input.requiredCapabilities,
    });
    checks.push(...caps);

    if (input.fileContents || input.structure?.files) {
      const boundary = validateAdapterBoundary({
        files: input.fileContents ?? input.structure!.files,
      });
      checks.push(...boundary.checks);
    }

    if (input.certificationSubject) {
      const report = certifyAdapter(input.certificationSubject);
      for (const category of report.categories) {
        checks.push(...category.checks);
      }
    }

    const failed = checks.filter((c) => c.outcome === "fail").length;
    const ok = failed === 0;
    return {
      ok,
      checks,
      summary: ok
        ? `Adapter validation passed (${checks.length} checks)`
        : `Adapter validation failed (${failed} failures)`,
    };
  }
}

export function createAdapterValidator(): AdapterValidator {
  return new AdapterValidator();
}

export function validateAdapter(input: AdapterValidatorInput): AdapterValidatorResult {
  return createAdapterValidator().validate(input);
}
