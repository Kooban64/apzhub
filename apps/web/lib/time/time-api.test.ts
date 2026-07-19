import { afterEach, describe, expect, it, vi } from "vitest";

import { TimeApiError } from "./errors";
import {
  createTimesheet,
  getTimeHealth,
  listTimesheets,
  searchTime,
  stopTimesheet,
} from "./time-api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mockFetch(data: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => ({
        data,
        meta: { requestId: "req_test", correlationId: "corr_test" },
      }),
    })),
  );
}

describe("time-api", () => {
  it("lists timesheets via /api/v1/time/timesheets", async () => {
    mockFetch([]);
    await listTimesheets({ page: 1, perPage: 20 });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/time/timesheets?page=1&perPage=20",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });

  it("creates a timesheet", async () => {
    mockFetch({
      id: "tts_1",
      tenantId: "tenant_1",
      userId: "user_1",
      status: "running",
      durationMinutes: 0,
      startedAt: "2026-07-19T00:00:00.000Z",
      tagIds: [],
      billable: true,
      createdAt: "2026-07-19T00:00:00.000Z",
      updatedAt: "2026-07-19T00:00:00.000Z",
    });
    const created = await createTimesheet({
      description: "Work",
      billable: true,
    });
    expect(created.id).toBe("tts_1");
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/time/timesheets",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ description: "Work", billable: true }),
      }),
    );
  });

  it("stops a timesheet", async () => {
    mockFetch({
      id: "tts_1",
      tenantId: "tenant_1",
      userId: "user_1",
      status: "stopped",
      durationMinutes: 15,
      startedAt: "2026-07-19T00:00:00.000Z",
      tagIds: [],
      billable: false,
      createdAt: "2026-07-19T00:00:00.000Z",
      updatedAt: "2026-07-19T00:15:00.000Z",
    });
    await stopTimesheet("tts_1");
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/time/timesheets/tts_1/stop",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("loads health and searches foundation time search", async () => {
    mockFetch({ status: "healthy" });
    const health = await getTimeHealth();
    expect(health.status).toBe("healthy");
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/time/health",
      expect.objectContaining({ method: "GET" }),
    );

    mockFetch([{ type: "customer", id: "tcust_1", label: "Acme" }]);
    const results = await searchTime("Acme", { limit: 10 });
    expect(results.items[0]?.label).toBe("Acme");
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/time/search?q=Acme&limit=10",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("maps HTTP failures to TimeApiError without leaking providers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => ({
          error: {
            code: "UNAVAILABLE",
            message: "Kimai upstream adapter unavailable",
          },
          meta: { correlationId: "corr_err" },
        }),
      })),
    );

    await expect(listTimesheets()).rejects.toBeInstanceOf(TimeApiError);
    try {
      await listTimesheets();
    } catch (error) {
      expect(error).toBeInstanceOf(TimeApiError);
      if (error instanceof TimeApiError) {
        expect(error.message.toLowerCase()).not.toContain("kimai");
        expect(error.code).toBe("UNAVAILABLE");
      }
    }
  });
});
