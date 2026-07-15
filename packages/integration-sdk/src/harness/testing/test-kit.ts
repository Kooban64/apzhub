import type { IntegrationRequestContext } from "../../types";
import type { SdkResult } from "../../errors/result";
import { createDefaultFixtures, type FixtureFramework } from "./fixtures";
import {
  createAdapterContractSuite,
  type AdapterContractSuiteResult,
  type ContractSubjectMetadata,
} from "../contracts/suite";
import type { IntegrationAdapterBase } from "../../adapter/adapter-base";

export interface BuildRequestContextInput {
  readonly correlationId?: string;
  readonly tenantId?: string;
  readonly workspaceId?: string;
  readonly userId?: string;
  readonly locale?: string;
  readonly timezone?: string;
  readonly permissionSnapshot?: readonly string[];
}

/**
 * Test helpers: request contexts, SdkResult assertions, contract suite runners.
 */
export class AdapterTestKit {
  readonly fixtures: FixtureFramework;

  constructor(fixtures: FixtureFramework = createDefaultFixtures()) {
    this.fixtures = fixtures;
  }

  buildRequestContext(input: BuildRequestContextInput = {}): IntegrationRequestContext {
    return {
      correlationId: input.correlationId ?? "corr-harness-test",
      tenantId: input.tenantId ?? "tenant-harness",
      workspaceId: input.workspaceId,
      userId: input.userId,
      locale: input.locale ?? "en-ZA",
      timezone: input.timezone ?? "Africa/Johannesburg",
      permissionSnapshot: input.permissionSnapshot,
    };
  }

  assertSdkOk<T>(result: SdkResult<T>): asserts result is { ok: true; value: T } {
    if (!result.ok) {
      throw new Error(
        `Expected SdkResult ok=true, got error: ${result.error.message} (${result.error.category})`,
      );
    }
  }

  assertSdkErr<T>(result: SdkResult<T>): asserts result is {
    ok: false;
    error: import("../../errors/types").IntegrationError;
  } {
    if (result.ok) {
      throw new Error("Expected SdkResult ok=false, got ok=true");
    }
  }

  isSdkOk<T>(result: SdkResult<T>): boolean {
    return result.ok;
  }

  runContractSuite(
    subject: IntegrationAdapterBase | ContractSubjectMetadata,
  ): AdapterContractSuiteResult {
    return createAdapterContractSuite().run(subject);
  }
}

export function createAdapterTestKit(): AdapterTestKit {
  return new AdapterTestKit();
}
