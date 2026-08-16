import { describe, expect, it } from "vitest";

import { relatedProductWorkbenchPath } from "./analytics-decision-context";

describe("relatedProductWorkbenchPath", () => {
  it("maps APZ product labels to workbench routes", () => {
    expect(relatedProductWorkbenchPath("APZ Projects")).toBe("/workspace/projects");
    expect(relatedProductWorkbenchPath("APZ Support")).toBe("/workspace/support");
    expect(relatedProductWorkbenchPath("APZ Time")).toBe("/workspace/time");
    expect(relatedProductWorkbenchPath("APZ Workflow")).toBe("/workspace/workflow");
    expect(relatedProductWorkbenchPath("APZ Documents")).toBe("/workspace/documents");
    expect(relatedProductWorkbenchPath("Unknown")).toBeNull();
  });
});
