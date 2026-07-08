/** Shared DTO ↔ form value conversion helpers (LAW-014-06). */

export function customFieldsRecordToInput(
  fields: Readonly<Record<string, string>> | undefined,
): string {
  if (!fields) {
    return "";
  }

  return Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

export function tagsArrayToInput(tags: readonly string[] | undefined): string {
  return tags?.join(", ") ?? "";
}

export function stringArrayToCommaInput(values: readonly string[] | undefined): string {
  return values?.join(",") ?? "";
}

export function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function optionalBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  return defaultValue;
}

export function optionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
