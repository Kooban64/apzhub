import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import { describe, expect, it } from "vitest";

import { createPaperlessAdapter, disposePaperlessAdapter } from "./index";
import { createMockPaperlessFetch } from "./testing/mock-paperless-api";

const context: IntegrationRequestContext = {
  tenantId: "tenant_documents_test",
  correlationId: "corr_documents_test",
};

describe("@apzhub/integration-paperless adapter", () => {
  it("connects with token auth and lists documents", async () => {
    const { adapter, factory } = await createPaperlessAdapter({
      tenantId: context.tenantId,
      paperless: {
        baseUrl: "https://documents.example.test",
        apiBaseUrl: "https://documents.example.test/api",
      },
      apiToken: "test-token",
      adapterOptions: { fetchFn: createMockPaperlessFetch() },
    });
    expect((await adapter.connect(context)).ok).toBe(true);
    const page = await adapter.listDocuments(context, { pageSize: 10 });
    expect(page.count).toBe(1);
    expect(page.documents[0]?.title).toBe("Supplier agreement");
    expect(adapter.diagnosticsExtension).toMatchObject({
      apiStatus: "reachable",
      authenticationStatus: "valid",
    });
    const uploaded = await adapter.uploadDocument(context, {
      fileName: "note.txt",
      contentType: "text/plain",
      bytes: new TextEncoder().encode("hello dms"),
      title: "Upload demo",
    });
    expect(uploaded.taskId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    const got = await adapter.getDocument(context, 42);
    expect(got.title).toBe("Supplier agreement");
    const downloaded = await adapter.downloadDocument(context, 42);
    expect(downloaded.contentType).toContain("pdf");
    expect(downloaded.bytes.byteLength).toBeGreaterThan(0);
    await disposePaperlessAdapter(adapter, factory);
  });

  it("translates authentication failures without leaking credentials", async () => {
    const { adapter, factory } = await createPaperlessAdapter({
      tenantId: context.tenantId,
      paperless: { apiTokenRef: "paperless/api-token" },
      apiToken: "test-token",
      adapterOptions: { fetchFn: createMockPaperlessFetch({ failAuth: true }) },
    });
    await expect(adapter.connect(context)).rejects.toThrow(
      /Documents DMS engine authentication failed/i,
    );
    expect(JSON.stringify(adapter.diagnosticsExtension)).not.toContain("test-token");
    await disposePaperlessAdapter(adapter, factory);
  });
});
