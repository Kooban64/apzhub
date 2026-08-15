import {
  createIntegrationError,
  IntegrationSdkError,
} from "@apzhub/integration-sdk/errors";

export const KIMAI_ID_PREFIX = {
  timesheet: "tts",
  activity: "tact",
  customer: "tcust",
  project: "tproj",
  tag: "ttag",
} as const;

export type KimaiIdPrefix = (typeof KIMAI_ID_PREFIX)[keyof typeof KIMAI_ID_PREFIX];

export function toPlatformTimeId(prefix: KimaiIdPrefix, engineId: number): string {
  return `${prefix}_${engineId}`;
}

export function fromPlatformTimeId(
  prefix: KimaiIdPrefix,
  platformId: string,
  correlationId: string,
): number {
  const expected = `${prefix}_`;
  if (!platformId.startsWith(expected)) {
    throw new IntegrationSdkError(
      createIntegrationError({
        category: "validation",
        code: "INVALID_IDENTIFIER",
        message: `Expected platform ID with prefix '${expected}'`,
        correlationId,
        retryable: false,
        details: { platformId, prefix },
      }),
    );
  }
  const raw = platformId.slice(expected.length);
  const engineId = Number(raw);
  if (!Number.isInteger(engineId) || engineId <= 0) {
    throw new IntegrationSdkError(
      createIntegrationError({
        category: "validation",
        code: "INVALID_IDENTIFIER",
        message: `Invalid Kimai engine id in '${platformId}'`,
        correlationId,
        retryable: false,
        details: { platformId, prefix },
      }),
    );
  }
  return engineId;
}

/** Kimai write timestamps must be HTML5 local datetime without timezone. */
export function toKimaiDateTime(isoOrLocal: string): string {
  const trimmed = isoOrLocal.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return trimmed.slice(0, 19);
  }
  const date = new Date(parsed);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

export function toIsoDateTime(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  // Kimai CE commonly returns offsets as +0000 / +0200 (no colon). Normalize before parse.
  const normalized = trimmed.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const candidate =
    normalized.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(normalized)
      ? normalized
      : `${normalized}Z`;
  const date = new Date(candidate);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}
