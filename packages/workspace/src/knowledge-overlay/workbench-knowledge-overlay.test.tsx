import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";

import { CommandRegistryProvider } from "@apzhub/command-framework/react";
import type { KnowledgeQueryClient } from "@apzhub/knowledge-discovery-framework";
import { KnowledgeDiscoveryProvider } from "@apzhub/knowledge-discovery-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { KnowledgeOverlayExperience } from "./knowledge-overlay-experience";

const actionDto = {
  actions: [
    {
      id: "platform.theme.toggle",
      label: "Toggle Theme",
      handler: "service:theme-service:toggle",
      handlerKind: "service" as const,
      source: "manifest" as const,
    },
  ],
  toolbar: [],
};

const knowledgeDto = {
  schemaVersion: 1 as const,
  frameworkVersion: "0.5.0",
  sources: [
    {
      id: "platform.actions",
      label: "Actions",
      kind: "registry-projection" as const,
      tier: "T0" as const,
      priority: 10,
      status: "active" as const,
      provides: ["command" as const],
      origin: "builtin" as const,
    },
    {
      id: "platform.navigation",
      label: "Navigation",
      kind: "registry-projection" as const,
      tier: "T0" as const,
      priority: 20,
      status: "active" as const,
      provides: ["navigation" as const],
      origin: "builtin" as const,
    },
  ],
};

function createQueryClient(impl: KnowledgeQueryClient["query"]): KnowledgeQueryClient {
  return { query: impl };
}

function TestProviders({
  queryClient,
  children,
}: {
  readonly queryClient: KnowledgeQueryClient;
  readonly children: ReactNode;
}) {
  return (
    <ThemeProvider>
      <CommandRegistryProvider dto={actionDto}>
        <KnowledgeDiscoveryProvider dto={knowledgeDto} queryClient={queryClient}>
          {children}
        </KnowledgeDiscoveryProvider>
      </CommandRegistryProvider>
    </ThemeProvider>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("KnowledgeOverlayExperience", () => {
  it("queries and renders grouped documents via useKnowledgeQuery", async () => {
    const user = userEvent.setup();
    const queryClient = createQueryClient(
      vi.fn().mockResolvedValue({
        documents: [
          {
            documentId: "platform.actions:theme",
            sourceId: "platform.actions",
            kind: "command" as const,
            title: "Toggle Theme",
            actionRef: { actionId: "platform.theme.toggle" },
          },
          {
            documentId: "platform.navigation:home",
            sourceId: "platform.navigation",
            kind: "navigation" as const,
            title: "Home",
            navigation: { type: "workbench-route" as const, target: "/home" },
          },
        ],
        diagnostics: {
          queryText: "theme",
          durationMs: 1,
          sourceCount: 2,
          queriedSourceCount: 2,
          skippedSourceCount: 0,
          skippedSourceIds: [],
          providerSuccessCount: 2,
          providerErrorCount: 0,
          providerEmptyCount: 0,
          providerNotImplementedCount: 0,
          mergedDocumentCount: 2,
          deduplicatedDocumentCount: 2,
          returnedDocumentCount: 2,
        },
        providerResults: [],
      }),
    );

    render(
      <TestProviders queryClient={queryClient}>
        <KnowledgeOverlayExperience
          open
          selectionHandlers={{ onSelectAction: vi.fn(), onSelectNavigation: vi.fn() }}
        />
      </TestProviders>,
    );

    const input = screen.getByRole("searchbox", { name: "Discover" });
    await user.type(input, "theme");

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Toggle Theme/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText("Actions").length).toBeGreaterThan(0);
    expect(queryClient.query).toHaveBeenCalled();
  });

  it("delegates action selection through injected handlers", async () => {
    const user = userEvent.setup();
    const onSelectAction = vi.fn();
    const onSelectNavigation = vi.fn();
    const queryClient = createQueryClient(
      vi.fn().mockResolvedValue({
        documents: [
          {
            documentId: "platform.actions:theme",
            sourceId: "platform.actions",
            kind: "command" as const,
            title: "Toggle Theme",
            actionRef: { actionId: "platform.theme.toggle" },
          },
        ],
        diagnostics: {
          queryText: "theme",
          durationMs: 1,
          sourceCount: 1,
          queriedSourceCount: 1,
          skippedSourceCount: 0,
          skippedSourceIds: [],
          providerSuccessCount: 1,
          providerErrorCount: 0,
          providerEmptyCount: 0,
          providerNotImplementedCount: 0,
          mergedDocumentCount: 1,
          deduplicatedDocumentCount: 1,
          returnedDocumentCount: 1,
        },
        providerResults: [],
      }),
    );

    render(
      <TestProviders queryClient={queryClient}>
        <KnowledgeOverlayExperience
          open
          selectionHandlers={{ onSelectAction, onSelectNavigation }}
        />
      </TestProviders>,
    );

    await user.type(screen.getByRole("searchbox", { name: "Discover" }), "theme");

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Toggle Theme/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("option", { name: /Toggle Theme/i }));

    expect(onSelectAction).toHaveBeenCalledWith(
      "platform.theme.toggle",
      expect.objectContaining({ documentId: "platform.actions:theme" }),
    );
    expect(onSelectNavigation).not.toHaveBeenCalled();
  });

  it("shows error state when query fails", async () => {
    const user = userEvent.setup();
    const queryClient = createQueryClient(
      vi.fn().mockRejectedValue(new Error("Provider unavailable")),
    );

    render(
      <TestProviders queryClient={queryClient}>
        <KnowledgeOverlayExperience
          open
          selectionHandlers={{ onSelectAction: vi.fn(), onSelectNavigation: vi.fn() }}
        />
      </TestProviders>,
    );

    await user.type(screen.getByRole("searchbox", { name: "Discover" }), "theme");

    await waitFor(() => {
      expect(screen.getByTestId("knowledge-overlay-error")).toBeInTheDocument();
    });
  });
});
