import { test, expect } from "@playwright/test";

const DEV_EMAIL = "dev@apzhub.local";
const DEV_PASSWORD = "DevPassword123!";

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEV_EMAIL);
  await page.getByLabel("Password").fill(DEV_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/workspace\/home/);
}

test.describe("SPR-003 workbench context and selection", () => {
  test("navigation updates persisted workbench context after sidebar selection", async ({
    page,
  }) => {
    await signIn(page);

    await page.getByRole("button", { name: "Overview" }).click();
    await expect(page).toHaveURL(/\/workspace\/home\/overview/);

    await expect
      .poll(async () =>
        page.evaluate(() => {
          const key = Object.keys(localStorage).find((entry) =>
            entry.startsWith("apzhub:workbench:session:"),
          );
          if (!key) {
            return null;
          }

          const raw = localStorage.getItem(key);
          if (!raw) {
            return null;
          }

          const session = JSON.parse(raw) as {
            focusedViewId?: string;
            activeWorkspace?: string;
          };

          return session.focusedViewId ?? null;
        }),
      )
      .toBe("platform-home-overview");

    const activeWorkspace = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((entry) =>
        entry.startsWith("apzhub:workbench:session:"),
      );
      if (!key) {
        return null;
      }

      const raw = localStorage.getItem(key);
      if (!raw) {
        return null;
      }

      return (JSON.parse(raw) as { activeWorkspace?: string }).activeWorkspace ?? null;
    });

    expect(activeWorkspace).toBe("home");
  });
});
