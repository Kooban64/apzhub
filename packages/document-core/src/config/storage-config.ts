/**
 * Document storage configuration (APZDOCS-002).
 * Secrets are references only — never resolved values.
 */

export type DocumentStorageMode = "filesystem" | "s3" | "memory_test";

export type DocumentStorageConfig = {
  readonly mode: DocumentStorageMode;
  readonly providerId: string;
  readonly filesystemRoot?: string;
  readonly allowFilesystemInProduction?: boolean;
  readonly s3Endpoint?: string;
  readonly s3Region?: string;
  readonly s3Bucket?: string;
  readonly s3ForcePathStyle?: boolean;
  readonly s3AccessKeyRef?: string;
  readonly s3SecretKeyRef?: string;
  readonly s3SessionTokenRef?: string;
  readonly tlsRequired?: boolean;
  readonly maxObjectBytes: number;
  readonly allowedMimeTypes?: readonly string[];
  readonly checksumAlgorithm: "sha256";
  readonly stagingDirectory?: string;
  readonly allowBinaryDeletion: boolean;
  readonly encryptionKeyRef?: string;
};

export type DocumentStorageConfigValidation = {
  readonly ok: boolean;
  readonly errors: readonly string[];
};

export function validateDocumentStorageConfig(
  config: DocumentStorageConfig,
  options: { readonly production?: boolean } = {},
): DocumentStorageConfigValidation {
  const errors: string[] = [];
  if (!config.providerId.trim()) errors.push("providerId is required");
  if (config.maxObjectBytes <= 0) errors.push("maxObjectBytes must be positive");
  if (config.checksumAlgorithm !== "sha256") {
    errors.push("checksumAlgorithm must be sha256");
  }
  if (config.mode === "filesystem") {
    if (!config.filesystemRoot?.trim()) {
      errors.push("filesystemRoot is required for filesystem mode");
    }
    if (options.production && !config.allowFilesystemInProduction) {
      errors.push(
        "filesystem mode requires allowFilesystemInProduction=true in production",
      );
    }
  }
  if (config.mode === "s3") {
    if (!config.s3Bucket?.trim()) errors.push("s3Bucket is required");
    if (!config.s3Region?.trim()) errors.push("s3Region is required");
    if (!config.s3AccessKeyRef?.trim()) errors.push("s3AccessKeyRef is required");
    if (!config.s3SecretKeyRef?.trim()) errors.push("s3SecretKeyRef is required");
  }
  if (config.mode === "memory_test" && options.production) {
    errors.push("memory_test mode is forbidden in production");
  }
  return { ok: errors.length === 0, errors };
}

/** Safe diagnostics — no secrets, no absolute paths, no object keys. */
export function redactDocumentStorageConfig(
  config: DocumentStorageConfig,
): Record<string, unknown> {
  return {
    mode: config.mode,
    providerId: config.providerId,
    s3Region: config.s3Region,
    s3ForcePathStyle: config.s3ForcePathStyle ?? false,
    tlsRequired: config.tlsRequired ?? true,
    maxObjectBytes: config.maxObjectBytes,
    checksumAlgorithm: config.checksumAlgorithm,
    allowBinaryDeletion: config.allowBinaryDeletion,
    hasFilesystemRoot: Boolean(config.filesystemRoot),
    hasS3Endpoint: Boolean(config.s3Endpoint),
    hasS3Bucket: Boolean(config.s3Bucket),
    hasAccessKeyRef: Boolean(config.s3AccessKeyRef),
    hasSecretKeyRef: Boolean(config.s3SecretKeyRef),
    hasSessionTokenRef: Boolean(config.s3SessionTokenRef),
    hasEncryptionKeyRef: Boolean(config.encryptionKeyRef),
  };
}
