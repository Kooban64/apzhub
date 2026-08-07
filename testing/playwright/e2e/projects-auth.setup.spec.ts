import { test as setup } from "@playwright/test";
import path from "node:path";

import { signInDevUser } from "./auth-helpers";

const authFile = path.resolve(__dirname, "../.auth/projects-user.json");

setup("authenticate projects e2e user", async ({ page }) => {
  setup.setTimeout(120_000);
  await signInDevUser(page);
  await page.context().storageState({ path: authFile });
});
