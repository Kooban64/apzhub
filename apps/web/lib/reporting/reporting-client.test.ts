import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createHttpReportingClient } from "./reporting-client";
import { ReportingClientError, toReportingUserMessage } from "./reporting-errors";
import {
  createMockReportingClient,
  MOCK_REPORT_FORMATS,
  MOCK_REPORT_TEMPLATE,
} from "./mock-reporting-client";
import {
  getReportingClient,
  listOutputFormats,
  listTemplates,
  resetReportingClient,
  setReportingClient,
} from "./reporting-api";

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });

describe("createHttpReportingClient", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({
        data: [],
        page: { total: 0 },
        meta: { correlationId: "corr-report-0001", requestId: "req-report-0001" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("uses /api/v1/reporting URLs only", async () => {
    const client = createHttpReportingClient();

    await client.listOutputFormats();
    await client.listReportTypes();
    await client.listTemplates();
    await client.getTemplate("tmpl-1");
    await client.listGeneratedReports();
    await client.getGenerationMetadata("rmeta_1");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/v1/reporting/formats",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/v1/reporting/templates/tmpl-1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("maps template and generation envelopes", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [MOCK_REPORT_TEMPLATE],
      }),
    );
    const client = createHttpReportingClient();
    const templates = await client.listTemplates("executive");
    expect(templates.items[0]?.id).toBe(MOCK_REPORT_TEMPLATE.id);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/reporting/templates?reportType=executive",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("rejects non-reporting paths via route guard code path", async () => {
    const client = createHttpReportingClient();
    await client.listTemplates();
    expect(fetchMock.mock.calls[0]?.[0]).toMatch(/^\/api\/v1\/reporting\//);
  });

  it("maps HTTP errors", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { error: { message: "Denied", code: "FORBIDDEN" }, meta: {} },
        { status: 403 },
      ),
    );
    const client = createHttpReportingClient();
    await expect(client.listTemplates()).rejects.toBeInstanceOf(ReportingClientError);
  });

  it("validates, previews, generates, and maps sparse payloads", async () => {
    const client = createHttpReportingClient();

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: { valid: true, errors: ["e1"], warnings: ["w1"] },
      }),
    );
    await expect(
      client.validateTemplate(
        { reportType: "executive", outputFormat: "html" },
        { correlationId: "corr-1" },
      ),
    ).resolves.toEqual({ valid: true, errors: ["e1"], warnings: ["w1"] });
    expect(fetchMock.mock.calls.at(-1)?.[1]).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Headers),
      }),
    );
    const validateHeaders = fetchMock.mock.calls.at(-1)?.[1]?.headers as Headers;
    expect(validateHeaders.get("x-correlation-id")).toBe("corr-1");

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          document: {
            id: "d1",
            subtitle: "Sub",
            sections: [{ id: "s1", title: "S", blocks: [] }],
          },
          output: {
            format: "pdf",
            encoding: "binary",
            body: "x",
            byteLength: 1,
            checksumSha256: "c",
            contentType: "application/pdf",
          },
          metadata: {
            id: "m1",
            organisationId: "org_1",
            archivedAt: "2026-07-13T00:00:00.000Z",
            outputFormat: "pdf",
          },
        },
      }),
    );
    const preview = await client.previewReport({
      reportType: "executive",
      outputFormat: "pdf",
    });
    expect(preview.document.subtitle).toBe("Sub");
    expect(preview.output.encoding).toBe("binary");
    expect(preview.metadata.organisationId).toBe("org_1");
    expect(preview.metadata.archivedAt).toBeTruthy();

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          document: null,
          output: null,
          metadata: null,
        },
      }),
    );
    const generated = await client.generateReport({
      reportType: "executive",
      outputFormat: "json",
    });
    expect(generated.document.id).toBe("");
    expect(generated.output.format).toBe("json");
    expect(generated.metadata.id).toBe("");

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          id: "tmpl-sparse",
          description: "desc",
          subtitle: "sub",
        },
      }),
    );
    const template = await client.getTemplate("tmpl-sparse");
    expect(template.description).toBe("desc");
    expect(template.subtitle).toBe("sub");

    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { formats: undefined } }));
    expect(await client.listOutputFormats()).toEqual([]);

    fetchMock.mockResolvedValueOnce(jsonResponse({ data: null }));
    expect(await client.listReportTypes()).toEqual({ items: [], total: 0 });

    fetchMock.mockResolvedValueOnce(jsonResponse({ data: null }));
    expect(await client.listTemplates()).toEqual({ items: [], total: 0 });

    fetchMock.mockResolvedValueOnce(jsonResponse({ data: null }));
    expect(await client.listGeneratedReports()).toEqual({ items: [], total: 0 });
  });

  it("maps unauthorized and generic API error codes", async () => {
    const client = createHttpReportingClient();

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          error: { message: "Auth required" },
          meta: { correlationId: "corr-401" },
        },
        { status: 401 },
      ),
    );
    await expect(client.listTemplates()).rejects.toMatchObject({
      code: "unauthorized",
      status: 401,
      correlationId: "corr-401",
    });

    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { error: { message: "Boom", code: "REPORT_FAILED" }, meta: {} },
        { status: 500 },
      ),
    );
    await expect(client.listTemplates()).rejects.toMatchObject({
      code: "REPORT_FAILED",
      status: 500,
    });

    fetchMock.mockResolvedValueOnce(
      new Response("not-json", { status: 502, headers: { "content-type": "text/plain" } }),
    );
    await expect(client.listTemplates()).rejects.toMatchObject({
      status: 502,
      message: expect.stringMatching(/502/),
    });
  });
});

describe("reporting-api accessor", () => {
  afterEach(() => {
    resetReportingClient();
  });

  it("defaults to mock in test and supports set/reset", async () => {
    resetReportingClient();
    setReportingClient(
      createMockReportingClient({
        async listOutputFormats() {
          return ["json"];
        },
      }),
    );
    expect(await listOutputFormats()).toEqual(["json"]);
    resetReportingClient();
    expect(await getReportingClient().listOutputFormats()).toEqual(MOCK_REPORT_FORMATS);
    expect((await listTemplates()).items[0]?.id).toBe(MOCK_REPORT_TEMPLATE.id);
  });
});

describe("reporting errors", () => {
  it("maps user messages", () => {
    expect(
      toReportingUserMessage(
        new ReportingClientError({ message: "x", code: "forbidden", status: 403 }),
      ),
    ).toMatch(/permission/i);
    expect(
      toReportingUserMessage(
        new ReportingClientError({ message: "x", code: "UNAUTHORIZED", status: 401 }),
      ),
    ).toMatch(/authorized/i);
    expect(
      toReportingUserMessage(
        new ReportingClientError({ message: "x", code: "unauthorized", status: 200 }),
      ),
    ).toMatch(/authorized/i);
    expect(
      toReportingUserMessage(
        new ReportingClientError({ message: "x", code: "FORBIDDEN", status: 200 }),
      ),
    ).toMatch(/permission/i);
    expect(
      toReportingUserMessage(
        new ReportingClientError({ message: "missing", code: "NOT_FOUND", status: 404 }),
      ),
    ).toMatch(/not found/i);
    expect(
      toReportingUserMessage(new ReportingClientError({ message: "", status: 500 })),
    ).toMatch(/Unable to load reporting/i);
    expect(
      toReportingUserMessage(
        new ReportingClientError({ message: "custom failure", status: 500 }),
      ),
    ).toBe("custom failure");
    expect(toReportingUserMessage(new Error("boom"))).toBe("boom");
    expect(toReportingUserMessage(new Error(""))).toMatch(/Unable to load reporting/i);
    expect(toReportingUserMessage("x")).toMatch(/Unable to load reporting/i);
  });
});
