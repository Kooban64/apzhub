"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockWorkflowEngineClient,
  MOCK_ENGINE_TEMPLATE,
  MOCK_ENGINE_WORKFLOW,
} from "@/lib/workflows/mock-engine-client";
import {
  resetWorkflowEngineClient,
  setWorkflowEngineClient,
} from "@/lib/workflows/engine-api";
import { WorkflowEngineClientError } from "@/lib/workflows/engine-errors";

import { EngineDefinitionViewer } from "./engine-definition-viewer";
import { PlatformWorkflowEngineView } from "./platform-workflow-engine-view";
import { WorkflowEngineWorkspaceRouter } from "./workflow-engine-workspace-router";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/workflow-engine/overview",
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformWorkflowEngineView", () => {
  beforeEach(() => {
    resetWorkflowEngineClient();
    setWorkflowEngineClient(createMockWorkflowEngineClient());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => undefined) },
    });
  });

  it("renders overview with READ-ONLY ENGINE and command toolbar", async () => {
    render(wrap(<PlatformWorkflowEngineView section="overview" />));

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
      expect(screen.getByTestId("card-readonly-engine").textContent).toContain(
        "READ-ONLY ENGINE",
      );
    });

    expect(screen.getByTestId("card-total-workflows").textContent).toContain("1");
    expect(
      screen.getByRole("toolbar", { name: /Operator tools commands/i }),
    ).toBeTruthy();
    expect(screen.getByTestId("workflow-engine-page")).toBeTruthy();
  });

  it("renders workflows list, details, and definition viewer", async () => {
    render(wrap(<PlatformWorkflowEngineView section="workflows" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_ENGINE_WORKFLOW.name)).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-detail-panel")).toBeTruthy();
      expect(screen.getByTestId("engine-definition-viewer")).toBeTruthy();
    });
  });

  it("copies selected workflow ID", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformWorkflowEngineView section="workflows" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_ENGINE_WORKFLOW.name)).toBeTruthy();
    });

    await user.click(screen.getByTestId("workflow-engine-copy-id"));
    await waitFor(() => {
      expect(screen.getByText(/Copied workflow ID/i)).toBeTruthy();
    });
  });

  it("opens API metadata and validates connection", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformWorkflowEngineView section="workflows" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_ENGINE_WORKFLOW.name)).toBeTruthy();
    });

    await user.click(screen.getByTestId("workflow-engine-open-api-metadata"));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-api-metadata")).toBeTruthy();
    });

    await user.click(screen.getByTestId("workflow-engine-validate"));
    await waitFor(() => {
      expect(screen.getByText(/Connection validated/i)).toBeTruthy();
    });
  });

  it("hides Validate Connection when canValidateConnection is false", async () => {
    render(
      wrap(
        <PlatformWorkflowEngineView
          section="workflows"
          canValidateConnection={false}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByText(MOCK_ENGINE_WORKFLOW.name)).toBeTruthy();
    });
    expect(screen.queryByTestId("workflow-engine-validate")).toBeNull();
  });

  it("renders templates, projects, users, tags", async () => {
    const { rerender } = render(
      wrap(<PlatformWorkflowEngineView section="templates" />),
    );
    await waitFor(() => {
      expect(screen.getByText(MOCK_ENGINE_TEMPLATE.name)).toBeTruthy();
    });
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-template-detail")).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowEngineView section="projects" />));
    await waitFor(() => {
      expect(screen.getByText("Default")).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowEngineView section="users" />));
    await waitFor(() => {
      expect(screen.getByText("Ops User")).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowEngineView section="tags" />));
    await waitFor(() => {
      expect(screen.getByText("ops")).toBeTruthy();
    });
  });

  it("renders capabilities, health, diagnostics, compatibility", async () => {
    const { rerender } = render(
      wrap(<PlatformWorkflowEngineView section="capabilities" />),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-capabilities")).toBeTruthy();
      expect(screen.getByRole("heading", { name: /^Unsupported$/i })).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowEngineView section="health" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-health")).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowEngineView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-diagnostics")).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowEngineView section="compatibility" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-compatibility")).toBeTruthy();
    });
  });

  it("shows forbidden states when permission props deny section access", async () => {
    const { rerender } = render(
      wrap(
        <PlatformWorkflowEngineView
          section="capabilities"
          canViewCapabilities={false}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-forbidden")).toBeTruthy();
    });

    rerender(
      wrap(<PlatformWorkflowEngineView section="health" canViewHealth={false} />),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-forbidden")).toBeTruthy();
    });

    rerender(
      wrap(
        <PlatformWorkflowEngineView section="diagnostics" canViewDiagnostics={false} />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-forbidden")).toBeTruthy();
    });
  });

  it("shows error and forbidden from HTTP client failures", async () => {
    setWorkflowEngineClient(
      createMockWorkflowEngineClient({
        async listWorkflows() {
          throw new WorkflowEngineClientError({
            message: "denied",
            code: "FORBIDDEN",
            status: 403,
          });
        },
      }),
    );

    render(wrap(<PlatformWorkflowEngineView section="workflows" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-forbidden")).toBeTruthy();
    });
  });

  it("refreshes and views details via commands", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformWorkflowEngineView section="workflows" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_ENGINE_WORKFLOW.name)).toBeTruthy();
    });

    await user.click(screen.getByTestId("workflow-engine-refresh"));
    await waitFor(() => {
      expect(screen.getByText(/Refreshed/i)).toBeTruthy();
    });

    await user.click(screen.getByTestId("workflow-engine-view-details"));
    await waitFor(() => {
      expect(screen.getByText(/Viewing details for/i)).toBeTruthy();
    });
  });

  it("exposes accessible table rows via keyboard", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformWorkflowEngineView section="workflows" />));
    await waitFor(() => {
      expect(
        screen.getByTestId(`workflow-engine-row-${MOCK_ENGINE_WORKFLOW.id}`),
      ).toBeTruthy();
    });
    const row = screen.getByTestId(`workflow-engine-row-${MOCK_ENGINE_WORKFLOW.id}`);
    row.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-detail-panel")).toBeTruthy();
    });
  });

  it("shows empty workflows state", async () => {
    setWorkflowEngineClient(
      createMockWorkflowEngineClient({
        async listWorkflows() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
      }),
    );
    render(wrap(<PlatformWorkflowEngineView section="workflows" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-empty")).toBeTruthy();
    });
  });

  it("handles clipboard failure and close API metadata", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn(async () => {
          throw new Error("clipboard blocked");
        }),
      },
    });
    render(wrap(<PlatformWorkflowEngineView section="workflows" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_ENGINE_WORKFLOW.name)).toBeTruthy();
    });
    await user.click(screen.getByTestId("workflow-engine-copy-id"));
    await waitFor(() => {
      expect(screen.getByText(/clipboard blocked/i)).toBeTruthy();
    });
    await user.click(screen.getByTestId("workflow-engine-open-api-metadata"));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-api-metadata")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Close$/i }));
    await waitFor(() => {
      expect(screen.queryByTestId("workflow-engine-api-metadata")).toBeNull();
    });
  });

  it("surfaces validate failure and validation result not ok", async () => {
    const user = userEvent.setup();
    const validate = vi.fn(async () => ({
      ok: false as const,
      message: "Engine unreachable",
    }));
    setWorkflowEngineClient(
      createMockWorkflowEngineClient({
        validate,
      }),
    );
    render(wrap(<PlatformWorkflowEngineView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("card-readonly-engine")).toBeTruthy();
    });
    await user.click(screen.getByTestId("workflow-engine-validate"));
    await waitFor(() => {
      expect(validate).toHaveBeenCalled();
      expect(screen.getByTestId("workflow-engine-status").textContent).toMatch(
        /Engine unreachable/i,
      );
    });
  });

  it("surfaces validate thrown errors", async () => {
    const user = userEvent.setup();
    setWorkflowEngineClient(
      createMockWorkflowEngineClient({
        async validate() {
          throw new WorkflowEngineClientError({
            message: "validate failed",
            status: 503,
            code: "WORKFLOW_SERVICE_UNAVAILABLE",
          });
        },
      }),
    );
    render(wrap(<PlatformWorkflowEngineView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("card-readonly-engine")).toBeTruthy();
    });
    await user.click(screen.getByTestId("workflow-engine-validate"));
    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).toBeTruthy();
    });
  });

  it("shows empty catalogues and error panels for list queries", async () => {
    const user = userEvent.setup();
    setWorkflowEngineClient(
      createMockWorkflowEngineClient({
        async listTemplates() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
        async listProjects() {
          throw new WorkflowEngineClientError({
            message: "projects denied",
            code: "FORBIDDEN",
            status: 403,
          });
        },
        async listUsers() {
          throw new WorkflowEngineClientError({
            message: "users boom",
            status: 500,
          });
        },
        async listTags() {
          throw new WorkflowEngineClientError({
            message: "tags boom",
            status: 500,
          });
        },
      }),
    );

    const { rerender } = render(
      wrap(<PlatformWorkflowEngineView section="templates" />),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-empty")).toBeTruthy();
    });

    rerender(wrap(<PlatformWorkflowEngineView section="projects" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-forbidden")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Retry$/i }));

    rerender(wrap(<PlatformWorkflowEngineView section="users" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Retry$/i }));

    rerender(wrap(<PlatformWorkflowEngineView section="tags" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Retry$/i }));
  });

  it("shows section query errors for capabilities health diagnostics compatibility", async () => {
    const user = userEvent.setup();
    setWorkflowEngineClient(
      createMockWorkflowEngineClient({
        async capabilities() {
          throw new WorkflowEngineClientError({
            message: "caps fail",
            status: 500,
          });
        },
        async health() {
          throw new WorkflowEngineClientError({
            message: "health fail",
            status: 500,
          });
        },
        async diagnostics() {
          throw new WorkflowEngineClientError({
            message: "diag fail",
            code: "FORBIDDEN",
            status: 403,
          });
        },
        async compatibility() {
          throw new WorkflowEngineClientError({
            message: "compat fail",
            status: 500,
          });
        },
      }),
    );

    const { rerender } = render(
      wrap(<PlatformWorkflowEngineView section="capabilities" />),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Retry$/i }));

    rerender(wrap(<PlatformWorkflowEngineView section="health" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Retry$/i }));

    rerender(wrap(<PlatformWorkflowEngineView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-forbidden")).toBeTruthy();
    });
    // Forbidden diagnostics panel intentionally has no Retry when message-only;
    // diagnostics error with forbidden still renders Retry via ErrorState.
    await user.click(screen.getByRole("button", { name: /^Retry$/i }));

    rerender(wrap(<PlatformWorkflowEngineView section="compatibility" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Retry$/i }));
  });

  it("hides capability-gated overview cards and forbids compatibility", async () => {
    render(
      wrap(
        <PlatformWorkflowEngineView
          section="overview"
          canViewCapabilities={false}
          canViewHealth={false}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByTestId("card-platform-health").textContent).toContain(
        "hidden",
      );
      expect(screen.getByTestId("card-compatibility").textContent).toContain("hidden");
    });

    const { rerender } = render(
      wrap(
        <PlatformWorkflowEngineView
          section="compatibility"
          canViewCapabilities={false}
        />,
      ),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-forbidden")).toBeTruthy();
    });
    rerender(
      wrap(<PlatformWorkflowEngineView section="compatibility" canViewCapabilities />),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-compatibility")).toBeTruthy();
    });
  });

  it("retries workflows after error", async () => {
    const user = userEvent.setup();
    let calls = 0;
    setWorkflowEngineClient(
      createMockWorkflowEngineClient({
        async listWorkflows() {
          calls += 1;
          if (calls === 1) {
            throw new WorkflowEngineClientError({
              message: "temporary",
              status: 500,
            });
          }
          return {
            items: [MOCK_ENGINE_WORKFLOW],
            page: { limit: 1, hasMore: false },
          };
        },
      }),
    );

    render(wrap(<PlatformWorkflowEngineView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Retry$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("card-readonly-engine")).toBeTruthy();
    });
  });

  it("selects template and workflow rows via click", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformWorkflowEngineView section="templates" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_ENGINE_TEMPLATE.name)).toBeTruthy();
    });
    await user.click(
      screen.getByTestId(`workflow-engine-row-${MOCK_ENGINE_TEMPLATE.id}`),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-template-detail")).toBeTruthy();
    });
  });

  it("shows loading states for deferred section queries", async () => {
    let resolveCaps: (value: unknown) => void = () => undefined;
    let resolveHealth: (value: unknown) => void = () => undefined;
    let resolveDiag: (value: unknown) => void = () => undefined;
    let resolveCompat: (value: unknown) => void = () => undefined;

    setWorkflowEngineClient(
      createMockWorkflowEngineClient({
        async capabilities() {
          return new Promise((resolve) => {
            resolveCaps = resolve as (value: unknown) => void;
          }) as never;
        },
        async health() {
          return new Promise((resolve) => {
            resolveHealth = resolve as (value: unknown) => void;
          }) as never;
        },
        async diagnostics() {
          return new Promise((resolve) => {
            resolveDiag = resolve as (value: unknown) => void;
          }) as never;
        },
        async compatibility() {
          return new Promise((resolve) => {
            resolveCompat = resolve as (value: unknown) => void;
          }) as never;
        },
      }),
    );

    const { rerender } = render(
      wrap(<PlatformWorkflowEngineView section="capabilities" />),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-loading")).toBeTruthy();
    });
    resolveCaps({
      services: [],
      unsupportedOperations: [],
    });

    rerender(wrap(<PlatformWorkflowEngineView section="health" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-loading")).toBeTruthy();
    });
    resolveHealth({ level: "healthy", reasons: [], sdkStatus: "healthy" });

    rerender(wrap(<PlatformWorkflowEngineView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-loading")).toBeTruthy();
    });
    resolveDiag({
      adapterVersion: "0.1.0",
      healthLevel: "healthy",
      reasons: [],
      apiStatus: "reachable",
      authenticationStatus: "valid",
      authMode: "api_key",
      coreServiceCount: 1,
      compatibilityStatus: "compatible",
    });

    rerender(wrap(<PlatformWorkflowEngineView section="compatibility" />));
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-loading")).toBeTruthy();
    });
    resolveCompat({
      compatibilityStatus: "compatible",
      supportedApi: "v1",
      adapterVersion: "0.1.0",
      unsupportedOperations: [],
      notes: [],
    });
  });

  it("selects workflow row with Space and retries catalogue errors", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformWorkflowEngineView section="workflows" />));
    await waitFor(() => {
      expect(
        screen.getByTestId(`workflow-engine-row-${MOCK_ENGINE_WORKFLOW.id}`),
      ).toBeTruthy();
    });
    const row = screen.getByTestId(`workflow-engine-row-${MOCK_ENGINE_WORKFLOW.id}`);
    row.focus();
    await user.keyboard(" ");
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-detail-panel")).toBeTruthy();
    });

    setWorkflowEngineClient(
      createMockWorkflowEngineClient({
        async listTemplates() {
          throw new WorkflowEngineClientError({
            message: "templates fail",
            status: 500,
          });
        },
      }),
    );
    const { rerender } = render(
      wrap(<PlatformWorkflowEngineView section="templates" />),
    );
    await waitFor(() => {
      expect(screen.getByTestId("workflow-engine-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Retry$/i }));
    rerender(wrap(<PlatformWorkflowEngineView section="overview" />));
  });

  it("uses clipboard fallback error when clipboard API is missing", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    render(wrap(<PlatformWorkflowEngineView section="workflows" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_ENGINE_WORKFLOW.name)).toBeTruthy();
    });
    await user.click(screen.getByTestId("workflow-engine-copy-id"));
    await waitFor(() => {
      expect(screen.getByText(/Clipboard is unavailable/i)).toBeTruthy();
    });
  });
});

describe("EngineDefinitionViewer", () => {
  it("renders metadata counts without designer language", () => {
    render(<EngineDefinitionViewer workflow={MOCK_ENGINE_WORKFLOW} />);
    expect(screen.getByTestId("engine-definition-viewer")).toBeTruthy();
    expect(
      screen.getByText(/Read-only engine — definition metadata only/i),
    ).toBeTruthy();
    expect(screen.getByText(/Node count:\s*2/i)).toBeTruthy();
    expect(screen.queryByText(/designer/i)).toBeNull();
  });

  it("renders empty tags and zero-node notes", () => {
    render(
      <EngineDefinitionViewer
        workflow={{
          ...MOCK_ENGINE_WORKFLOW,
          nodeCount: 0,
          connectionCount: 0,
          tagNames: [],
        }}
      />,
    );
    expect(screen.getAllByText(/^None$/).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/not returned by the read-only engine client/i).length,
    ).toBeGreaterThan(0);
  });
});

describe("WorkflowEngineWorkspaceRouter", () => {
  beforeEach(() => {
    resetWorkflowEngineClient();
    setWorkflowEngineClient(createMockWorkflowEngineClient());
  });

  it("resolves overview from pathname", async () => {
    render(wrap(<WorkflowEngineWorkspaceRouter permissions={["workflow.admin"]} />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
    });
  });

  it("denies default identity without operator grants", () => {
    render(wrap(<WorkflowEngineWorkspaceRouter permissions={["workflow.view"]} />));
    expect(screen.getByTestId("workflow-engine-permission-denied")).toBeTruthy();
  });
});
