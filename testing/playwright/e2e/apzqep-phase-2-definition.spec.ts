import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3300";

const EVIDENCE = "docs/frontend/apzqep-redesign/evidence/phase-2";

async function loginAs(page: Page, persona: string): Promise<void> {
  const credRes = await page.request.post("/api/v1/demo/quick-login", {
    data: { id: persona },
    timeout: 60_000,
  });
  expect(credRes.ok(), `quick-login ${persona}`).toBeTruthy();
  const credBody = (await credRes.json()) as {
    data?: { email?: string; password?: string };
  };
  const signIn = await page.request.post("/api/auth/sign-in/email", {
    data: {
      email: credBody.data!.email,
      password: credBody.data!.password,
    },
    headers: {
      Origin: ORIGIN,
      Referer: `${ORIGIN}/login`,
    },
    timeout: 30_000,
  });
  expect(signIn.ok(), `sign-in ${persona}: ${signIn.status()}`).toBeTruthy();
}

async function shot(page: Page, name: string): Promise<void> {
  fs.mkdirSync(path.resolve(EVIDENCE), { recursive: true });
  await page.screenshot({ path: `${EVIDENCE}/${name}`, fullPage: true });
}

async function setColorScheme(page: Page, scheme: "light" | "dark"): Promise<void> {
  await page.evaluate((value) => {
    const root = document.documentElement;
    root.classList.toggle("dark", value === "dark");
    root.style.colorScheme = value;
  }, scheme);
  await page.waitForTimeout(250);
}

test.describe("APZQEP redesign Phase 2 — Definition", () => {
  test("requirements, stories, AC, coverage, and geometry evidence", async ({
    page,
  }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginAs(page, "org_member");
    await page.waitForTimeout(1000);

    const key = `DEF${Date.now().toString(36).slice(-5).toUpperCase()}`;
    const appRes = await page.request.post("/api/v1/qep/applications", {
      data: { name: "Definition App", key, status: "active" },
      timeout: 30_000,
    });
    let applicationId: string | undefined;
    if (appRes.ok()) {
      const appBody = (await appRes.json()) as {
        data?: { application?: { id?: string } };
      };
      applicationId = appBody.data?.application?.id;
    } else {
      const listed = await page.request.get("/api/v1/qep/applications");
      expect(listed.ok(), await listed.text()).toBeTruthy();
      const listedBody = (await listed.json()) as {
        data?: { applications?: readonly { id?: string; key?: string }[] };
      };
      applicationId =
        listedBody.data?.applications?.find((row) => row.key === key)?.id ??
        listedBody.data?.applications?.[0]?.id;
    }
    expect(applicationId).toBeTruthy();

    const reqRes = await page.request.post("/api/v1/qep/requirements", {
      data: {
        projectId: applicationId,
        key: `REQ-${key}`,
        title: "Password reset",
        description: "Users can reset a forgotten password.",
        type: "functional",
        priority: "high",
        acceptanceCriteriaItems: ["User must receive reset email"],
      },
      timeout: 30_000,
    });
    expect(reqRes.ok(), await reqRes.text()).toBeTruthy();
    const reqBody = (await reqRes.json()) as {
      data?: { id?: string; projectId?: string };
    };
    const requirementId = reqBody.data?.id;
    expect(requirementId).toBeTruthy();
    expect(reqBody.data?.projectId).toBe(applicationId);

    const promote1 = await page.request.post(
      "/api/v1/qep/definition/promote-legacy-criteria",
      {
        data: { requirementId },
        timeout: 30_000,
      },
    );
    expect(promote1.ok(), await promote1.text()).toBeTruthy();
    const promote2 = await page.request.post(
      "/api/v1/qep/definition/promote-legacy-criteria",
      {
        data: { requirementId },
        timeout: 30_000,
      },
    );
    expect(promote2.ok(), await promote2.text()).toBeTruthy();
    const definition = await page.request.get(
      `/api/v1/qep/requirements/${encodeURIComponent(requirementId!)}/definition`,
    );
    expect(definition.ok(), await definition.text()).toBeTruthy();
    const defBody = (await definition.json()) as {
      data?: {
        criteria?: readonly {
          text?: string;
          userStoryId?: string;
          criterionKey?: string;
          id?: string;
        }[];
        coverage?: { coveredCount?: number; gapCount?: number };
      };
    };
    expect(defBody.data?.criteria).toHaveLength(1);
    expect(defBody.data?.criteria?.[0]?.text).toBe("User must receive reset email");
    expect(defBody.data?.criteria?.[0]?.userStoryId).toBeFalsy();
    const criterionId = defBody.data?.criteria?.[0]?.id;

    const storyRes = await page.request.post("/api/v1/qep/user-stories", {
      data: {
        applicationId,
        requirementId,
        title: "Request a password reset",
        description: "As a registered user I can request a reset.",
        storyType: "feature",
        priority: "high",
      },
      timeout: 30_000,
    });
    expect(storyRes.ok(), await storyRes.text()).toBeTruthy();
    const storyBody = (await storyRes.json()) as { data?: { story?: { id?: string } } };
    const storyId = storyBody.data?.story?.id;
    expect(storyId).toBeTruthy();

    const acUnderStory = await page.request.post("/api/v1/qep/acceptance-criteria", {
      data: {
        applicationId,
        requirementId,
        userStoryId: storyId,
        text: "Reset token expires after 15 minutes",
      },
      timeout: 30_000,
    });
    expect(acUnderStory.ok(), await acUnderStory.text()).toBeTruthy();

    if (criterionId) {
      const linked = await page.request.post(
        `/api/v1/qep/acceptance-criteria/${encodeURIComponent(criterionId)}/verification`,
        {
          data: {
            assetKind: "test_specification",
            assetId: "spec-phase2-proof",
            latestResult: "fail",
          },
          timeout: 30_000,
        },
      );
      expect(linked.ok(), await linked.text()).toBeTruthy();
    }

    const covered = await page.request.get(
      `/api/v1/qep/requirements/${encodeURIComponent(requirementId!)}/definition`,
    );
    const coveredBody = (await covered.json()) as {
      data?: {
        criteria?: readonly {
          coverage?: string;
          result?: string;
          verificationCount?: number;
        }[];
        coverage?: { coverage?: string; coveredCount?: number; gapCount?: number };
      };
    };
    const linkedAc = coveredBody.data?.criteria?.find((row) => row.verificationCount);
    expect(linkedAc?.coverage).toBe("covered");
    expect(linkedAc?.result).toBe("fail");
    expect(coveredBody.data?.coverage?.coverage).toBe("partial");

    await page.goto("/workspace/qep/requirements");
    const appSelect = page.getByTestId("qep-application-selector").locator("select");
    if (await appSelect.count()) {
      await appSelect.selectOption(applicationId!);
    }
    await expect(page.getByTestId("qep-requirements")).toBeVisible({ timeout: 45_000 });
    await setColorScheme(page, "light");
    await shot(page, "01-requirements-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "02-requirements-desktop-dark.png");
    await setColorScheme(page, "light");

    await page.setViewportSize({ width: 390, height: 844 });
    await shot(page, "03-requirements-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "04-requirements-mobile-dark.png");
    await setColorScheme(page, "light");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(
      `/workspace/qep/requirements/${encodeURIComponent(requirementId!)}`,
    );
    await expect(page.getByTestId("qep-requirement-detail")).toBeVisible({
      timeout: 45_000,
    });
    await shot(page, "05-requirement-detail-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "06-requirement-detail-desktop-dark.png");
    await setColorScheme(page, "light");

    await page.setViewportSize({ width: 390, height: 844 });
    await shot(page, "07-requirement-detail-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "08-requirement-detail-mobile-dark.png");
    await setColorScheme(page, "light");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("tab", { name: "User Stories" }).click();
    await expect(page.getByTestId("qep-user-stories")).toBeVisible();
    await shot(page, "09-user-stories-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "10-user-stories-desktop-dark.png");
    await setColorScheme(page, "light");

    await page.setViewportSize({ width: 390, height: 844 });
    await shot(page, "11-user-stories-mobile-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "12-user-stories-mobile-dark.png");
    await setColorScheme(page, "light");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("tab", { name: "Acceptance Criteria" }).click();
    await expect(page.getByTestId("qep-acceptance-criteria")).toBeVisible();
    await shot(page, "13-acceptance-criteria-desktop-light.png");
    await setColorScheme(page, "dark");
    await shot(page, "14-acceptance-criteria-desktop-dark.png");
    await setColorScheme(page, "light");

    await page.locator("[data-testid^='qep-criterion-row-']").first().click();
    await expect(page.getByTestId("qep-criterion-inspector")).toBeVisible();
    await shot(page, "15-acceptance-criterion-inspector.png");
    await shot(page, "16-traceability-coverage-relationship-proof.png");

    await page.goto("/workspace/qep");
    await expect(page.getByTestId("workbench-shell")).toBeVisible({ timeout: 45_000 });
    await page.goto("/workspace/qep/my-work");
    await expect(page.getByTestId("qep-my-work")).toBeVisible({ timeout: 45_000 });
  });
});
