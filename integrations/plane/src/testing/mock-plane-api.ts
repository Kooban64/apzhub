import type { FetchFn } from "../internal/plane-fetch-client";
import { normalizePlaneConfiguration } from "../plane-config";

export interface MockPlaneApiOptions {
  readonly instanceVersion?: string;
  readonly workspaceId?: string;
  readonly workspaceName?: string;
  readonly failInstance?: boolean;
  readonly failWorkspace?: boolean;
  readonly instanceStatus?: number;
  readonly workspaceStatus?: number;
  readonly requireApiKey?: boolean;
  readonly delayMs?: number;
  /** Force webhook endpoints to fail with the given status. */
  readonly webhookStatus?: number;
  /** Force sync-related list endpoints to fail (projects/issues). */
  readonly syncStatus?: number;
  readonly rateLimitWebhooks?: boolean;
  /** Return 404 for matching pathname substrings (unsupported APIs). */
  readonly unsupportedEndpoints?: readonly string[];
  /** Force analytics/project-stats to fail. */
  readonly analyticsStatus?: number;
  /** Simulated edition metadata (informational for tests). */
  readonly edition?: "community" | "enterprise";
  /** Interrupt sync mid-flight after N successful project list calls. */
  readonly syncInterruptAfterCalls?: number;
}

export function createMockPlaneFetch(options: MockPlaneApiOptions = {}): FetchFn {
  const {
    instanceVersion = "0.23.1",
    workspaceId = "ws-001",
    workspaceName = "APZHUB",
    failInstance = false,
    failWorkspace = false,
    instanceStatus = failInstance ? 503 : 200,
    workspaceStatus = failWorkspace ? 404 : 200,
    requireApiKey = true,
    delayMs = 0,
  } = options;

  return async (input: string, init?: RequestInit) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const headers = init?.headers as Record<string, string> | undefined;
    const apiKey = headers?.["X-Api-Key"];

    if (requireApiKey && !apiKey) {
      return new Response(
        JSON.stringify({ error_code: "INVALID_TOKEN", message: "Missing API key" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    if (input.includes("/api/instances/")) {
      if (instanceStatus >= 400) {
        return new Response(
          JSON.stringify({
            error_code: "VENDOR_UNAVAILABLE",
            message: "Plane instance unavailable",
          }),
          { status: instanceStatus, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({
          instance: { id: "inst-001", version: instanceVersion, is_setup_done: true },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (input.includes("/api/v1/workspaces/")) {
      if (workspaceStatus >= 400) {
        return new Response(
          JSON.stringify({
            error_code: "WORKSPACE_NOT_FOUND",
            message: "Workspace not found",
          }),
          { status: workspaceStatus, headers: { "Content-Type": "application/json" } },
        );
      }

      const slugMatch = input.match(/\/api\/workspaces\/([^/]+)\//);
      const slug = slugMatch?.[1] ?? "unknown";

      return new Response(
        JSON.stringify({
          id: workspaceId,
          name: workspaceName,
          slug,
          url: `https://plane.example.com/${slug}`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ detail: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  };
}

export const DEFAULT_TEST_PLANE_CONFIG = normalizePlaneConfiguration({
  baseUrl: "https://plane.example.com",
  apiBaseUrl: "https://plane.example.com",
  apiTokenRef: "plane/api-token",
  workspaceSlug: "apzhub",
});

export const TEST_CORRELATION_ID = "corr-plane-test-001";
export const TEST_TENANT_ID = "tenant-plane-test";
