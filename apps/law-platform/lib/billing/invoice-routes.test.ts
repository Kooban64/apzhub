import { describe, expect, it } from "vitest";

import {
  invoiceCreateRoute,
  invoiceDetailRoute,
  invoiceEditRoute,
  invoiceListRoute,
  invoicePreviewRoute,
  parseInvoiceRoute,
} from "./invoice-routes";

describe("invoice routes", () => {
  it("parses list, detail, create, edit, and preview routes", () => {
    expect(parseInvoiceRoute(invoiceListRoute())).toEqual({ kind: "list" });
    expect(parseInvoiceRoute(invoiceCreateRoute())).toEqual({ kind: "create" });
    expect(parseInvoiceRoute(invoiceDetailRoute("inv1"))).toEqual({
      kind: "detail",
      invoiceId: "inv1",
    });
    expect(parseInvoiceRoute(invoiceEditRoute("inv1"))).toEqual({
      kind: "edit",
      invoiceId: "inv1",
    });
    expect(parseInvoiceRoute(invoicePreviewRoute("inv1"))).toEqual({
      kind: "preview",
      invoiceId: "inv1",
    });
  });
});
