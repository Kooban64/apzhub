import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "@/components/providers/app-providers";
import { AdminInspectorProvider } from "@/features/admin/admin-inspector-context";
import { AdminMatrixPage } from "@/features/admin/access/admin-matrix-page";
import { stubAdminStep13Apis } from "@/test/helpers/stub-admin-step13-apis";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/admin/access",
  useSearchParams: () => new URLSearchParams(),
}));

describe("AdminMatrixPage", () => {
  beforeEach(() => {
    stubAdminStep13Apis();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("filters to users with overrides", async () => {
    const user = userEvent.setup();
    render(
      <AppProviders>
        <AdminInspectorProvider>
          <AdminMatrixPage />
        </AdminInspectorProvider>
      </AppProviders>,
    );

    expect(await screen.findByTestId("admin-matrix-page")).toBeInTheDocument();
    expect(screen.getByTestId("admin-matrix-cell-u-1001-mail")).toBeInTheDocument();
    expect(screen.getByTestId("admin-matrix-cell-u-1002-mail")).toBeInTheDocument();

    await user.click(screen.getByTestId("admin-matrix-filter-overrides"));
    expect(screen.queryByTestId("admin-matrix-cell-u-1002-mail")).not.toBeInTheDocument();
    expect(screen.getByTestId("admin-matrix-cell-u-1001-mail")).toBeInTheDocument();
  });
});
