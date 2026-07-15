/** Documents workspace route helpers tests (APZDOCS-005). */
import { describe, expect, it } from "vitest";

import {
  DOCUMENTS_BASE,
  documentsSectionPath,
  isDocumentsRoute,
  resolveDocumentsSection,
} from "./routes";

describe("documents routes", () => {
  it("detects documents workspace paths", () => {
    expect(isDocumentsRoute(DOCUMENTS_BASE)).toBe(true);
    expect(isDocumentsRoute(`${DOCUMENTS_BASE}/versions`)).toBe(true);
    expect(isDocumentsRoute("/workspace/reporting")).toBe(false);
  });

  it("resolves sections with overview default", () => {
    expect(resolveDocumentsSection(DOCUMENTS_BASE)).toBe("overview");
    expect(resolveDocumentsSection(`${DOCUMENTS_BASE}/tags`)).toBe("tags");
    expect(resolveDocumentsSection(`${DOCUMENTS_BASE}/unknown`)).toBe("overview");
    expect(documentsSectionPath("audit")).toBe(`${DOCUMENTS_BASE}/audit`);
    expect(documentsSectionPath()).toBe(`${DOCUMENTS_BASE}/overview`);
  });
});
