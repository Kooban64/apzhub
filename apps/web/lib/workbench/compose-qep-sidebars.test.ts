import { describe, expect, it } from "vitest";

import {
  composeQepContextSidebar,
  resolveQepSidebarHref,
} from "./compose-qep-sidebars";

describe("composeQepContextSidebar", () => {
  it("maps Overview, Applications, and Test Library to real QEP routes", () => {
    const items = composeQepContextSidebar("/workspace/qep");
    const byId = Object.fromEntries(items.map((i) => [i.id, i]));

    expect(byId["qep-overview"]?.label).toBe("Overview");
    expect(byId["qep-overview"]?.href).toBe("/workspace/qep/home");
    expect(byId["qep-applications"]?.label).toBe("Applications");
    expect(byId["qep-applications"]?.href).toBe("/workspace/qep/portfolio");
    expect(byId["qep-test-library"]?.label).toBe("Test Library");
    expect(byId["qep-test-library"]?.href).toBe("/workspace/qep/test-specifications");
  });

  it("omits Source link without hasSourceAccess", () => {
    const without = composeQepContextSidebar("/workspace/qep");
    expect(without.some((i) => i.id === "qep-source")).toBe(false);

    const withAccess = composeQepContextSidebar("/workspace/qep", {
      hasSourceAccess: true,
    });
    expect(withAccess.some((i) => i.id === "qep-source")).toBe(true);
    expect(withAccess.find((i) => i.id === "qep-source")?.href).toBe(
      "/workspace/source",
    );
  });
});

describe("resolveQepSidebarHref", () => {
  it("resolves Owner vocabulary ids to QEP routes", () => {
    expect(resolveQepSidebarHref("qep-overview")).toBe("/workspace/qep/home");
    expect(resolveQepSidebarHref("qep-applications")).toBe("/workspace/qep/portfolio");
    expect(resolveQepSidebarHref("qep-test-library")).toBe(
      "/workspace/qep/test-specifications",
    );
    expect(resolveQepSidebarHref("unknown")).toBeNull();
  });
});
