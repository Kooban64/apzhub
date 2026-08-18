import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { DocumentsWorkspaceRouter } from "./documents-workspace-router";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/documents/diagnostics",
}));

vi.mock("@/components/commercial/soft-product-gate", () => ({
  SoftProductGate: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("./platform-documents-view", () => ({
  PlatformDocumentsView: () => <div data-testid="documents-view">view</div>,
}));

describe("DocumentsWorkspaceRouter identity gates", () => {
  it("denies diagnostics without document.admin", () => {
    render(<DocumentsWorkspaceRouter permissions={["document.read"]} />);
    expect(screen.getByTestId("documents-permission-denied")).toBeTruthy();
    expect(screen.queryByTestId("documents-view")).toBeNull();
  });

  it("allows diagnostics with document.admin", () => {
    render(<DocumentsWorkspaceRouter permissions={["document.admin"]} />);
    expect(screen.getByTestId("documents-view")).toBeTruthy();
  });

  it("allows diagnostics with document.*", () => {
    render(<DocumentsWorkspaceRouter permissions={["document.*"]} />);
    expect(screen.getByTestId("documents-view")).toBeTruthy();
  });
});
