import { describe, expect, it } from "vitest";

import { targetProductFromHref } from "./learning-telemetry";

describe("targetProductFromHref", () => {
  it("maps workspace paths to owning products", () => {
    expect(targetProductFromHref("/workspace/support/requests/1")).toBe("support");
    expect(targetProductFromHref("/workspace/workflow/tasks/1")).toBe("workflow");
    expect(targetProductFromHref("/workspace/documents/doc_1")).toBe("documents");
    expect(targetProductFromHref("/workspace/law")).toBe("law");
    expect(targetProductFromHref("/workspace/knowledge")).toBe("knowledge");
    expect(targetProductFromHref("/workspace/projects/p1")).toBe("projects");
  });
});
