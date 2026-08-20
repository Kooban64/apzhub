/**
 * Capture Phase 3 Screen 1 visual-authority frames from the static mockup.
 * Not a product test. Do not treat this as Phase 3 implementation.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = path.resolve(__dirname);
const mockup = path.join(root, "test-case-library-mockup.html");
const fileUrl = `file://${mockup}`;

async function shot(page, name, size) {
  await page.setViewportSize(size);
  await page.screenshot({
    path: path.join(root, name),
    type: "png",
  });
}

(async () => {
  fs.mkdirSync(root, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${fileUrl}?theme=light&device=desktop`, { waitUntil: "load" });
  await shot(page, "01a-test-case-library-desktop-light.png", {
    width: 1440,
    height: 900,
  });

  await page.goto(`${fileUrl}?theme=dark&device=desktop`, { waitUntil: "load" });
  await shot(page, "01b-test-case-library-desktop-dark.png", {
    width: 1440,
    height: 900,
  });

  await page.goto(`${fileUrl}?theme=light&device=mobile`, { waitUntil: "load" });
  await shot(page, "01c-test-case-library-mobile-light.png", {
    width: 390,
    height: 844,
  });

  await page.goto(`${fileUrl}?theme=dark&device=mobile`, { waitUntil: "load" });
  await shot(page, "01d-test-case-library-mobile-dark.png", {
    width: 390,
    height: 844,
  });

  await page.goto(`${fileUrl}?theme=light&device=mobile&panel=inspector`, {
    waitUntil: "load",
  });
  await shot(page, "01e-test-case-library-mobile-inspector.png", {
    width: 390,
    height: 844,
  });

  const collage = path.join(root, "collage.html");
  fs.writeFileSync(
    collage,
    `<!DOCTYPE html><html><head><style>
      body{margin:0;background:#0f172a;color:#e2e8f0;font-family:ui-sans-serif,system-ui,sans-serif}
      h1{font-size:22px;margin:0;padding:20px 24px 8px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:12px 24px 24px}
      figure{margin:0}
      figcaption{font-size:13px;color:#94a3b8;margin-bottom:8px;font-weight:600}
      img{width:100%;height:420px;object-fit:contain;background:#020617;border:1px solid #1e293b;border-radius:8px}
    </style></head><body>
      <h1>APZQEP Phase 3 · Screen 1 · Test Case Library</h1>
      <div class="grid">
        <figure><figcaption>Desktop light</figcaption><img src="01a-test-case-library-desktop-light.png"></figure>
        <figure><figcaption>Desktop dark</figcaption><img src="01b-test-case-library-desktop-dark.png"></figure>
        <figure><figcaption>Mobile light</figcaption><img src="01c-test-case-library-mobile-light.png"></figure>
        <figure><figcaption>Mobile dark</figcaption><img src="01d-test-case-library-mobile-dark.png"></figure>
      </div>
    </body></html>`,
  );
  await page.goto(`file://${collage}`, { waitUntil: "load" });
  await page.setViewportSize({ width: 1600, height: 1020 });
  await page.waitForFunction(() =>
    [...document.images].every((img) => img.complete && img.naturalWidth > 0),
  );
  await page.screenshot({
    path: path.join(root, "01-test-case-library-authority.png"),
    type: "png",
  });

  await browser.close();
})();
