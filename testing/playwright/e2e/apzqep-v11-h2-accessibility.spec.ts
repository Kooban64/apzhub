import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { signInDevUser } from "./auth-helpers";
import { mockAllV11Surfaces, V11_PRIMARY_SURFACES } from "./apzqep-v11-api-mocks";

/**
 * QX-HD-04 / H2 — Accessibility (APZQEP V1.1 Hardening).
 * Acceptance: Zero Critical · Zero High (axe critical/serious).
 */

async function openQepSurface(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
}

async function assertMeaningfulTitle(page: Page) {
  await expect(page).toHaveTitle(/\S/, { timeout: 15_000 });
  const title = await page.title();
  expect(title.trim().length).toBeGreaterThan(0);
  expect(title).toMatch(/APZHUB/);
}

async function assertNoCriticalSerious(page: Page) {
  await assertMeaningfulTitle(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = results.violations.filter((v) =>
    ["critical", "serious"].includes(v.impact ?? ""),
  );
  expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([]);
}

async function assertScreenReaderBasics(page: Page, heading: string) {
  await expect(page.getByLabel("Activity bar")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  // Landmark / shell presence for SR navigation
  const main = page.locator("main");
  if ((await main.count()) > 0) {
    await expect(main.first()).toBeVisible();
  }
}

test.describe("QX-HD-04 / H2 APZQEP V1.1 accessibility", () => {
  test("primary V1.1 surfaces — axe critical/serious = 0", async ({ page }) => {
    test.setTimeout(180_000);
    await signInDevUser(page);
    await mockAllV11Surfaces(page);

    for (const surface of V11_PRIMARY_SURFACES) {
      await openQepSurface(page, surface.path);
      await expect(
        page.getByRole("heading", { level: 1, name: surface.heading }),
      ).toBeVisible();
      await assertNoCriticalSerious(page);
    }
  });

  test("keyboard and focus — QFW, automation, evidence", async ({ page }) => {
    test.setTimeout(120_000);
    await signInDevUser(page);
    await mockAllV11Surfaces(page);

    await openQepSurface(page, "/workspace/qep/quality-flows");
    await assertMeaningfulTitle(page);
    const commandCentre = page.getByRole("link", { name: "Command centre" });
    await commandCentre.focus();
    await expect(commandCentre).toBeFocused();
    await page.keyboard.press("Tab");
    const waiting = page.getByRole("link", { name: "Waiting" });
    await expect(waiting).toBeFocused();

    const flowLink = page
      .getByRole("heading", { name: "Active Quality Flows" })
      .locator("..")
      .getByRole("link")
      .first();
    await expect(flowLink).toBeVisible({ timeout: 15_000 });
    await flowLink.focus();
    await expect(flowLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { level: 1, name: "Continuous Certification" }),
    ).toBeVisible();

    await openQepSurface(page, "/workspace/qep/automation");
    const runButton = page.getByRole("button", { name: /Playwright dry-run/i });
    await runButton.focus();
    await expect(runButton).toBeFocused();
    await page.keyboard.press("Tab");
    await assertMeaningfulTitle(page);

    await openQepSurface(page, "/workspace/qep/evidence");
    const explorer = page.getByRole("link", { name: "Open Explorer" });
    await explorer.focus();
    await expect(explorer).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("qep-page")).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByRole("heading", { level: 1, name: "Explorer" }),
    ).toBeVisible();
  });

  test("screen reader landmarks and status text (colour independence)", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await signInDevUser(page);
    await mockAllV11Surfaces(page);

    for (const surface of [
      V11_PRIMARY_SURFACES[0],
      V11_PRIMARY_SURFACES[1],
      V11_PRIMARY_SURFACES[3],
      V11_PRIMARY_SURFACES[5],
    ]) {
      await openQepSurface(page, surface.path);
      await assertScreenReaderBasics(page, surface.heading);
    }

    await openQepSurface(page, "/workspace/qep/automation");
    const badges = page.getByTestId("qep-status-badge");
    await expect(badges.first()).toBeVisible();
    const badgeText = (await badges.first().innerText()).trim();
    expect(badgeText.length).toBeGreaterThan(0);
    await expect(badges.first()).toHaveAttribute("aria-label", /Status:/i);

    await openQepSurface(page, "/workspace/qep/quality-intelligence");
    const qiBadge = page.getByTestId("qep-status-badge").first();
    await expect(qiBadge).toBeVisible();
    expect((await qiBadge.innerText()).trim().length).toBeGreaterThan(0);
  });

  for (const viewport of [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
  ] as const) {
    test(`responsive a11y — ${viewport.name} primary surfaces`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await signInDevUser(page);
      await mockAllV11Surfaces(page);

      for (const surface of V11_PRIMARY_SURFACES) {
        await openQepSurface(page, surface.path);
        await assertMeaningfulTitle(page);
        await expect(
          page.getByRole("heading", { level: 1, name: surface.heading }),
        ).toBeAttached();
        await assertNoCriticalSerious(page);
      }
    });
  }
});
