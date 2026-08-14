/**
 * Flagship F3 — shared helpers for ingest-mode automation providers.
 * Normalize provider reports → provider-neutral artifacts (no TCMS coupling).
 */

import { createHash, randomUUID } from "node:crypto";

import type { AutomationArtifact } from "../../contracts/execution";

export function artifactFromText(
  kind: AutomationArtifact["kind"],
  name: string,
  contentType: string,
  body: string | Buffer,
): AutomationArtifact {
  const bytes = typeof body === "string" ? Buffer.from(body) : body;
  return {
    artifactId: randomUUID(),
    kind,
    name,
    contentType,
    uri: `memory://ingest/${name}`,
    bytes: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    contentBase64: bytes.toString("base64"),
    createdAt: new Date().toISOString(),
  };
}

/** Decode report payload from target.metadata.reportBase64 or target.entry. */
export function resolveReportPayload(input: {
  readonly entry?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}): unknown {
  const b64 = input.metadata?.reportBase64?.trim();
  if (b64) {
    const text = Buffer.from(b64, "base64").toString("utf8");
    return JSON.parse(text) as unknown;
  }
  const entry = input.entry?.trim();
  if (entry) {
    try {
      return JSON.parse(entry) as unknown;
    } catch {
      // Allow raw XML / text reports (JUnit, etc.)
      return entry;
    }
  }
  throw new Error(
    "INGEST_REPORT_MISSING: provide target.metadata.reportBase64 or target.entry JSON",
  );
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("INGEST_REPORT_INVALID: expected JSON object");
  }
  return value as Record<string, unknown>;
}
