import { PLATFORM_CONFIG_REGISTRY, getConfigDefinition } from "./registry";
import type { SecretClassification, SecretDiagnostic } from "./types";

const SECRET_CLASSIFICATIONS: readonly SecretClassification[] = [
  "secret",
  "credential",
  "connection-string",
];

export function isSecretKey(key: string): boolean {
  const definition = getConfigDefinition(key);
  return definition ? SECRET_CLASSIFICATIONS.includes(definition.secret) : false;
}

export function maskSecretValue(
  value: string | undefined,
  classification: SecretClassification = "secret",
): string | undefined {
  if (!value) return undefined;
  if (classification === "none" || classification === "public") {
    return value;
  }

  if (value.length <= 8) {
    return "****";
  }

  if (classification === "connection-string") {
    return maskConnectionString(value);
  }

  return `${value.slice(0, 2)}${"*".repeat(Math.min(8, value.length - 4))}${value.slice(-2)}`;
}

function maskConnectionString(value: string): string {
  try {
    const url = new URL(value);
    if (url.password) {
      url.password = "****";
    }
    if (url.username) {
      url.username = `${url.username.slice(0, 1)}***`;
    }
    return url.toString();
  } catch {
    return `${value.slice(0, 8)}****`;
  }
}

export function buildSecretDiagnostics(
  env: NodeJS.ProcessEnv = process.env,
): SecretDiagnostic[] {
  const secretDefinitions = PLATFORM_CONFIG_REGISTRY.filter((definition) =>
    SECRET_CLASSIFICATIONS.includes(definition.secret),
  ).map((definition) => definition.key);

  return secretDefinitions.map((key) => {
    const definition = getConfigDefinition(key);
    const classification = definition?.secret ?? "secret";
    const raw = env[key]?.trim();
    const present = Boolean(raw);

    let status: SecretDiagnostic["status"] = "missing";
    if (present) {
      if (key === "BETTER_AUTH_SECRET" && raw!.length < 32) {
        status = "weak";
      } else {
        status = "configured";
      }
    }

    return {
      key,
      classification,
      present,
      status,
      maskedPreview: maskSecretValue(raw, classification),
    };
  });
}

export function redactSecretsInMessage(
  message: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  let redacted = message;
  for (const [key, value] of Object.entries(env)) {
    if (!value || !isSecretKey(key)) continue;
    if (redacted.includes(value)) {
      redacted = redacted
        .split(value)
        .join(maskSecretValue(value, getConfigDefinition(key)?.secret));
    }
  }
  return redacted;
}
