export type VersionCompatibilityStatus =
  "compatible" | "warning" | "incompatible" | "not_checked";

export interface VersionRange {
  readonly min: string;
  readonly max?: string;
}

export interface VendorVersionInfo {
  readonly version: string;
  readonly build?: string;
  readonly apiVersion?: string;
}

export interface VersionCompatibilityResult {
  readonly status: VersionCompatibilityStatus;
  readonly detected?: VendorVersionInfo;
  readonly declared: VersionRange;
  readonly message?: string;
}
