import { describe, expect, it, vi } from "vitest";

vi.mock("../gateway/bootstrap", () => ({
  getPlatformServiceGateway: vi.fn(),
}));

vi.mock("@apzhub/platform-services", async () => {
  const actual = await vi.importActual<typeof import("@apzhub/platform-services")>(
    "@apzhub/platform-services",
  );
  return {
    ...actual,
    composeEnterpriseContextFromGateway: vi.fn(
      actual.composeEnterpriseContextFromGateway,
    ),
  };
});

import { composeEnterpriseContextFromGateway } from "@apzhub/platform-services";

import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { handleGetEnterpriseContext } from "./context";

const mockedGateway = vi.mocked(getPlatformServiceGateway);
const mockedCompose = vi.mocked(composeEnterpriseContextFromGateway);

function request(url: string) {
  return new Request(url) as unknown as import("next/server").NextRequest;
}

describe("handleGetEnterpriseContext", () => {
  it("requires focusId", async () => {
    const response = await handleGetEnterpriseContext(
      request("http://localhost/api/v1/context?focusType=project"),
      {
        serviceContext: {
          userId: "u1",
          tenantId: "t1",
          correlationId: "c1",
          requestId: "r1",
          permissions: [],
        },
        session: { user: { id: "u1" } },
        tracing: {
          requestId: "r1",
          correlationId: "c1",
          timestamp: "2026-08-06T12:00:00.000Z",
        },
      } as never,
    );

    expect(response.status).toBe(400);
  });

  it("composes project context via gateway slice", async () => {
    mockedGateway.mockResolvedValue({
      projects: {
        getProject: async () => ({
          id: "proj_1",
          name: "Delivery Alpha",
          identifier: "ALPHA",
        }),
      },
      support: undefined,
      workflow: undefined,
    } as never);

    mockedCompose.mockResolvedValue({
      focus: { type: "project", id: "proj_1" },
      composedAt: "2026-08-06T12:00:00.000Z",
      compositionOnly: true,
      ownsBusinessState: false,
      question: "What do I need to know before I continue?",
      slices: [],
      partial: false,
    });

    const response = await handleGetEnterpriseContext(
      request("http://localhost/api/v1/context?focusType=project&focusId=proj_1"),
      {
        serviceContext: {
          userId: "u1",
          tenantId: "t1",
          correlationId: "c1",
          requestId: "r1",
          permissions: [],
        },
        session: { user: { id: "u1" } },
        tracing: {
          requestId: "r1",
          correlationId: "c1",
          timestamp: "2026-08-06T12:00:00.000Z",
        },
      } as never,
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.compositionOnly).toBe(true);
    expect(body.data.ownsBusinessState).toBe(false);
    expect(mockedCompose).toHaveBeenCalled();
  });

  it("accepts workflow, support, and knowledge focus types", async () => {
    mockedGateway.mockResolvedValue({} as never);
    mockedCompose.mockResolvedValue({
      focus: { type: "workflow", id: "journey_1" },
      composedAt: "2026-08-06T12:00:00.000Z",
      compositionOnly: true,
      ownsBusinessState: false,
      question: "What do I need to know before I continue?",
      slices: [],
      partial: false,
    });

    for (const focusType of ["workflow", "support", "knowledge"] as const) {
      const response = await handleGetEnterpriseContext(
        request(
          `http://localhost/api/v1/context?focusType=${focusType}&focusId=focus_1`,
        ),
        {
          serviceContext: {
            userId: "u1",
            tenantId: "t1",
            correlationId: "c1",
            requestId: "r1",
            permissions: [],
          },
          session: { user: { id: "u1" } },
          tracing: {
            requestId: "r1",
            correlationId: "c1",
            timestamp: "2026-08-06T12:00:00.000Z",
          },
        } as never,
      );
      expect(response.status).toBe(200);
    }
  });
});
