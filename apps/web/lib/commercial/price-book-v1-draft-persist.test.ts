/**
 * Persist Price Book v1.0 drafts for Platform Admin review.
 * Invoked via vitest so @/ path aliases resolve.
 *
 *   APZHUB_FORCE_COMMERCE_PERSIST=1 pnpm exec vitest run \
 *     apps/web/lib/commercial/price-book-v1-draft-persist.test.ts
 */

import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";

import {
  getCommercialPlane,
  persistCommercialConfigForStaging,
  resetCataloguePriceOverlayForTests,
} from "./commercial-config";
import { stagePriceBookV1Drafts } from "./price-book-v1-draft-activation";

describe("Price Book v1.0 draft persist (Platform Admin surface)", () => {
  it("writes DRAFT overlay without publishing", () => {
    resetCataloguePriceOverlayForTests();
    stagePriceBookV1Drafts();
    persistCommercialConfigForStaging();

    const path = join(process.cwd(), "apps/web/.data/catalogue-prices/overlay.json");
    const alt = join(process.cwd(), ".data/catalogue-prices/overlay.json");
    const file = existsSync(path) ? path : alt;
    expect(existsSync(file)).toBe(true);
    const parsed = JSON.parse(readFileSync(file, "utf8")) as {
      plane: {
        taxRules: { status: string; taxRuleId: string }[];
        items: Record<string, { published: object; draft: object }>;
      };
    };
    const tax = parsed.plane.taxRules.find(
      (r) => r.taxRuleId === "tax-za-vat-15-draft",
    );
    expect(tax?.status).toBe("draft");
    const workspace = parsed.plane.items["pkg.apzprd.workspace"];
    expect(workspace?.draft?.SOUTH_AFRICA).toBeTruthy();
    expect(Object.keys(workspace?.published ?? {}).length).toBe(0);
    expect(
      parsed.plane.items["pkg.apzqep.collaborator"]?.draft?.SOUTH_AFRICA,
    ).toBeTruthy();
    expect(
      parsed.plane.items["pkg.apzpen.collaborator"]?.draft?.SOUTH_AFRICA,
    ).toBeTruthy();
    expect(parsed.plane.items["pkg.apzprd.workflow"]?.draft?.SOUTH_AFRICA).toBeTruthy();
    expect(Object.keys(parsed.plane.items).length).toBeGreaterThanOrEqual(12);
    expect(
      getCommercialPlane().taxRules.every(
        (r) => r.taxRuleId !== "tax-za-vat-15-draft" || r.status === "draft",
      ),
    ).toBe(true);
  });
});
