import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActionFrameworkDiagnostics } from "./action-framework-diagnostics";

describe("ActionFrameworkDiagnostics", () => {
  it("exposes hydration counts for developer diagnostics", () => {
    render(
      <ActionFrameworkDiagnostics
        userId="user-1"
        diagnostics={{
          registeredCount: 12,
          filteredCount: 10,
          platformActionCount: 8,
          capabilityActionCount: 4,
          platformActionIds: ["workbench.view.open"],
          capabilityActionIds: ["platform.theme.toggle"],
          manifestCapabilityCount: 2,
          manifestCapabilities: ["theme", "platform-home"],
          toolbarRegionCount: 1,
          toolbarItemCount: 1,
          registeredShortcutCount: 2,
        }}
      />,
    );

    const node = screen.getByTestId("action-framework-diagnostics");
    expect(node).toHaveAttribute("data-user-id", "user-1");
    expect(node).toHaveAttribute("data-registered-count", "12");
    expect(node).toHaveAttribute("data-filtered-count", "10");
    expect(node).toHaveAttribute("data-toolbar-item-count", "1");
    expect(node).toHaveAttribute("data-shortcut-count", "2");
  });
});
