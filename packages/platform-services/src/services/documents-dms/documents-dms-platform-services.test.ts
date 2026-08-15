import {
  createMockPaperlessFetch,
  createPaperlessAdapter,
  disposePaperlessAdapter,
} from "@apzhub/integration-paperless";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { describe, expect, it } from "vitest";

import { createDocumentsDmsPlatformServicesWithPaperless } from "./create-documents-dms-platform-services";

const context: ServiceRequestContext = {
  tenantId: "tenant_documents_dms_test",
  userId: "user_documents_dms_test",
  correlationId: "corr_documents_dms_test",
  permissions: ["documents.view"],
};

describe("Documents DMS Platform Services", () => {
  it("maps engine results to provider-neutral public shapes", async () => {
    const { adapter, factory } = await createPaperlessAdapter({
      tenantId: context.tenantId,
      paperless: {
        baseUrl: "https://documents.example.test",
        apiBaseUrl: "https://documents.example.test/api",
      },
      apiToken: "test-token",
      adapterOptions: { fetchFn: createMockPaperlessFetch() },
    });
    await adapter.connect(context);
    const gateway =
      createDocumentsDmsPlatformServicesWithPaperless(adapter).gatewaySurface;
    const health = await gateway.dms.getHealth(context);
    const documents = await gateway.dms.listDocuments(context);

    expect(health.providerStatuses[0]).toMatchObject({
      providerId: "documents-dms",
      message: "auth=valid; api=reachable",
    });
    expect(documents[0]?.id).toMatch(/^dmsdoc_[a-f0-9]{24}$/);
    expect(documents[0]?.id).not.toContain("42");
    const uploaded = await gateway.dms.uploadDocument(context, {
      fileName: "note.txt",
      contentType: "text/plain",
      bytes: new TextEncoder().encode("hello"),
      title: "Ops upload",
    });
    expect(uploaded).toMatchObject({
      status: "accepted",
      fileName: "note.txt",
      title: "Ops upload",
    });
    expect(uploaded.ingestId).toMatch(/^dmsingest_[a-f0-9]{24}$/);
    expect(JSON.stringify({ health, documents, uploaded })).not.toMatch(/paperless/i);
    await disposePaperlessAdapter(adapter, factory);
  });
});
