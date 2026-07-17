"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockWorkflowClient,
  MOCK_WORKFLOW,
  MOCK_WORKFLOW_TEMPLATE,
  MOCK_WORKFLOW_VERSION,
} from "@/lib/workflows/mock-workflow-client";
import {
  resetWorkflowClient,
  setWorkflowClient,
} from "@/lib/workflows/workflow-api";

import { DefinitionGraph } from "./definition-graph";
import { DefinitionViewer } from "./definition-viewer";
import { PlatformWorkflowsView } from "./platform-workflows-view";
import { VersionCompare, compareWorkflowVersions } from "./version-compare";
import { AuditTimeline } from "./audit-timeline";
import { WorkflowsWorkspaceRouter } from "./workflows-workspace-router";
import {
  buildWorkflowExportPayload,
  exportWorkflowAsJson,
  exportWorkflowAsMarkdown,
  exportWorkflowAsYaml,
} from "./workflow-export";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/workflows/overview",
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformWorkflowsView", () => {
  beforeEach(() => {
    resetWorkflowClient();
    setWorkflowClient(createMockWorkflowClient());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => undefined) },
    });
  });

  it("renders overview with execution unavailable and toolbar", async () => {
    render(wrap(<PlatformWorkflowsView section="overview" />));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Overview" }),
      ).toBeTruthy();
      expect(screen.getByText(MOCK_WORKFLOW.name)).toBeTruthy();
    });

    expect(screen.getByTestId("card-execution-status").textContent).toContain(
      "Workflow Execution Not Available",
    );
    expect(
      screen.getByRole("toolbar", { name: /Workflows commands/i }),
    ).toBeTruthy();
    expect(screen.getByTestId("workflows-page")).toBeTruthy();
  });

  it("filters workflows via HTTP query param", async () => {
    render(wrap(<PlatformWorkflowsView section="workflows" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_WORKFLOW.name)).toBeTruthy();
    });

    fireEvent.change(screen.getByPlaceholderText(/Filter via HTTP query/i), {
      target: { value: "zzz-no-match" },
    });
    await waitFor(() => {
      expect(screen.getByText(/No workflows found/i)).toBeTruthy();
    });
  });

  it("copies selected workflow ID", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformWorkflowsView section="workflows" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_WORKFLOW.name)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Copy ID/i }));
    await waitFor(() => {
      expect(screen.getByText(/Copied workflow ID/i)).toBeTruthy();
    });
  });

  it("hides publish when canPublish is false", async () => {
    render(wrap(<PlatformWorkflowsView section="workflows" canPublish={false} />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_WORKFLOW.name)).toBeTruthy();
    });
    expect(screen.queryByTestId("workflows-publish")).toBeNull();
    expect(screen.getByRole("button", { name: /^Archive$/i })).toBeTruthy();
  });

  it("renders versions compare, definition viewer, and graph", async () => {
    render(wrap(<PlatformWorkflowsView section="versions" />));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Versions" }),
      ).toBeTruthy();
      expect(screen.getByText(MOCK_WORKFLOW.name)).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByTestId("definition-viewer")).toBeTruthy();
      expect(screen.getByTestId("definition-graph")).toBeTruthy();
    });
  });

  it("renders templates, categories, folders, diagnostics, validation, audit", async () => {
    const { rerender } = render(
      wrap(<PlatformWorkflowsView section="templates" />),
    );
    await waitFor(() => {
      expect(screen.getByText(MOCK_WORKFLOW_TEMPLATE.name)).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowsView section="categories" />));
    await waitFor(() => {
      expect(screen.getByText("General")).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowsView section="folders" />));
    await waitFor(() => {
      expect(screen.getByText("Root")).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowsView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("diagnostics-execution-status")).toBeTruthy();
      expect(screen.getByText(/metadataCrud/i)).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowsView section="validation" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflows-validation-panel")).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowsView section="audit" />));
    await waitFor(() => {
      expect(screen.getByTestId("audit-timeline")).toBeTruthy();
      expect(screen.getByText(/workflow\.created/i)).toBeTruthy();
    });
  });

  it("runs publish lifecycle and export JSON", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    render(wrap(<PlatformWorkflowsView section="workflows" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_WORKFLOW.name)).toBeTruthy();
    });

    await user.click(screen.getByTestId("workflows-publish"));
    await waitFor(() => {
      expect(screen.getByText(/Lifecycle publish completed/i)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Export JSON/i }));
    await waitFor(() => {
      expect(screen.getByText(/Exported JSON metadata/i)).toBeTruthy();
    });
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it("shows dependency panel on workflows detail", async () => {
    render(wrap(<PlatformWorkflowsView section="workflows" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflows-dependency-panel")).toBeTruthy();
      expect(screen.getByText(/wfc_mock_1/)).toBeTruthy();
    });
  });
});

describe("Definition Viewer / Graph / Compare / Audit helpers", () => {
  it("renders definition viewer sections", () => {
    render(<DefinitionViewer definition={MOCK_WORKFLOW_VERSION} />);
    expect(screen.getByTestId("definition-viewer")).toBeTruthy();
    expect(screen.getAllByText("Manual start").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Send notice").length).toBeGreaterThan(0);
  });

  it("renders empty definition viewer", () => {
    render(<DefinitionViewer definition={null} />);
    expect(screen.getByTestId("definition-viewer-empty")).toBeTruthy();
  });

  it("renders definition graph nodes", () => {
    render(<DefinitionGraph graph={MOCK_WORKFLOW_VERSION.graph} />);
    expect(screen.getByTestId("definition-graph-svg")).toBeTruthy();
    expect(screen.getByTestId("graph-node-node_trigger")).toBeTruthy();
  });

  it("renders empty definition graph", () => {
    render(<DefinitionGraph graph={{ nodes: [], connections: [] }} />);
    expect(screen.getByTestId("definition-graph-empty")).toBeTruthy();
  });

  it("compares versions for added nodes", () => {
    const left = MOCK_WORKFLOW_VERSION;
    const right = {
      ...MOCK_WORKFLOW_VERSION,
      id: "wfv_mock_2",
      versionNumber: 2,
      graph: {
        nodes: [
          ...(MOCK_WORKFLOW_VERSION.graph?.nodes ?? []),
          {
            id: "node_new",
            nodeKind: "action",
            kind: "log",
            label: "Log",
          },
        ],
        connections: MOCK_WORKFLOW_VERSION.graph?.connections ?? [],
      },
      parameters: [
        ...(MOCK_WORKFLOW_VERSION.parameters ?? []),
        { id: "param_2", key: "channel", valueType: "string" },
      ],
    };
    const diff = compareWorkflowVersions(left, right);
    expect(diff.addedNodes).toContain("node_new");
    expect(diff.addedParameters).toContain("channel");

    render(<VersionCompare left={left} right={right} />);
    expect(screen.getByTestId("diff-added-node_new")).toBeTruthy();
  });

  it("renders empty version compare", () => {
    render(<VersionCompare left={null} right={null} />);
    expect(screen.getByTestId("version-compare-empty")).toBeTruthy();
  });

  it("renders audit timeline", () => {
    render(
      <AuditTimeline
        entries={[
          {
            id: "a1",
            workflowId: MOCK_WORKFLOW.id,
            action: "workflow.published",
            actorUserId: "user_1",
            createdAt: "2026-07-15T12:00:00.000Z",
          },
        ]}
      />,
    );
    expect(screen.getByTestId("audit-entry-a1")).toBeTruthy();
  });

  it("renders empty audit timeline", () => {
    render(<AuditTimeline entries={[]} />);
    expect(screen.getByTestId("audit-timeline-empty")).toBeTruthy();
  });

  it("exports metadata as json yaml markdown", () => {
    const payload = buildWorkflowExportPayload(
      MOCK_WORKFLOW,
      MOCK_WORKFLOW_VERSION,
    );
    expect(exportWorkflowAsJson(payload)).toContain(MOCK_WORKFLOW.id);
    expect(exportWorkflowAsYaml(payload)).toContain("workflow:");
    expect(exportWorkflowAsYaml(payload)).toContain("version:");
    expect(exportWorkflowAsMarkdown(payload)).toContain("# Workflow metadata");
    expect(exportWorkflowAsMarkdown(payload)).toContain("## Version");
  });

  it("exports without version", () => {
    const payload = buildWorkflowExportPayload(MOCK_WORKFLOW, null);
    expect(exportWorkflowAsYaml(payload)).not.toContain("version:");
    expect(exportWorkflowAsMarkdown(payload)).not.toContain("## Version");
  });
});
