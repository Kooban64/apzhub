import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

vi.mock("@/lib/support/support-api", () => ({
  listSupportOrganizations: vi.fn(),
  getSupportOrganization: vi.fn(),
  createSupportOrganization: vi.fn(),
  updateSupportOrganization: vi.fn(),
  archiveSupportOrganization: vi.fn(),
}));

import { SupportApiError } from "@/lib/support/errors";
import {
  archiveSupportOrganization,
  createSupportOrganization,
  getSupportOrganization,
  listSupportOrganizations,
  updateSupportOrganization,
} from "@/lib/support/support-api";

import { SupportOrganizationsView } from "./support-organizations-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const org = {
  id: "sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  tenantId: "t1",
  name: "Acme",
  domain: "acme.test",
  note: "VIP",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("SupportOrganizationsView", () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(listSupportOrganizations).mockReset();
    vi.mocked(getSupportOrganization).mockReset();
    vi.mocked(createSupportOrganization).mockReset();
    vi.mocked(updateSupportOrganization).mockReset();
    vi.mocked(archiveSupportOrganization).mockReset();
  });

  it("lists organizations and navigates on row click", async () => {
    const user = userEvent.setup();
    vi.mocked(listSupportOrganizations).mockResolvedValue({
      data: [org],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(wrap(<SupportOrganizationsView permissions={["support.*"]} />));
    await waitFor(() => expect(screen.getByText("Acme")).toBeTruthy());
    await user.click(screen.getByText("Acme"));
    expect(push).toHaveBeenCalledWith(
      "/workspace/support/organizations/sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    );
  });

  it("creates an organization and navigates to detail", async () => {
    const user = userEvent.setup();
    vi.mocked(listSupportOrganizations).mockResolvedValue({
      data: [],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(createSupportOrganization).mockResolvedValue({
      data: org,
      meta: { requestId: "r2", correlationId: "c2" },
    });

    render(wrap(<SupportOrganizationsView permissions={["support.*"]} />));
    await waitFor(() => expect(screen.getByTestId("support-empty")).toBeTruthy());
    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0]!, "Acme");
    await user.type(inputs[1]!, "acme.test");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createSupportOrganization).toHaveBeenCalledWith({
        name: "Acme",
        domain: "acme.test",
        note: undefined,
      });
    });
    expect(push).toHaveBeenCalledWith(
      "/workspace/support/organizations/sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    );
  });

  it("hides create controls without permissions and shows forbidden list error", async () => {
    vi.mocked(listSupportOrganizations).mockRejectedValue(
      SupportApiError.fromHttp({
        status: 403,
        code: "FORBIDDEN",
        message: "zammad denied",
      }),
    );

    render(wrap(<SupportOrganizationsView permissions={[]} />));
    expect(screen.queryByRole("button", { name: "Create" })).toBeNull();
    await waitFor(() => expect(screen.getByTestId("support-error")).toBeTruthy());
    expect(screen.getByTestId("support-error").textContent?.toLowerCase()).not.toContain(
      "zammad",
    );
  });

  it("renders detail, updates, and archives with permissions", async () => {
    const user = userEvent.setup();
    vi.mocked(getSupportOrganization).mockResolvedValue({
      data: org,
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(updateSupportOrganization).mockResolvedValue({
      data: { ...org, name: "Acme Renamed" },
      meta: { requestId: "r2", correlationId: "c2" },
    });
    vi.mocked(archiveSupportOrganization).mockResolvedValue({
      data: { ...org, active: false },
      meta: { requestId: "r3", correlationId: "c3" },
    });

    render(
      wrap(
        <SupportOrganizationsView
          organizationId={org.id}
          permissions={["support.*"]}
        />,
      ),
    );

    await waitFor(() => expect(screen.getByTestId("support-organization-detail")).toBeTruthy());
    expect(screen.getByText("VIP")).toBeTruthy();

    const nameInput = screen.getByDisplayValue("Acme");
    fireEvent.change(nameInput, { target: { value: "Acme Renamed" } });
    await user.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() => {
      expect(updateSupportOrganization).toHaveBeenCalledWith(org.id, {
        name: "Acme Renamed",
      });
    });

    await user.click(screen.getByTestId("support-organization-archive"));
    await user.click(screen.getByTestId("support-confirm-dialog-confirm"));
    await waitFor(() => expect(archiveSupportOrganization).toHaveBeenCalledWith(org.id));
    expect(push).toHaveBeenCalledWith("/workspace/support/organizations");
  });

  it("hides update/archive without permissions and shows detail error", async () => {
    vi.mocked(getSupportOrganization).mockRejectedValue(
      SupportApiError.fromHttp({ status: 404, code: "NOT_FOUND" }),
    );

    render(
      wrap(
        <SupportOrganizationsView organizationId={org.id} permissions={[]} />,
      ),
    );
    await waitFor(() => expect(screen.getByTestId("support-error")).toBeTruthy());
  });
});
