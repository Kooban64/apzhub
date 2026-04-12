import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "@/components/providers/app-providers";
import { stubAdminStep13Apis } from "@/test/helpers/stub-admin-step13-apis";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/admin",
  useSearchParams: () => new URLSearchParams(),
}));

import { AdminInspectorPanel } from "@/features/admin/admin-inspector-panel";
import { AdminInspectorProvider } from "@/features/admin/admin-inspector-context";
import { AdminHome } from "@/features/admin/admin-home";
import { getMockAccessData } from "@/lib/admin/mock-access-data";
import { getMockAdminHomeData } from "@/lib/admin/mock-admin-home-data";
import { getProvisioningJobsSnapshot } from "@/lib/admin/provisioning/mock-provisioning-store";

function AdminHomeTestHarness({
  data = getMockAdminHomeData(),
  access = getMockAccessData(),
}: {
  data?: ReturnType<typeof getMockAdminHomeData>;
  access?: ReturnType<typeof getMockAccessData>;
}) {
  return (
    <AppProviders>
      <AdminInspectorProvider>
        <AdminHome data={data} />
        <div data-testid="admin-inspector-mount" className="border-t p-2">
          <AdminInspectorPanel homeData={data} accessData={access} provisioningJobs={getProvisioningJobsSnapshot()} />
        </div>
      </AdminInspectorProvider>
    </AppProviders>
  );
}

describe("AdminHome", () => {
  beforeEach(() => {
    stubAdminStep13Apis();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders control-plane modules and wires inspector selection", async () => {
    const user = userEvent.setup();
    const data = getMockAdminHomeData();

    render(<AdminHomeTestHarness data={data} />);

    expect(await screen.findByTestId("admin-home-root")).toBeInTheDocument();
    expect(screen.getByTestId("admin-module-platform_health")).toBeInTheDocument();
    expect(screen.getByTestId("admin-module-action_required")).toBeInTheDocument();
    expect(screen.getByTestId("admin-module-provisioning_queue")).toBeInTheDocument();
    expect(screen.getByTestId("admin-module-quick_actions")).toBeInTheDocument();
    expect(screen.getByTestId("admin-module-audit_recent")).toBeInTheDocument();

    await user.click(screen.getByTestId("admin-alert-row-alert-1"));
    expect(screen.getByTestId("admin-inspector-mount")).toHaveTextContent(/Pending domain verification/i);
    expect(screen.getByTestId("admin-inspector-mount")).toHaveTextContent(/Open users/i);
  });
});
