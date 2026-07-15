/**
 * Document API accessor + mock coverage (APZDOCS-004).
 */
import { afterEach, describe, expect, it } from "vitest";

import {
  createHttpDocumentClient,
  createMockDocumentClient,
  getDocumentClient,
  resetDocumentClient,
  setDocumentClient,
} from "./document-api";
import { DocumentClientError, toDocumentUserMessage } from "./document-errors";

describe("document-api accessor", () => {
  afterEach(() => {
    resetDocumentClient();
  });

  it("get/set/reset document client", () => {
    const mock = createMockDocumentClient();
    setDocumentClient(mock);
    expect(getDocumentClient()).toBe(mock);
    resetDocumentClient();
    expect(getDocumentClient()).not.toBe(mock);
  });

  it("exports createHttpDocumentClient factory", () => {
    expect(typeof createHttpDocumentClient()).toBe("object");
  });
});

describe("DocumentClientError", () => {
  it("exposes code/status/correlation and user messages", () => {
    const err = new DocumentClientError({
      message: "denied",
      code: "FORBIDDEN",
      status: 403,
      correlationId: "c1",
    });
    expect(err.message).toBe("denied");
    expect(err.code).toBe("FORBIDDEN");
    expect(err.status).toBe(403);
    expect(err.correlationId).toBe("c1");
    expect(toDocumentUserMessage(err)).toContain("permission");
    expect(
      toDocumentUserMessage(
        new DocumentClientError({ message: "x", status: 401 }),
      ),
    ).toContain("authorized");
    expect(
      toDocumentUserMessage(
        new DocumentClientError({ message: "x", status: 404 }),
      ),
    ).toContain("not found");
    expect(
      toDocumentUserMessage(new DocumentClientError({ message: "custom" })),
    ).toBe("custom");
    expect(toDocumentUserMessage(new Error("plain"))).toBe("plain");
    expect(toDocumentUserMessage("nope")).toContain("Unable");
  });
});

describe("createMockDocumentClient", () => {
  it("covers archive/restore/tag/classify/relate/diagnostics paths", async () => {
    const client = createMockDocumentClient();
    const created = await client.createDocumentMetadata({
      title: "Spec",
      classification: "internal",
      documentType: "file",
    });
    await client.updateDocumentMetadata(created.id, { title: "Spec 2" });
    await client.archiveDocument(created.id);
    await client.restoreDocument(created.id);
    await client.assignFolder(created.id, "folder_1");
    await client.assignCollection(created.id, null);
    await client.applyRetention(created.id, null);
    await client.classify(created.id, { classification: "confidential" });
    await client.tag(created.id, { tagNames: ["a"] });
    await client.relate(created.id, { kind: "related_to", targetDocumentId: "doc_x" });
    await client.listVersions(created.id);
    await expect(client.getVersion(created.id, "missing")).rejects.toThrow();
    await client.getStorageMetadata(created.id, "ver_1");
    await client.listAudit(created.id);
    await client.listMetadata();
    const diagnostics = await client.getDiagnostics();
    expect(diagnostics.providerReady).toBe(true);
  });
});

describe("document-api facades", () => {
  afterEach(() => {
    resetDocumentClient();
  });

  it("delegates list/get/versions/audit/diagnostics through accessor", async () => {
    setDocumentClient(createMockDocumentClient());
    const {
      listDocuments,
      getDocument,
      listVersions,
      getVersion,
      getStorageMetadata,
      listAudit,
      getDiagnostics,
      listMetadata,
      createDocumentMetadata,
      updateDocumentMetadata,
      archiveDocument,
      restoreDocument,
      assignFolder,
      assignCollection,
      classifyDocument,
      tagDocument,
      relateDocument,
      applyRetention,
    } = await import("./document-api");

    const listed = await listDocuments();
    expect(listed.items.length).toBeGreaterThan(0);
    const doc = await getDocument(listed.items[0]!.documentId);
    expect(doc.title).toBeTruthy();
    await listVersions(doc.id);
    await getVersion(doc.id, "ver_mock_1");
    await getStorageMetadata(doc.id, "ver_mock_1");
    await listAudit(doc.id);
    await getDiagnostics();
    await listMetadata({ query: "Policy" });
    const created = await createDocumentMetadata({ title: "Facade" });
    await updateDocumentMetadata(created.id, { title: "Facade 2" });
    await archiveDocument(created.id);
    await restoreDocument(created.id);
    await assignFolder(created.id, "f1");
    await assignCollection(created.id, "c1");
    await classifyDocument(created.id, { classification: "internal" });
    await tagDocument(created.id, { tagNames: ["t"] });
    await relateDocument(created.id, { kind: "related_to" });
    await applyRetention(created.id, "r1");
  });
});
