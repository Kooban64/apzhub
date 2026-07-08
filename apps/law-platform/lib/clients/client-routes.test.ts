import { describe, expect, it } from "vitest";

import {
  clientCreateRoute,
  clientDetailRoute,
  clientEditRoute,
  clientListRoute,
  isClientModuleRoute,
  parseClientRoute,
} from "./client-routes";

describe("client routes", () => {
  it("detects client module routes", () => {
    expect(isClientModuleRoute("/workspace/law/clients")).toBe(true);
    expect(isClientModuleRoute("/workspace/law/clients/new")).toBe(true);
    expect(isClientModuleRoute("/workspace/law/matters")).toBe(false);
  });

  it("parses list, detail, create, and edit routes", () => {
    expect(parseClientRoute(clientListRoute())).toEqual({ kind: "list" });
    expect(parseClientRoute(clientCreateRoute())).toEqual({ kind: "create" });
    expect(parseClientRoute(clientDetailRoute("abc"))).toEqual({
      kind: "detail",
      clientId: "abc",
    });
    expect(parseClientRoute(clientEditRoute("abc"))).toEqual({
      kind: "edit",
      clientId: "abc",
    });
  });
});
