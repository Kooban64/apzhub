import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";

import * as commandFramework from "@apzhub/command-framework";
import {
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  CommandRegistryProvider,
} from "@apzhub/command-framework/react";
import type { KnowledgeQueryClient } from "@apzhub/knowledge-discovery-framework";
import { KnowledgeDiscoveryProvider } from "@apzhub/knowledge-discovery-framework/react";
import { ThemeProvider } from "@apzhub/theme";

import { WorkbenchCommandPalette } from "./workbench-command-palette";
import { buildCommandPaletteDiagnostics } from "./command-palette-diagnostics";

const actionDto = {
  actions: [
    {
      id: "platform.theme.toggle",
      label: "Toggle Theme",
      handler: "service:theme-service:toggle",
      handlerKind: "service" as const,
      source: "manifest" as const,
      palette: true,
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

function KnowledgeProviders({
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

describe("WorkbenchCommandPalette knowledge mode", () => {
  it("renders grouped knowledge results without duplicating registry command rows", async () => {
    const user = userEvent.setup();
    const searchSpy = vi.spyOn(commandFramework, "searchActionDescriptors");
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
      <KnowledgeProviders queryClient={queryClient}>
        <WorkbenchCommandPalette
          open
          mode="knowledge"
          knowledgeSelectionHandlers={{
            onSelectAction: vi.fn(),
            onSelectNavigation: vi.fn(),
          }}
        />
      </KnowledgeProviders>,
    );

    await user.type(screen.getByRole("combobox", { name: "Filter commands" }), "theme");

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Toggle Theme/i })).toBeInTheDocument();
    });

    const groups = screen.getAllByTestId("command-palette-group");
    expect(groups.map((node) => node.getAttribute("data-group-label"))).toEqual([
      "Actions",
      "Navigation",
    ]);
    expect(searchSpy).not.toHaveBeenCalled();
    searchSpy.mockRestore();
  });

  it("delegates action selection without calling palette execute", async () => {
    const user = userEvent.setup();
    const onSelectAction = vi.fn();
    const onSelectNavigation = vi.fn();
    const execute = vi.fn();
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
      <KnowledgeProviders queryClient={queryClient}>
        <WorkbenchCommandPalette
          open
          mode="knowledge"
          knowledgeSelectionHandlers={{ onSelectAction, onSelectNavigation }}
        />
      </KnowledgeProviders>,
    );

    await user.type(screen.getByRole("combobox", { name: "Filter commands" }), "theme");

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Toggle Theme/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("option", { name: /Toggle Theme/i }));

    expect(onSelectAction).toHaveBeenCalledWith(
      "platform.theme.toggle",
      expect.objectContaining({ documentId: "platform.actions:theme" }),
    );
    expect(onSelectNavigation).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  it("delegates navigation selection", async () => {
    const user = userEvent.setup();
    const onSelectAction = vi.fn();
    const onSelectNavigation = vi.fn();
    const queryClient = createQueryClient(
      vi.fn().mockResolvedValue({
        documents: [
          {
            documentId: "platform.navigation:home",
            sourceId: "platform.navigation",
            kind: "navigation" as const,
            title: "Home",
            navigation: { type: "workbench-route" as const, target: "/home" },
          },
        ],
        diagnostics: {
          queryText: "home",
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
      <KnowledgeProviders queryClient={queryClient}>
        <WorkbenchCommandPalette
          open
          mode="knowledge"
          knowledgeSelectionHandlers={{ onSelectAction, onSelectNavigation }}
        />
      </KnowledgeProviders>,
    );

    await user.type(screen.getByRole("combobox", { name: "Filter commands" }), "home");

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Home/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("option", { name: /Home/i }));

    expect(onSelectNavigation).toHaveBeenCalledWith(
      { type: "workbench-route", target: "/home" },
      expect.objectContaining({ documentId: "platform.navigation:home" }),
    );
  });

  it("shows error empty state when query fails", async () => {
    const user = userEvent.setup();
    const queryClient = createQueryClient(
      vi.fn().mockRejectedValue(new Error("Provider unavailable")),
    );

    render(
      <KnowledgeProviders queryClient={queryClient}>
        <WorkbenchCommandPalette
          open
          mode="knowledge"
          knowledgeSelectionHandlers={{
            onSelectAction: vi.fn(),
            onSelectNavigation: vi.fn(),
          }}
        />
      </KnowledgeProviders>,
    );

    await user.type(screen.getByRole("combobox", { name: "Filter commands" }), "theme");

    await waitFor(() => {
      expect(screen.getByText("Knowledge query failed")).toBeInTheDocument();
    });
  });

  it("reports knowledge diagnostics", () => {
    const diagnostics = buildCommandPaletteDiagnostics({
      open: true,
      query: "theme",
      selectedIndex: 0,
      visibleCommandCount: 2,
      registryDiagnostics: {
        status: "hydrated",
        actionCount: 1,
        platformActionCount: 0,
        capabilityActionCount: 1,
        platformActionIds: [],
        capabilityActionIds: ["platform.theme.toggle"],
        toolbarRegionCount: 0,
        source: "server-dto",
        synchronisation: CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
      },
      executionCount: 0,
      mode: "knowledge",
      knowledgeQueryStatus: "success",
      knowledgeDocumentCount: 2,
      knowledgeGroupCount: 2,
    });

    expect(diagnostics.mode).toBe("knowledge");
    expect(diagnostics.knowledgeDocumentCount).toBe(2);
  });
});
