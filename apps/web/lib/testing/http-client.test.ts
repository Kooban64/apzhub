import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TestingClientError } from "./errors";
import { createHttpTestingClient } from "./http-client";

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });

describe("createHttpTestingClient", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({
        data: [],
        page: { total: 0 },
        meta: { correlationId: "corr-test-0001", requestId: "req-test-0001" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("uses /api/v1/testing URLs for list and detail calls", async () => {
    const client = createHttpTestingClient();

    await client.listPlans({
      search: "release",
      sort: "name",
      order: "asc",
      status: "draft",
    });
    await client.getPlan("plan/with space");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/v1/testing/plans?search=release&sort=name&order=asc&status=draft",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/v1/testing/plans/plan%2Fwith%20space",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("parses success envelopes into typed view models", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            id: "plan-1",
            name: "HTTP Plan",
            status: "ready",
            versionNumber: 3,
            suiteIds: ["suite-1", "suite-2"],
            updatedAt: "2026-07-10T00:00:00.000Z",
          },
        ],
        page: { total: 1 },
      }),
    );

    const result = await createHttpTestingClient().listPlans();

    expect(result.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      id: "plan-1",
      name: "HTTP Plan",
      status: "ready",
      version: "3",
      suiteCount: 2,
    });
  });

  it("throws TestingClientError for HTTP error envelopes", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          error: { code: "PERMISSION_DENIED", message: "Missing testing.plans.read" },
          meta: { correlationId: "corr-denied", requestId: "req-denied" },
        },
        { status: 403 },
      ),
    );

    await expect(createHttpTestingClient().listPlans()).rejects.toMatchObject({
      name: "TestingClientError",
      code: "PERMISSION_DENIED",
      status: 403,
      correlationId: "corr-denied",
      requestId: "req-denied",
    } satisfies Partial<TestingClientError>);
  });

  it("passes AbortSignal, correlation ID, and credentials include", async () => {
    const controller = new AbortController();

    await createHttpTestingClient().getDashboard({
      signal: controller.signal,
      correlationId: "corr-client-1",
    });

    const init = fetchMock.mock.calls[0]?.[1];
    expect(init).toMatchObject({
      method: "GET",
      signal: controller.signal,
      credentials: "include",
    });
    expect(init?.headers).toBeInstanceOf(Headers);
    expect((init?.headers as Headers).get("x-correlation-id")).toBe("corr-client-1");
    expect((init?.headers as Headers).get("Accept")).toBe("application/json");
  });

  it("sends JSON mutations with credentials include", async () => {
    await createHttpTestingClient().createPlan({ name: "Client Plan" });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("/api/v1/testing/plans");
    expect(init).toMatchObject({
      method: "POST",
      credentials: "include",
    });
    expect(typeof init?.body).toBe("string");
    expect((init?.headers as Headers).get("Content-Type")).toBe("application/json");
  });
});
