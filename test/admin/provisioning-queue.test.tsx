import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "@/components/providers/app-providers";
import { AdminInspectorProvider } from "@/features/admin/admin-inspector-context";
import { AdminProvisioningQueuePage } from "@/features/admin/access/admin-provisioning-queue-page";
import { AdminInspectorPanel } from "@/features/admin/admin-inspector-panel";
import { getMockAccessData } from "@/lib/admin/mock-access-data";
import { getMockAdminHomeData } from "@/lib/admin/mock-admin-home-data";
import { getProvisioningJobsSnapshot, resetProvisioningMockStore } from "@/lib/admin/provisioning/mock-provisioning-store";
import { stubAdminStep13Apis } from "@/test/helpers/stub-admin-step13-apis";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/admin/provisioning",
  useSearchParams: () => new URLSearchParams(),
}));

describe("AdminProvisioningQueuePage", () => {
  beforeEach(() => {
    stubAdminStep13Apis();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lists jobs and opens inspector without illegal primary actions", async () => {
    resetProvisioningMockStore();
    const user = userEvent.setup();
    const home = getMockAdminHomeData();
    const access = getMockAccessData();

    render(
      <AppProviders>
        <AdminInspectorProvider>
          <AdminProvisioningQueuePage />
          <div data-testid="inspector-sink">
            <AdminInspectorPanel
              homeData={home}
              accessData={access}
              provisioningJobs={getProvisioningJobsSnapshot()}
            />
          </div>
        </AdminInspectorProvider>
      </AppProviders>,
    );

    expect(await screen.findByTestId("admin-provisioning-page")).toBeInTheDocument();
    expect(screen.getByTestId("admin-provisioning-job-row-job-cal-fail")).toBeInTheDocument();

    await user.click(screen.getByTestId("admin-provisioning-job-row-job-cal-2"));
    const retryRunning = screen.getByRole("button", { name: /Retry job/i });
    expect(retryRunning).toBeDisabled();

    await user.click(screen.getByTestId("admin-provisioning-job-row-job-cal-fail"));
    const retryFailed = screen.getByRole("button", { name: /Retry job/i });
    expect(retryFailed).not.toBeDisabled();
    const resolve = screen.getByRole("button", { name: /Mark resolved/i });
    expect(resolve).toBeDisabled();
  });
});
