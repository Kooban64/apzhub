import type { BootstrapResult } from "@apzhub/platform-runtime/server";

export interface PlatformBootstrapOptions {
  readonly failFast?: boolean;
}

export interface BootstrapPackageDiagnostics {
  readonly package: "@apzhub/platform-bootstrap";
  readonly version: "0.1.0";
  readonly canonical: true;
  readonly workspaceRootConfigured: boolean;
  readonly runtimeReady: boolean;
  readonly runtimeStatus?: BootstrapResult["diagnostics"]["status"];
}

export interface OperationalDiagnosticsExtensions {
  readonly operationsDiagnostics?: Record<string, unknown>;
  readonly apiDiagnostics?: Record<string, unknown>;
  readonly workbenchDiagnostics?: Record<string, unknown>;
  readonly lawPlatformDiagnostics?: Record<string, unknown>;
  readonly trustAccountingDiagnostics?: Record<string, unknown>;
}
