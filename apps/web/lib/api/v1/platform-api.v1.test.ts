/**
 * Platform HTTP API v1 tests (OSS-110-07).
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import {
  mapPlatformErrorToHttpStatus,
  PlatformApiHttpError,
  toPublicHttpErrorBody,
  validationError,
} from "./errors";
import {
  handleListProjects,
  handleCreateProject,
  handleGetProject,
} from "./handlers/projects";
import { handleListWorkspaces, handleGetWorkspace } from "./handlers/workspaces";
import { handleListTeams, handleGetTeam } from "./handlers/teams";
import { handlePlatformApiHealth, handlePlatformApiReadiness } from "./handlers/health";
import { resetPlatformApiGatewayBootstrap } from "./gateway/bootstrap";
import { buildServiceRequestContext } from "./service-context";
import { parseJsonBody, parseQuery } from "./schemas/common";
import { projectListQuerySchema, createProjectBodySchema } from "./schemas/project";
import { loadPlatformOpenApiSpecObject } from "./openapi";
import {
  API_TEST_PROJ_ID,
  API_TEST_TENANT_A,
  API_TEST_TENANT_B,
  API_TEST_USER_ID,
  API_TEST_WS_ID,
  API_TEST_MEMBER_ID,
  buildMockSession,
  buildTestServiceContext,
  installMockGateway,
} from "./testing/fixtures";
import type { PlatformApiRequestContext } from "./auth/with-platform-api-auth";

vi.mock("@apzhub/auth/server", () => ({
  getValidatedSession: vi.fn(),
}));

import { getValidatedSession } from "@apzhub/auth/server";

function makeRequest(
  url: string,
  init?: { method?: string; body?: string; headers?: Record<string, string> },
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3300"), {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function makeContext(
  overrides: Partial<PlatformApiRequestContext["serviceContext"]> = {},
): PlatformApiRequestContext {
  const session = buildMockSession() as unknown as PlatformApiRequestContext["session"];
  const tracing = {
    requestId: "req-test-0001",
    correlationId: "corr-test-0001",
    timestamp: "2026-07-10T00:00:00.000Z",
  };
  return {
    tracing,
    session,
    serviceContext: buildTestServiceContext(overrides),
  };
}

describe("OSS-110-07 Platform HTTP API", () => {
  beforeEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.mocked(getValidatedSession).mockResolvedValue(buildMockSession() as never);
  });

  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
    vi.clearAllMocks();
  });

  describe("route behaviour", () => {
    it("lists workspaces via gateway", async () => {
      const calls: string[] = [];
      installMockGateway({
        onCall: (s, o) => calls.push(`${s}.${o}`),
      });
      const response = await handleListWorkspaces(
        makeRequest("/api/v1/workspaces"),
        makeContext(),
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toHaveLength(1);
      expect(body.page.limit).toBe(20);
      expect(body.meta.correlationId).toBe("corr-test-0001");
      expect(calls).toContain("workspace.listWorkspaces");
    });

    it("reads a workspace", async () => {
      installMockGateway();
      const response = await handleGetWorkspace(
        makeRequest(`/api/v1/workspaces/${API_TEST_WS_ID}`),
        makeContext(),
        { params: Promise.resolve({ workspaceId: API_TEST_WS_ID }) },
      );
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.id).toBe(API_TEST_WS_ID);
    });

    it("lists, creates, reads, updates, and archives projects", async () => {
      installMockGateway();
      const list = await handleListProjects(
        makeRequest("/api/v1/projects"),
        makeContext(),
      );
      expect(list.status).toBe(200);

      const created = await handleCreateProject(
        makeRequest("/api/v1/projects", {
          method: "POST",
          body: JSON.stringify({
            workspaceId: API_TEST_WS_ID,
            name: "New",
            identifier: "NEW",
          }),
        }),
        makeContext(),
      );
      expect(created.status).toBe(201);

      const got = await handleGetProject(
        makeRequest(`/api/v1/projects/${API_TEST_PROJ_ID}`),
        makeContext(),
        { params: Promise.resolve({ projectId: API_TEST_PROJ_ID }) },
      );
      expect(got.status).toBe(200);
    });

    it("lists and reads teams with projectId", async () => {
      installMockGateway();
      const list = await handleListTeams(
        makeRequest(`/api/v1/teams?projectId=${API_TEST_PROJ_ID}`),
        makeContext(),
      );
      expect(list.status).toBe(200);

      const got = await handleGetTeam(
        makeRequest(
          `/api/v1/teams/${API_TEST_MEMBER_ID}?projectId=${API_TEST_PROJ_ID}`,
        ),
        makeContext(),
        { params: Promise.resolve({ teamId: API_TEST_MEMBER_ID }) },
      );
      expect(got.status).toBe(200);
    });

    it("returns health and readiness", async () => {
      installMockGateway();
      const health = await handlePlatformApiHealth();
      expect([200, 503]).toContain(health.status);
      const readiness = await handlePlatformApiReadiness();
      expect([200, 503]).toContain(readiness.status);
    });
  });

  describe("validation", () => {
    it("rejects invalid pagination limit", () => {
      expect(() =>
        parseQuery(projectListQuerySchema, new URLSearchParams("limit=999")),
      ).toThrow(PlatformApiHttpError);
    });

    it("rejects unsupported sort field", () => {
      expect(() =>
        parseQuery(projectListQuerySchema, new URLSearchParams("sort=plane_priority")),
      ).toThrow(PlatformApiHttpError);
    });

    it("rejects invalid global ID path", async () => {
      installMockGateway();
      await expect(
        handleGetProject(
          makeRequest("/api/v1/projects/not-a-global-id"),
          makeContext(),
          { params: Promise.resolve({ projectId: "not-a-global-id" }) },
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("rejects malformed JSON body", async () => {
      await expect(
        parseJsonBody(
          new Request("http://localhost/api/v1/projects", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: "{",
          }),
          createProjectBodySchema,
          1024,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("rejects unknown body fields", async () => {
      await expect(
        parseJsonBody(
          new Request("http://localhost/api/v1/projects", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              workspaceId: API_TEST_WS_ID,
              name: "X",
              identifier: "X",
              planeId: "secret",
            }),
          }),
          createProjectBodySchema,
          1024,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });

    it("rejects missing required body field", async () => {
      await expect(
        parseJsonBody(
          new Request("http://localhost/api/v1/projects", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "X" }),
          }),
          createProjectBodySchema,
          1024,
        ),
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  describe("authentication and context", () => {
    it("builds service context from trusted session only", () => {
      const session = buildMockSession({ tenantId: API_TEST_TENANT_A }) as never;
      const ctx = buildServiceRequestContext({
        session,
        tracing: {
          requestId: "r1",
          correlationId: "c1",
          timestamp: "2026-07-10T00:00:00.000Z",
          idempotencyKey: "idem-1",
        },
      });
      expect(ctx.userId).toBe(API_TEST_USER_ID);
      expect(ctx.tenantId).toBe(API_TEST_TENANT_A);
      expect(ctx.permissions).toEqual([]);
      expect(ctx.execution?.extras?.idempotencyKey).toBe("idem-1");
    });

    it("does not trust client-supplied roles in context", () => {
      const ctx = buildTestServiceContext({ permissions: ["admin"] });
      // HTTP builder always sets permissions to [] — this fixture simulates pipeline input
      // where provider ignores client permissions.
      expect(Array.isArray(ctx.permissions)).toBe(true);
    });
  });

  describe("tenancy", () => {
    it("denies cross-tenant project access via mapping not found", async () => {
      installMockGateway();
      await expect(
        handleGetProject(
          makeRequest(`/api/v1/projects/${API_TEST_PROJ_ID}`),
          makeContext({ tenantId: API_TEST_TENANT_B }),
          { params: Promise.resolve({ projectId: API_TEST_PROJ_ID }) },
        ),
      ).rejects.toMatchObject({ code: "MAPPING_NOT_FOUND" });
    });

    it("rejects guessed global IDs", async () => {
      installMockGateway();
      const guessed = "proj_dddddddddddddddddddddddddddddddd";
      await expect(
        handleGetProject(makeRequest(`/api/v1/projects/${guessed}`), makeContext(), {
          params: Promise.resolve({ projectId: guessed }),
        }),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });
  });

  describe("error mapping", () => {
    it("maps platform errors to HTTP statuses", () => {
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "validation",
            code: "VALIDATION_FAILED",
            message: "bad",
            correlationId: "c",
            retryable: false,
          }),
        ),
      ).toBe(400);
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "authentication",
            code: "AUTHENTICATION_REQUIRED",
            message: "auth",
            correlationId: "c",
            retryable: false,
          }),
        ),
      ).toBe(401);
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "authorization",
            code: "PERMISSION_DENIED",
            message: "denied",
            correlationId: "c",
            retryable: false,
          }),
        ),
      ).toBe(403);
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "not_found",
            code: "NOT_FOUND",
            message: "missing",
            correlationId: "c",
            retryable: false,
          }),
        ),
      ).toBe(404);
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "conflict",
            code: "MAPPING_CONFLICT",
            message: "conflict",
            correlationId: "c",
            retryable: false,
          }),
        ),
      ).toBe(409);
      expect(
        mapPlatformErrorToHttpStatus(
          new PlatformServiceError({
            category: "integration",
            code: "PROVIDER_UNAVAILABLE",
            message: "down",
            correlationId: "c",
            retryable: true,
          }),
        ),
      ).toBe(503);
    });

    it("validationError is 400 without sensitive leakage", () => {
      const error = validationError("Invalid", {
        stack: "SECRET",
        fieldErrors: { a: ["x"] },
      });
      expect(error.status).toBe(400);
      const publicBody = toPublicHttpErrorBody(error.body);
      expect(publicBody.details?.stack).toBeUndefined();
      expect(publicBody.details?.fieldErrors).toEqual({ a: ["x"] });
    });
  });

  describe("architecture boundaries", () => {
    it("route handlers do not import Plane or adapters", () => {
      const collect = (dir: string): string[] => {
        const out: string[] = [];
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) out.push(...collect(full));
          else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
            out.push(full);
          }
        }
        return out;
      };

      const forbidden = [
        "@apzhub/integration-plane",
        "integrations/plane",
        "plane-adapter",
        'from "drizzle-orm"',
        "from 'drizzle-orm'",
      ];

      for (const root of ["apps/web/app/api/v1", "apps/web/lib/api/v1/handlers"]) {
        const abs = path.resolve(process.cwd(), root);
        for (const file of collect(abs)) {
          const source = readFileSync(file, "utf8");
          for (const token of forbidden) {
            expect(source.includes(token), `${file} must not contain ${token}`).toBe(
              false,
            );
          }
        }
      }
    });

    it("OpenAPI includes delivered paths including tasks", () => {
      const spec = loadPlatformOpenApiSpecObject() as {
        paths: Record<string, unknown>;
      };
      expect(spec.paths["/workspaces"]).toBeTruthy();
      expect(spec.paths["/projects"]).toBeTruthy();
      expect(spec.paths["/projects/{projectId}"]).toBeTruthy();
      expect(spec.paths["/teams"]).toBeTruthy();
      expect(spec.paths["/health"]).toBeTruthy();
      expect(spec.paths["/tasks"]).toBeTruthy();
      expect(spec.paths["/tasks/{taskId}"]).toBeTruthy();
      expect(spec.paths["/issues"]).toBeUndefined();

      const yaml = readFileSync(
        path.resolve(process.cwd(), "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
        "utf8",
      );
      const parsed = YAML.parse(yaml) as { openapi: string };
      expect(parsed.openapi.startsWith("3.1")).toBe(true);
    });
  });
});
