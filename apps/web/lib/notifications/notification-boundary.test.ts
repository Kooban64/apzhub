/**
 * Notification Workbench boundary (APZNOTIFY-004).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("APZNOTIFY-004 notification workbench boundary", () => {
  it("components and lib stay on typed client only", () => {
    const view = readFileSync(
      join(
        process.cwd(),
        "apps/web/components/notifications/platform-notifications-view.tsx",
      ),
      "utf8",
    );
    expect(view).toContain("@/lib/notifications/notification-api");
    expect(view).toContain("DELIVERY PROVIDERS NOT AVAILABLE");
    expect(view).not.toMatch(/@apzhub\/platform-services/);
    expect(view).not.toMatch(/@apzhub\/notification-core/);
    expect(view).not.toMatch(/@apzhub\/notification-persistence/);
    expect(view).not.toMatch(/getPlatformServiceGateway/);
    expect(view).not.toMatch(/\bfetch\s*\(/);
    expect(view).not.toMatch(/\bsendNotification\b|\bdeliver\b/);

    const page = readFileSync(
      join(process.cwd(), "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(page).toContain("NotificationsWorkspaceRouter");
    expect(page).toContain("isNotificationsRoute");
  });
});
