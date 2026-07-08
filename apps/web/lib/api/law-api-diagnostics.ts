import { buildLawApiAuthDiagnostics } from "./auth/auth-diagnostics";
import type { LawApiAuthenticatedContext } from "./context/build-authenticated-context";
import {
  LAW_API_BASE_PATH,
  LAW_API_SCAFFOLD_VERSION,
  LAW_API_SERVICE_NAME,
  LAW_API_VERSION,
} from "./constants";

export interface LawApiRouteDescriptor {
  readonly method: string;
  readonly path: string;
  readonly description: string;
}

export interface LawApiDiagnosticsData {
  readonly service: string;
  readonly apiVersion: string;
  readonly scaffoldVersion: string;
  readonly basePath: string;
  readonly environment: string;
  readonly routes: readonly LawApiRouteDescriptor[];
  readonly capabilities: {
    readonly authentication: boolean;
    readonly authorization: boolean;
    readonly entityApis: boolean;
    readonly webhooks: boolean;
  };
  readonly auth: ReturnType<typeof buildLawApiAuthDiagnostics>;
  readonly documentationPath: string;
  readonly openApiPath: string;
}

/** Safe diagnostics payload — includes auth status without secrets (LAW-014-02). */
export function buildLawApiDiagnosticsData(
  context: LawApiAuthenticatedContext,
): LawApiDiagnosticsData {
  return {
    service: LAW_API_SERVICE_NAME,
    apiVersion: LAW_API_VERSION,
    scaffoldVersion: LAW_API_SCAFFOLD_VERSION,
    basePath: LAW_API_BASE_PATH,
    environment: process.env.NODE_ENV ?? "development",
    routes: [
      {
        method: "GET",
        path: `${LAW_API_BASE_PATH}/health`,
        description: "Law API liveness probe (public)",
      },
      {
        method: "GET",
        path: `${LAW_API_BASE_PATH}/diagnostics`,
        description: "Law API scaffold diagnostics (authenticated)",
      },
      {
        method: "GET",
        path: `${LAW_API_BASE_PATH}/openapi.yaml`,
        description: "OpenAPI 3.1 specification (YAML)",
      },
      {
        method: "GET",
        path: `${LAW_API_BASE_PATH}/openapi.json`,
        description: "OpenAPI 3.1 specification (JSON)",
      },
      {
        method: "GET",
        path: "/api/docs",
        description: "Developer documentation and API explorer",
      },
      {
        method: "GET",
        path: "/api/docs/guides/{slug}",
        description: "Developer guide markdown",
      },
    ],
    capabilities: {
      authentication: true,
      authorization: true,
      entityApis: true,
      webhooks: false,
    },
    auth: buildLawApiAuthDiagnostics(context),
    documentationPath: "/api/docs",
    openApiPath: `${LAW_API_BASE_PATH}/openapi.yaml`,
  };
}
