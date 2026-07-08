import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@apzhub/theme";

import { KnowledgeOverlay } from "./knowledge-overlay";
import type { KnowledgeOverlayGroup } from "./types";

const sampleGroups: readonly KnowledgeOverlayGroup[] = [
  {
    groupId: "platform.actions",
    heading: "Actions",
    providerLabel: "Actions",
    kind: "command",
    items: [
      {
        documentId: "platform.actions:theme",
        title: "Toggle Theme",
        description: "Switch light and dark mode",
        providerLabel: "Actions",
        kind: "command",
        document: {
          documentId: "platform.actions:theme",
          sourceId: "platform.actions",
          kind: "command",
          title: "Toggle Theme",
          actionRef: { actionId: "platform.theme.toggle" },
        },
      },
    ],
  },
  {
    groupId: "platform.navigation",
    heading: "Navigation",
    providerLabel: "Navigation",
    kind: "navigation",
    items: [
      {
        documentId: "platform.navigation:home",
        title: "Home",
        providerLabel: "Navigation",
        kind: "navigation",
        document: {
          documentId: "platform.navigation:home",
          sourceId: "platform.navigation",
          kind: "navigation",
          title: "Home",
          navigation: { type: "workbench-route", target: "/home" },
        },
      },
    ],
  },
];

function renderOverlay(
  overrides: Partial<ComponentProps<typeof KnowledgeOverlay>> = {},
) {
  const onSelectDocument = vi.fn();
  render(
    <ThemeProvider>
      <KnowledgeOverlay
        open
        onOpenChange={vi.fn()}
        query="theme"
        onQueryChange={vi.fn()}
        groups={sampleGroups}
        queryStatus="success"
        registryReady
        onSelectDocument={onSelectDocument}
        {...overrides}
      />
    </ThemeProvider>,
  );

  return { onSelectDocument };
}

describe("KnowledgeOverlay", () => {
  it("renders grouped results with headings and provider labels", () => {
    renderOverlay();

    expect(screen.getByTestId("knowledge-overlay")).toBeInTheDocument();
    expect(screen.getAllByTestId("knowledge-overlay-group")).toHaveLength(2);
    expect(screen.getAllByText("Actions").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Navigation").length).toBeGreaterThan(0);
    expect(screen.getByRole("option", { name: /Toggle Theme/i })).toBeInTheDocument();
  });

  it("shows loading state", () => {
    renderOverlay({ queryStatus: "loading", groups: [] });

    expect(screen.getByTestId("knowledge-overlay-loading")).toBeInTheDocument();
  });

  it("shows empty state", () => {
    renderOverlay({ queryStatus: "success", groups: [] });

    expect(screen.getByTestId("knowledge-overlay-empty")).toBeInTheDocument();
  });

  it("shows error state", () => {
    renderOverlay({
      queryStatus: "error",
      groups: [],
      errorMessage: "Query client unavailable",
    });

    expect(screen.getByTestId("knowledge-overlay-error")).toHaveTextContent(
      /Query client unavailable/,
    );
  });

  it("delegates selection without executing", async () => {
    const user = userEvent.setup();
    const { onSelectDocument } = renderOverlay();

    await user.click(screen.getByRole("option", { name: /Toggle Theme/i }));

    expect(onSelectDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        documentId: "platform.actions:theme",
        actionRef: { actionId: "platform.theme.toggle" },
      }),
    );
  });
});
