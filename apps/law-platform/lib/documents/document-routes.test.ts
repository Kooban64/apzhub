import { describe, expect, it } from "vitest";

import {
  documentCreateRoute,
  documentDetailRoute,
  documentEditRoute,
  documentListRoute,
  parseDocumentRoute,
} from "./document-routes";

describe("document routes", () => {
  it("parses list, detail, create, and edit routes", () => {
    expect(parseDocumentRoute(documentListRoute())).toEqual({ kind: "list" });
    expect(parseDocumentRoute(documentCreateRoute())).toEqual({ kind: "create" });
    expect(parseDocumentRoute(documentDetailRoute("d1"))).toEqual({
      kind: "detail",
      documentId: "d1",
    });
    expect(parseDocumentRoute(documentEditRoute("d1"))).toEqual({
      kind: "edit",
      documentId: "d1",
    });
  });
});
