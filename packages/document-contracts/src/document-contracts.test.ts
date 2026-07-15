import { describe, expect, it } from "vitest";

import {
  asDocumentAttachmentId,
  asDocumentAuditId,
  asDocumentCategoryId,
  asDocumentCollectionId,
  asDocumentFolderId,
  asDocumentId,
  asDocumentLinkId,
  asDocumentMetadataId,
  asDocumentOwnerId,
  asDocumentRelationshipId,
  asDocumentRetentionId,
  asDocumentRevisionId,
  asDocumentTagId,
  asDocumentVersionId,
  DOCUMENT_CLASSIFICATIONS,
  DOCUMENT_CONTRACTS_VERSION,
  DOCUMENT_STATUSES,
  isPlatformIdShape,
  PLATFORM_DOCUMENT_PERMISSIONS,
  PLATFORM_DOCUMENT_PERMISSION_WILDCARD,
} from "./index";

describe("document-contracts", () => {
  it("exports stable version and permission catalogue", () => {
    expect(DOCUMENT_CONTRACTS_VERSION).toBe("0.3.0");
    expect(PLATFORM_DOCUMENT_PERMISSIONS).toContain("document.read");
    expect(PLATFORM_DOCUMENT_PERMISSIONS).toContain("document.write");
    expect(PLATFORM_DOCUMENT_PERMISSIONS).toContain("document.manage");
    expect(PLATFORM_DOCUMENT_PERMISSIONS).toContain("document.classify");
    expect(PLATFORM_DOCUMENT_PERMISSIONS).toContain("document.retention");
    expect(PLATFORM_DOCUMENT_PERMISSIONS).toContain("document.audit");
    expect(PLATFORM_DOCUMENT_PERMISSIONS).toContain("document.storage.write");
    expect(PLATFORM_DOCUMENT_PERMISSIONS).toContain("document.version.create");
    expect(PLATFORM_DOCUMENT_PERMISSION_WILDCARD).toBe("document.*");
  });

  it("validates branded identifiers and catalogues", () => {
    expect(isPlatformIdShape("doc_1")).toBe(true);
    expect(isPlatformIdShape("")).toBe(false);
    expect(asDocumentId("doc_abc")).toBe("doc_abc");
    expect(asDocumentVersionId("ver_1")).toBe("ver_1");
    expect(asDocumentRevisionId("rev_1")).toBe("rev_1");
    expect(asDocumentMetadataId("meta_1")).toBe("meta_1");
    expect(asDocumentCategoryId("cat_1")).toBe("cat_1");
    expect(asDocumentFolderId("fold_1")).toBe("fold_1");
    expect(asDocumentCollectionId("col_1")).toBe("col_1");
    expect(asDocumentRelationshipId("rel_1")).toBe("rel_1");
    expect(asDocumentRetentionId("ret_1")).toBe("ret_1");
    expect(asDocumentAuditId("aud_1")).toBe("aud_1");
    expect(asDocumentTagId("tag_1")).toBe("tag_1");
    expect(asDocumentLinkId("lnk_1")).toBe("lnk_1");
    expect(asDocumentAttachmentId("att_1")).toBe("att_1");
    expect(asDocumentOwnerId("own_1")).toBe("own_1");
    expect(() => asDocumentId("")).toThrow(/Invalid platform identifier/);
    expect(DOCUMENT_STATUSES).toContain("draft");
    expect(DOCUMENT_STATUSES).toContain("archived");
    expect(DOCUMENT_CLASSIFICATIONS).toContain("confidential");
    expect(DOCUMENT_CLASSIFICATIONS).toContain("generated_report");
  });
});
