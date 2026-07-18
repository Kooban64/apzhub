import type {
  AutomationAdapterInput,
  AutomationResultAdapter,
  CanonicalAutomationCase,
  CanonicalAutomationEnvironment,
  CanonicalAutomationResult,
  CanonicalAutomationSuite,
  NormalizedResultStatus,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../../services/errors";

export function asObject(
  payload: AutomationAdapterInput["payload"],
): Record<string, unknown> {
  if (typeof payload === "string") {
    try {
      const parsed: unknown = JSON.parse(payload);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      if (Array.isArray(parsed)) {
        return { items: parsed };
      }
      throw new DomainRuleError(
        "INVALID_PAYLOAD",
        "JSON payload must be an object or array",
      );
    } catch (error) {
      if (error instanceof DomainRuleError) throw error;
      throw new DomainRuleError("INVALID_PAYLOAD", "Payload is not valid JSON");
    }
  }
  if (payload instanceof Uint8Array || ArrayBuffer.isView(payload)) {
    const view = payload as ArrayBufferView;
    const text = new TextDecoder().decode(
      new Uint8Array(view.buffer, view.byteOffset, view.byteLength),
    );
    return asObject(text);
  }
  return { ...payload };
}

export function asText(payload: AutomationAdapterInput["payload"]): string {
  if (typeof payload === "string") return payload;
  if (payload instanceof Uint8Array || ArrayBuffer.isView(payload)) {
    const view = payload as ArrayBufferView;
    return new TextDecoder().decode(
      new Uint8Array(view.buffer, view.byteOffset, view.byteLength),
    );
  }
  return JSON.stringify(payload);
}

export function readString(
  obj: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

export function readNumber(
  obj: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }
  return undefined;
}

export function deriveExternalRunRef(
  input: AutomationAdapterInput,
  fallbackPrefix: string,
): string {
  const fromMeta = input.metadata?.externalRunRef ?? input.metadata?.runId;
  if (fromMeta) return fromMeta;
  const obj =
    typeof input.payload === "object" &&
    !(input.payload instanceof Uint8Array) &&
    input.payload
      ? (input.payload as Record<string, unknown>)
      : undefined;
  if (obj) {
    const ref = readString(obj, "externalRunRef", "runId", "id", "name");
    if (ref) return ref;
  }
  return `${fallbackPrefix}-${Date.now()}`;
}

export function environmentFrom(
  obj: Record<string, unknown> | undefined,
): CanonicalAutomationEnvironment {
  if (!obj) return {};
  return {
    framework: readString(obj, "framework", "runner"),
    version: readString(obj, "version", "frameworkVersion"),
    commit: readString(obj, "commit", "commitHash", "sha"),
    branch: readString(obj, "branch"),
    build: readString(obj, "build", "buildId", "buildNumber"),
    pipeline: readString(obj, "pipeline", "pipelineId", "ci"),
    machine: readString(obj, "machine", "hostname"),
    platform: readString(obj, "platform", "os"),
    browser: readString(obj, "browser", "projectName"),
    device: readString(obj, "device"),
    os: readString(obj, "os"),
    nodeVersion: readString(obj, "nodeVersion", "node"),
  };
}

export function aggregateOverall(
  cases: readonly CanonicalAutomationCase[],
): NormalizedResultStatus {
  if (cases.length === 0) return "unknown";
  if (cases.some((c) => c.status === "fail" || c.status === "errored")) return "fail";
  if (cases.some((c) => c.status === "timed_out")) return "timed_out";
  if (cases.some((c) => c.status === "blocked")) return "blocked";
  if (cases.some((c) => c.status === "cancelled")) return "cancelled";
  if (cases.every((c) => c.status === "skipped")) return "skipped";
  if (cases.every((c) => c.status === "pass" || c.status === "skipped")) return "pass";
  return "unknown";
}

export function suiteFromCases(
  name: string,
  cases: readonly CanonicalAutomationCase[],
  key?: string,
): CanonicalAutomationSuite {
  return {
    key,
    name,
    cases,
    status: aggregateOverall(cases),
    durationMs: cases.reduce((sum, c) => sum + (c.durationMs ?? 0), 0),
  };
}

export function assertAdapterCanParse(
  adapter: AutomationResultAdapter,
  input: AutomationAdapterInput,
): void {
  if (!adapter.canParse(input)) {
    throw new DomainRuleError(
      "ADAPTER_CANNOT_PARSE",
      `Adapter ${adapter.kind} cannot parse the provided payload`,
      { kind: adapter.kind },
    );
  }
}

export type {
  AutomationAdapterInput,
  AutomationResultAdapter,
  CanonicalAutomationResult,
};
