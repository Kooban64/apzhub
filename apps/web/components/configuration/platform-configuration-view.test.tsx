"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockConfigurationClient,
  MOCK_CONFIGURATION,
} from "@/lib/configuration/mock-configuration-client";
import {
  resetConfigurationClient,
  setConfigurationClient,
} from "@/lib/configuration/configuration-api";

import { ConfigurationWorkspaceRouter } from "./configuration-workspace-router";
import { PlatformConfigurationView } from "./platform-configuration-view";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/configuration/overview",
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformConfigurationView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    resetConfigurationClient();
    setConfigurationClient(createMockConfigurationClient());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => undefined) },
    });
  });

  it("renders overview with unavailable capability banners", async () => {
    render(wrap(<PlatformConfigurationView section="overview" />));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Overview" }),
      ).toBeTruthy();
      expect(screen.getByTestId("card-configurations-count")).toBeTruthy();
    });

    expect(screen.getByTestId("card-runtime-status").textContent).toContain(
      "RUNTIME RESOLUTION NOT AVAILABLE",
    );
    expect(screen.getByTestId("card-flags-status").textContent).toContain(
      "FEATURE FLAGS NOT AVAILABLE",
    );
    expect(screen.getByTestId("card-secrets-status").textContent).toContain(
      "SECRET MANAGEMENT NOT AVAILABLE",
    );
    expect(screen.getByTestId("card-hot-reload-status").textContent).toContain(
      "HOT RELOAD NOT AVAILABLE",
    );
    expect(
      screen.getByRole("toolbar", { name: /Configuration commands/i }),
    ).toBeTruthy();
  });

  it("lists configurations and copies ID", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformConfigurationView section="configurations" />));

    await waitFor(() => {
      expect(screen.getByText(MOCK_CONFIGURATION.id)).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /Copy ID/i }));
    await waitFor(() => {
      expect(screen.getByTestId("configuration-status").textContent).toMatch(
        /Copied configuration ID/i,
      );
    });
    expect(screen.getByTestId("value-hidden-notice").textContent).toMatch(
      /VALUE HIDDEN/i,
    );
  });

  it("shows namespaces metadata", async () => {
    render(wrap(<PlatformConfigurationView section="namespaces" />));

    await waitFor(() => {
      expect(screen.getByText("ns_mock")).toBeTruthy();
    });
  });

  it("shows groups metadata", async () => {
    render(wrap(<PlatformConfigurationView section="groups" />));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Groups" })).toBeTruthy();
    });
  });

  it("shows versions with immutable notice when applicable", async () => {
    render(wrap(<PlatformConfigurationView section="versions" />));

    await waitFor(() => {
      expect(screen.getByTestId("immutable-version-banner")).toBeTruthy();
    });
  });

  it("shows overrides metadata-only notice", async () => {
    render(wrap(<PlatformConfigurationView section="overrides" />));

    await waitFor(() => {
      expect(screen.getByTestId("override-metadata-notice").textContent).toContain(
        "EFFECTIVE VALUE IS NOT RESOLVED",
      );
    });
  });

  it("renders hierarchy list on scopes", async () => {
    render(wrap(<PlatformConfigurationView section="scopes" />));

    await waitFor(() => {
      expect(screen.getByTestId("hierarchy-list")).toBeTruthy();
    });
    expect(screen.getByText(/Governance visualisation only/i)).toBeTruthy();
  });

  it("runs metadata validation", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformConfigurationView section="validation" />));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Validate metadata/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Validate metadata/i }));
    await waitFor(() => {
      expect(screen.getByTestId("validation-result").textContent).toMatch(
        /Validation passed/i,
      );
    });
  });

  it("shows diagnostics unavailable capabilities", async () => {
    render(wrap(<PlatformConfigurationView section="diagnostics" />));

    await waitFor(() => {
      expect(screen.getByTestId("diag-runtime").textContent).toContain(
        "Unavailable",
      );
      expect(screen.getByTestId("diag-flags").textContent).toContain(
        "Unavailable",
      );
      expect(screen.getByTestId("diag-secrets").textContent).toContain(
        "Unavailable",
      );
      expect(screen.getByTestId("diag-event-bus").textContent).toContain(
        "Unavailable",
      );
    });
  });

  it("shows audit table", async () => {
    render(wrap(<PlatformConfigurationView section="audit" />));

    await waitFor(() => {
      expect(screen.getByTestId("configuration-audit-table")).toBeTruthy();
    });
  });

  it("approves configuration when canManage", async () => {
    const user = userEvent.setup();
    render(
      wrap(<PlatformConfigurationView section="configurations" canManage />),
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Approve$/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Approve$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("configuration-status").textContent).toMatch(
        /Completed: approve/i,
      );
    });
  });

  it("hides manage commands when canManage is false", async () => {
    render(
      wrap(
        <PlatformConfigurationView section="configurations" canManage={false} />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText(MOCK_CONFIGURATION.id)).toBeTruthy();
    });
    expect(screen.queryByRole("button", { name: /^Approve$/i })).toBeNull();
  });

  it("shows forbidden state when list fails with 403", async () => {
    setConfigurationClient({
      ...createMockConfigurationClient(),
      async listConfigurations() {
        const { ConfigurationClientError } = await import(
          "@/lib/configuration/configuration-errors"
        );
        throw new ConfigurationClientError({
          message: "Denied",
          status: 403,
          code: "FORBIDDEN",
        });
      },
    });

    render(wrap(<PlatformConfigurationView section="configurations" />));

    await waitFor(() => {
      expect(screen.getByTestId("configuration-forbidden")).toBeTruthy();
    });
  });

  it("router mounts overview from pathname", async () => {
    render(wrap(<ConfigurationWorkspaceRouter />));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Overview" }),
      ).toBeTruthy();
    });
  });

  it("opens API metadata panel", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformConfigurationView section="overview" />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Open API Metadata/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Open API Metadata/i }));
    await waitFor(() => {
      expect(screen.getByTestId("api-metadata-panel")).toBeTruthy();
    });
  });

  it("shows references when configuration selected", async () => {
    render(wrap(<PlatformConfigurationView section="references" />));

    await waitFor(() => {
      expect(screen.getByText("ref_mock")).toBeTruthy();
    });
  });

  it("shows empty versions prompt when list has no selection path", async () => {
    setConfigurationClient({
      ...createMockConfigurationClient(),
      async listConfigurations() {
        return { items: [], page: { limit: 0, hasMore: false } };
      },
    });
    render(wrap(<PlatformConfigurationView section="versions" />));
    await waitFor(() => {
      expect(screen.getByTestId("configuration-empty")).toBeTruthy();
    });
  });

  it("shows empty overrides prompt when no configuration selected", async () => {
    setConfigurationClient({
      ...createMockConfigurationClient(),
      async listConfigurations() {
        return { items: [], page: { limit: 0, hasMore: false } };
      },
    });
    render(wrap(<PlatformConfigurationView section="overrides" />));
    await waitFor(() => {
      expect(screen.getByTestId("override-metadata-notice")).toBeTruthy();
      expect(screen.getByTestId("configuration-empty")).toBeTruthy();
    });
  });

  it("publishes selected version from versions view", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformConfigurationView section="versions" canManage />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Publish Version/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Publish Version/i }));
    await waitFor(() => {
      expect(screen.getByTestId("configuration-status").textContent).toMatch(
        /Completed: publish-version/i,
      );
    });
  });

  it("selects configuration row via keyboard", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformConfigurationView section="configurations" />));
    await waitFor(() => {
      expect(screen.getByText(MOCK_CONFIGURATION.id)).toBeTruthy();
    });
    const row = screen.getByText(MOCK_CONFIGURATION.id).closest("tr");
    expect(row).toBeTruthy();
    row!.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.getByTestId("configuration-detail")).toBeTruthy();
    });
  });

  it("archives and restores via toolbar", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformConfigurationView section="configurations" />));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Archive$/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Archive$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("configuration-status").textContent).toMatch(
        /Completed: archive/i,
      );
    });
    await user.click(screen.getByRole("button", { name: /^Restore$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("configuration-status").textContent).toMatch(
        /Completed: restore/i,
      );
    });
  });

  it("publishes and deprecates via toolbar", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformConfigurationView section="configurations" />));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Publish$/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Publish$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("configuration-status").textContent).toMatch(
        /Completed: publish/i,
      );
    });
    await user.click(screen.getByRole("button", { name: /^Deprecate$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("configuration-status").textContent).toMatch(
        /Completed: deprecate/i,
      );
    });
  });

  it("validates and transitions configuration", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformConfigurationView section="configurations" />));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Validate$/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /^Validate$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("configuration-status").textContent).toMatch(
        /Completed: validate/i,
      );
    });
    await user.click(screen.getByRole("button", { name: /^Transition$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("configuration-status").textContent).toMatch(
        /Completed: transition/i,
      );
    });
  });

  it("does not expose forbidden runtime commands", () => {
    render(wrap(<PlatformConfigurationView section="configurations" />));
    expect(screen.queryByRole("button", { name: /Resolve/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Apply/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Reveal Secret/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Evaluate Flag/i })).toBeNull();
  });
});
