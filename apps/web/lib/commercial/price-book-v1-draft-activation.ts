/**
 * Price Book v1.0 draft staging — configuration activation only.
 * Does not publish. Does not invent catalogue IDs beyond Owner-authorised mapping closure.
 */

import {
  setItemDraftPrice,
  upsertPlanState,
  upsertTaxRule,
  type PricingUnit,
} from "@/lib/commercial/commercial-config";
import { quoteCommerceBasket } from "@/lib/commercial/commerce-quote";
import {
  effectiveItemStatus,
  resolveListPrice,
  resolveRegionId,
} from "@/lib/commercial/pricing-engine";

export type MappedPriceBookItem = {
  readonly bookItem: string;
  readonly packageId: string;
  readonly pricingUnit: PricingUnit;
  readonly displayName?: string;
  readonly globalUsdCents: number;
  readonly africaUsdCents: number;
  readonly zaZarCents: number;
};

/** All 12 Price Book v1.0 commercial items — durable catalogue IDs only. */
export const PRICE_BOOK_V1_MAPPED: readonly MappedPriceBookItem[] = [
  {
    bookItem: "APZPRD Projects",
    packageId: "pkg.apzprd.projects",
    pricingUnit: "per_user",
    globalUsdCents: 1000,
    africaUsdCents: 600,
    zaZarCents: 9900,
  },
  {
    bookItem: "APZPRD Support Agent",
    packageId: "pkg.apzprd.service",
    pricingUnit: "per_agent",
    globalUsdCents: 2200,
    africaUsdCents: 1200,
    zaZarCents: 19900,
  },
  {
    bookItem: "APZPRD Time",
    packageId: "pkg.apzprd.time",
    pricingUnit: "per_user",
    globalUsdCents: 800,
    africaUsdCents: 400,
    zaZarCents: 6900,
  },
  {
    bookItem: "APZPRD Workflow",
    packageId: "pkg.apzprd.workflow",
    pricingUnit: "per_user",
    globalUsdCents: 1000,
    africaUsdCents: 600,
    zaZarCents: 9900,
  },
  {
    bookItem: "APZPRD Analytics",
    packageId: "pkg.apzprd.analytics",
    pricingUnit: "per_user",
    globalUsdCents: 1200,
    africaUsdCents: 700,
    zaZarCents: 11900,
  },
  {
    bookItem: "APZPRD Knowledge",
    packageId: "pkg.apzprd.knowledge",
    pricingUnit: "per_user",
    globalUsdCents: 700,
    africaUsdCents: 400,
    zaZarCents: 6900,
  },
  {
    bookItem: "APZPRD Documents",
    packageId: "pkg.apzprd.documents",
    pricingUnit: "per_user",
    globalUsdCents: 700,
    africaUsdCents: 400,
    zaZarCents: 6900,
  },
  {
    bookItem: "APZPRD Complete",
    packageId: "pkg.apzprd.workspace",
    pricingUnit: "per_user",
    displayName: "APZPRD Complete",
    globalUsdCents: 2900,
    africaUsdCents: 1500,
    zaZarCents: 24900,
  },
  {
    bookItem: "APZQEP Engineer",
    packageId: "pkg.apzqep.starter",
    pricingUnit: "per_engineer",
    globalUsdCents: 3500,
    africaUsdCents: 1800,
    zaZarCents: 29900,
  },
  {
    bookItem: "APZQEP Collaborator",
    packageId: "pkg.apzqep.collaborator",
    pricingUnit: "per_collaborator",
    globalUsdCents: 1000,
    africaUsdCents: 500,
    zaZarCents: 7900,
  },
  {
    bookItem: "APZPEN Practitioner",
    packageId: "pkg.apzpen.starter",
    pricingUnit: "per_practitioner",
    globalUsdCents: 6900,
    africaUsdCents: 3500,
    zaZarCents: 59900,
  },
  {
    bookItem: "APZPEN Collaborator",
    packageId: "pkg.apzpen.collaborator",
    pricingUnit: "per_collaborator",
    globalUsdCents: 1200,
    africaUsdCents: 600,
    zaZarCents: 9900,
  },
] as const;

/** Trial Policy v1.0 is active in runtime — see startTrialSubscription. */
export const TRIAL_POLICY_V1 = {
  durationDays: 14,
  cardRequired: false,
  onePerOrganisation: true,
  automaticPaidConversion: false,
} as const;

/** @deprecated gap closed by Trial Policy v1.0 activation */
export const TRIAL_POLICY_ACTIVATION_GAP = [] as const;

const ACTOR = "owner-catalogue-mapping-closure";
const REASON =
  "Catalogue Mapping Closure + Price Book v1.0 draft re-stage (Owner authorised; not publish)";

function annualFromMonthly(monthlyCents: number): number {
  return monthlyCents * 10;
}

export function stagePriceBookV1Drafts(): {
  readonly taxRuleId: string;
  readonly stagedPackageIds: readonly string[];
  readonly mappedCount: number;
} {
  const staged: string[] = [];

  for (const item of PRICE_BOOK_V1_MAPPED) {
    const rows: Array<{
      regionId: "GLOBAL" | "AFRICA" | "SOUTH_AFRICA";
      amountCents: number;
      currency: string;
    }> = [
      {
        regionId: "GLOBAL",
        amountCents: item.globalUsdCents,
        currency: "USD",
      },
      {
        regionId: "AFRICA",
        amountCents: item.africaUsdCents,
        currency: "USD",
      },
      {
        regionId: "SOUTH_AFRICA",
        amountCents: item.zaZarCents,
        currency: "ZAR",
      },
    ];
    for (const row of rows) {
      setItemDraftPrice({
        packageId: item.packageId,
        regionId: row.regionId,
        pricingUnit: item.pricingUnit,
        displayName: item.displayName,
        // Preserve catalogue availability — do not pass status.
        price: {
          amountCents: row.amountCents,
          currency: row.currency,
          annualAmountCents: annualFromMonthly(row.amountCents),
          annualDiscountBps: null,
        },
        actorUserId: ACTOR,
        reason: REASON,
      });
    }
    staged.push(item.packageId);
  }

  const tax = upsertTaxRule(
    {
      taxRuleId: "tax-za-vat-15-draft",
      countryCode: "ZA",
      name: "South Africa VAT",
      rateBps: 1500,
      pricesExclusive: true,
      status: "draft",
    },
    ACTOR,
    REASON,
  );

  // Trial policy draft recorded only — TRIAL POLICY ACTIVATION GAP (do not redesign here).
  for (const planId of ["plan.individual", "plan.business"] as const) {
    upsertPlanState(
      {
        planId,
        draft: {
          amountCents: null,
          currency: "ZAR",
          trialDays: 14,
          annualEnabled: true,
          annualDiscountBps: null,
          annualAmountCents: null,
        },
      },
      ACTOR,
      `${REASON} — trialDays draft 14 recorded; runtime trial unchanged (TRIAL POLICY ACTIVATION GAP)`,
    );
  }

  return {
    taxRuleId: tax.taxRuleId,
    stagedPackageIds: staged,
    mappedCount: staged.length,
  };
}

export function draftPreviewQuote(input: {
  readonly lines: readonly { packageId: string; quantity: number }[];
  readonly countryCode: string;
  readonly interval?: "month" | "year";
}) {
  return quoteCommerceBasket({
    lines: input.lines,
    countryCode: input.countryCode,
    interval: input.interval ?? "month",
    layer: "draft",
    adminPreview: true,
  });
}

export function buildActivationMatrix(): readonly {
  readonly bookItem: string;
  readonly packageId: string;
  readonly global: string;
  readonly africa: string;
  readonly za: string;
  readonly monthly: string;
  readonly annual: string;
  readonly availability: string;
  readonly draftStatus: string;
}[] {
  return PRICE_BOOK_V1_MAPPED.map((item) => {
    const g = resolveListPrice({
      packageId: item.packageId,
      regionId: "GLOBAL",
      layer: "draft",
    });
    const a = resolveListPrice({
      packageId: item.packageId,
      regionId: "AFRICA",
      layer: "draft",
    });
    const z = resolveListPrice({
      packageId: item.packageId,
      regionId: "SOUTH_AFRICA",
      layer: "draft",
    });
    return {
      bookItem: item.bookItem,
      packageId: item.packageId,
      global: g.amountCents != null ? `USD ${(g.amountCents / 100).toFixed(2)}` : "—",
      africa: a.amountCents != null ? `USD ${(a.amountCents / 100).toFixed(2)}` : "—",
      za: z.amountCents != null ? `ZAR ${(z.amountCents / 100).toFixed(2)}` : "—",
      monthly: "yes",
      annual: "10× monthly",
      availability: effectiveItemStatus(item.packageId),
      draftStatus: "DRAFT",
    };
  });
}

export function proveRegionalResolution(): readonly {
  readonly country: string;
  readonly expectedRegion: string;
  readonly actualRegion: string;
  readonly pass: boolean;
}[] {
  return [
    { country: "US", expected: "GLOBAL" },
    { country: "KE", expected: "AFRICA" },
    { country: "ZA", expected: "SOUTH_AFRICA" },
  ].map((row) => {
    const actual = resolveRegionId(row.country);
    return {
      country: row.country,
      expectedRegion: row.expected,
      actualRegion: actual,
      pass: actual === row.expected,
    };
  });
}
