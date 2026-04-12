import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "@/components/providers/app-providers";
import { AdminInspectorPanel } from "@/features/admin/admin-inspector-panel";
import { AdminInspectorProvider } from "@/features/admin/admin-inspector-context";
import { AdminUsersPage } from "@/features/admin/access/admin-users-page";
import { getMockAccessData } from "@/lib/admin/mock-access-data";
import { getMockAdminHomeData } from "@/lib/admin/mock-admin-home-data";
import { getProvisioningJobsSnapshot } from "@/lib/admin/provisioning/mock-provisioning-store";
import { stubAdminStep13Apis } from "@/test/helpers/stub-admin-step13-apis";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/admin/users",
  useSearchParams: () => new URLSearchParams(),
}));

function Harness() {
  const home = getMockAdminHomeData();
  const access = getMockAccessData();
  return (
    <AppProviders>
      <AdminInspectorProvider>
        <AdminUsersPage />
        <div data-testid="inspector-sink">
          <AdminInspectorPanel homeData={home} accessData={access} provisioningJobs={getProvisioningJobsSnapshot()} />
        </div>
      </AdminInspectorProvider>
    </AppProviders>
  );
}

describe("AdminUsersPage + inspector", () => {
  beforeEach(() => {
    stubAdminStep13Apis();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("filters by role and opens user access in inspector", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(await screen.findByTestId("admin-users-page")).toBeInTheDocument();

    await user.selectOptions(screen.getByTestId("admin-users-role-filter"), "user");
    expect(screen.queryByTestId("admin-user-row-u-1001")).not.toBeInTheDocument();
    expect(screen.getByTestId("admin-user-row-u-1002")).toBeInTheDocument();

    await user.click(screen.getByTestId("admin-user-row-u-1002"));
    expect(screen.getByTestId("inspector-sink")).toHaveTextContent(/Jordan Lee/i);
    expect(screen.getByTestId("inspector-sink")).toHaveTextContent(/Standard employee/i);
    expect(screen.getByTestId("inspector-sink")).toHaveTextContent(/Failed/i);
    expect(screen.getByTestId("inspector-sink")).toHaveTextContent(/job=job-cal-fail/);
    expect(screen.getByTestId("admin-inspector-launch-row-mail")).toHaveTextContent(/Ready/i);
    expect(screen.getByTestId("admin-inspector-launch-row-calendar")).toHaveTextContent(/Blocked/i);
    expect(screen.getByTestId("admin-inspector-launch-row-calendar")).toHaveTextContent(/do not have a role/i);
  });
});
