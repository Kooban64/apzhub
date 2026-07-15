"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockSearchClient,
  MOCK_SEARCH_HIT,
} from "@/lib/search/mock-search-client";
import { SearchClientError } from "@/lib/search/search-errors";
import { resetSearchClient, setSearchClient } from "@/lib/search/search-api";
import type { SearchClient } from "@/lib/search/search-client";

import { PlatformSearchView } from "./platform-search-view";
import { SearchWorkspaceRouter } from "./search-workspace-router";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/search/overview",
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function failingClient(
  overrides: Partial<SearchClient> = {},
): SearchClient {
  const err = new SearchClientError({
    status: 403,
    code: "FORBIDDEN",
    message: "denied",
  });
  const reject = async () => {
    throw err;
  };
  return createMockSearchClient({
    getHealth: reject,
    getReadiness: reject,
    getStatistics: reject,
    executeQuery: reject,
    validateQuery: reject,
    listProviders: reject,
    listConfigurations: reject,
    listCollections: reject,
    listSources: reject,
    listScopes: reject,
    listProfiles: reject,
    listAudit: reject,
    getDiagnostics: reject,
    ...overrides,
  });
}

describe("PlatformSearchView", () => {
  beforeEach(() => {
    resetSearchClient();
    setSearchClient(createMockSearchClient());
  });

  it("renders overview health", async () => {
    render(wrap(<PlatformSearchView section="overview" />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
      expect(screen.getByTestId("search-health-status").textContent).toMatch(
        /available/i,
      );
    });
  });

  it("renders degraded readiness on overview", async () => {
    setSearchClient(
      createMockSearchClient({
        async getReadiness() {
          return {
            executionEnabled: true,
            providerBound: true,
            healthy: false,
            message: "degraded",
          };
        },
      }),
    );
    render(wrap(<PlatformSearchView section="overview" />));
    await waitFor(() => {
      expect(screen.getByText("Not ready")).toBeTruthy();
    });
  });

  it("renders overview error and retries", async () => {
    const user = userEvent.setup();
    let fail = true;
    setSearchClient(
      createMockSearchClient({
        async getHealth() {
          if (fail) {
            throw new SearchClientError({
              status: 401,
              code: "UNAUTHORIZED",
              message: "nope",
            });
          }
          return {
            status: "available",
            checkedAt: "2026-07-14T12:00:00.000Z",
          };
        },
      }),
    );
    render(wrap(<PlatformSearchView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("search-error")).toBeTruthy();
      expect(screen.getByText(/not authorized/i)).toBeTruthy();
    });
    fail = false;
    await user.click(screen.getByRole("button", { name: /Retry/i }));
    await waitFor(() => {
      expect(screen.getByTestId("search-health-status").textContent).toMatch(
        /available/i,
      );
    });
  });

  it("renders query hits and accepts keyword input", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformSearchView section="query" />));
    await waitFor(() => {
      expect(screen.getByTestId("search-row-hit_mock_1")).toBeTruthy();
    });
    const input = screen.getByTestId("search-keywords");
    await user.clear(input);
    await user.type(input, "policy");
    await user.click(screen.getByRole("button", { name: /^Search$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("search-row-hit_mock_1")).toBeTruthy();
      expect(screen.getByText(/Query validation: valid/i)).toBeTruthy();
    });
  });

  it("renders empty and error query states", async () => {
    const user = userEvent.setup();
    setSearchClient(
      createMockSearchClient({
        async executeQuery(input) {
          const q = input.query.keywords?.toLowerCase() ?? "";
          if (q === "fail") {
            throw new SearchClientError({
              status: 403,
              code: "FORBIDDEN",
              message: "denied",
            });
          }
          return {
            hits: q === "empty" ? [] : [MOCK_SEARCH_HIT],
            page: 1,
            pageSize: 20,
            hasMore: false,
            suggestions: [],
          };
        },
      }),
    );
    render(wrap(<PlatformSearchView section="query" />));
    await waitFor(() => {
      expect(screen.getByTestId("search-row-hit_mock_1")).toBeTruthy();
    });

    const input = screen.getByTestId("search-keywords");
    await user.clear(input);
    await user.type(input, "empty");
    await user.click(screen.getByRole("button", { name: /^Search$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("search-empty")).toBeTruthy();
      expect(screen.getByText(/No results/i)).toBeTruthy();
    });

    await user.clear(input);
    await user.type(input, "fail");
    await user.click(screen.getByRole("button", { name: /^Search$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("search-error")).toBeTruthy();
      expect(screen.getByText(/permission/i)).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));
  });

  it("renders providers diagnostics and audit sections", async () => {
    const { rerender } = render(wrap(<PlatformSearchView section="providers" />));
    await waitFor(() => {
      expect(screen.getByText("Mock Search Provider")).toBeTruthy();
    });

    rerender(wrap(<PlatformSearchView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("search-diagnostics")).toBeTruthy();
    });

    rerender(wrap(<PlatformSearchView section="audit" />));
    await waitFor(() => {
      expect(screen.getByText("search.query.execute")).toBeTruthy();
    });
  });

  it("renders management section tables", async () => {
    const expectations: Record<string, string> = {
      configurations: "Default",
      collections: "Documents",
      sources: "documents",
      scopes: "Tenant",
      profiles: "Default",
    };
    for (const [section, text] of Object.entries(expectations)) {
      const { unmount } = render(
        wrap(<PlatformSearchView section={section as never} />),
      );
      await waitFor(() => {
        expect(screen.getByText(text)).toBeTruthy();
        expect(screen.getByTestId("search-table")).toBeTruthy();
      });
      unmount();
    }
  });

  it("renders empty management sections", async () => {
    setSearchClient(
      createMockSearchClient({
        async listProviders() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
        async listConfigurations() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
        async listCollections() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
        async listSources() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
        async listScopes() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
        async listProfiles() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
        async listAudit() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
      }),
    );
    for (const [section, title] of [
      ["providers", "No providers"],
      ["configurations", "No configurations"],
      ["collections", "No collections"],
      ["sources", "No sources"],
      ["scopes", "No scopes"],
      ["profiles", "No profiles"],
      ["audit", "No audit events"],
    ] as const) {
      const { unmount } = render(wrap(<PlatformSearchView section={section} />));
      await waitFor(() => {
        expect(screen.getByTestId("search-empty")).toBeTruthy();
        expect(screen.getByText(title)).toBeTruthy();
      });
      unmount();
    }
  });

  it("renders error states for management and diagnostics", async () => {
    setSearchClient(failingClient());
    for (const section of [
      "providers",
      "configurations",
      "collections",
      "sources",
      "scopes",
      "profiles",
      "audit",
      "diagnostics",
    ] as const) {
      const { unmount } = render(wrap(<PlatformSearchView section={section} />));
      await waitFor(() => {
        expect(screen.getByTestId("search-error")).toBeTruthy();
      });
      unmount();
    }
  });

  it("retries providers after error", async () => {
    const user = userEvent.setup();
    let fail = true;
    setSearchClient(
      createMockSearchClient({
        async listProviders() {
          if (fail) {
            throw new SearchClientError({
              status: 403,
              code: "FORBIDDEN",
              message: "denied",
            });
          }
          return {
            items: [
              {
                id: "prov_mock_1",
                kind: "meilisearch",
                label: "Mock Search Provider",
                enabled: true,
                active: true,
              },
            ],
            page: { limit: 1, hasMore: false },
          };
        },
      }),
    );
    render(wrap(<PlatformSearchView section="providers" />));
    await waitFor(() => {
      expect(screen.getByTestId("search-error")).toBeTruthy();
    });
    fail = false;
    await user.click(screen.getByRole("button", { name: /Retry/i }));
    await waitFor(() => {
      expect(screen.getByText("Mock Search Provider")).toBeTruthy();
    });
  });

  it("defaults unknown section to overview", async () => {
    render(wrap(<PlatformSearchView section={"unknown" as never} />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
    });
  });

  it("router mounts overview", async () => {
    render(wrap(<SearchWorkspaceRouter />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
    });
  });
});
