/**
 * PayFast production preflight + controlled ZA Projects checkout preparation.
 * Does not complete card payment. Does not enable self-service.
 */

import { describe, expect, it, beforeAll } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { resetCataloguePriceOverlayForTests } from "./commercial-config";
import { publishPriceBookV1 } from "./price-book-v1-publication";
import { resetBillingLedgerForTests } from "./billing-ledger";
import { resetCommerceOrdersForTests } from "./commerce-order";
import { resetCommerceIntentsForTests } from "./commerce-package-intent";
import { resetProductAccessForTests } from "./product-access";
import { resetQuotesForTests } from "./quote-store";
import { quoteCommerceBasket } from "./commerce-quote";
import { handlePayFastItn } from "./billing-service";
import { signPayFastParams } from "./payfast-adapter";
import {
  loadPayFastProductionSecretsIntoEnv,
  prepareControlledZaProjectsCheckout,
  runPayFastProductionPreflight,
} from "./payfast-production-certification";

describe("PayFast production controlled certification prep", () => {
  beforeAll(() => {
    // Load APP_URL from gitignored .env without printing secrets
    try {
      for (const line of readFileSync(join(process.cwd(), ".env"), "utf8").split(
        "\n",
      )) {
        const t = line.trim();
        if (!t || t.startsWith("#") || !t.includes("=")) continue;
        const i = t.indexOf("=");
        const k = t.slice(0, i);
        const v = t.slice(i + 1);
        if (
          k === "APP_URL" ||
          k === "NEXT_PUBLIC_APP_URL" ||
          k.startsWith("PAYFAST_") ||
          k.includes("SELF_SERVE")
        ) {
          process.env[k] = v;
        }
      }
    } catch {
      /* optional */
    }
    loadPayFastProductionSecretsIntoEnv();
    resetCataloguePriceOverlayForTests();
    resetQuotesForTests();
    resetBillingLedgerForTests();
    resetCommerceOrdersForTests();
    resetCommerceIntentsForTests();
    resetProductAccessForTests();
    publishPriceBookV1();
  });

  it("pre-flight passes before money", () => {
    const preflight = runPayFastProductionPreflight();
    expect(preflight.merchantConfigured).toBe("PASS");
    expect(preflight.sandboxOff).toBe("PASS");
    expect(preflight.productionEndpoint).toBe("PASS");
    expect(preflight.httpsReturn).toBe("PASS");
    expect(preflight.httpsCancel).toBe("PASS");
    expect(preflight.httpsNotify).toBe("PASS");
    expect(preflight.selfServiceOff).toBe("PASS");
  });

  it("authoritative ZA Projects quote matches published R99 + 15% VAT", () => {
    const quote = quoteCommerceBasket({
      lines: [{ packageId: "pkg.apzprd.projects", quantity: 1 }],
      countryCode: "ZA",
      layer: "published",
    });
    expect(quote.ok).toBe(true);
    if (!quote.ok) return;
    expect(quote.subtotalCents).toBe(9900);
    expect(quote.taxCents).toBe(1485);
    expect(quote.totalCents).toBe(11385);
    expect(quote.currency).toBe("ZAR");
  });

  it("coming_soon still not purchasable", () => {
    const q = quoteCommerceBasket({
      packageIds: ["pkg.apzprd.workspace"],
      countryCode: "ZA",
      layer: "published",
    });
    expect(q.ok).toBe(false);
    if (!q.ok) expect(q.code).toBe("package_coming_soon");
  });

  it("prepares controlled checkout session (Owner completes PayFast)", () => {
    const result = prepareControlledZaProjectsCheckout({
      organisationId: "org-owner-payfast-cert",
      ownerId: "user-owner-payfast-cert",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.safe.payfastMode).toBe("live");
    expect(result.safe.processHost).toBe("www.payfast.co.za");
    expect(result.safe.totalCents).toBe(11385);
    expect(result.safe.selfServeAllowed).toBe(false);
    expect(
      existsSync(
        join(
          process.cwd(),
          ".secrets/payfast-certification/controlled-checkout-safe.json",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          process.cwd(),
          ".secrets/payfast-certification/controlled-checkout-form.html",
        ),
      ),
    ).toBe(true);
  });

  it("negative ITN controls still hold under production env", () => {
    expect(() =>
      handlePayFastItn({
        m_payment_id: "inv-missing",
        payment_status: "COMPLETE",
        amount_gross: "113.85",
        signature: "bad",
      }),
    ).toThrow("billing.payfast_signature_invalid");

    const result = prepareControlledZaProjectsCheckout({
      organisationId: "org-owner-payfast-cert-2",
      ownerId: "user-owner-payfast-cert-2",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const invoiceId = result.checkout.invoice.invoiceId;
    const fields: Record<string, string> = {
      m_payment_id: invoiceId,
      payment_status: "COMPLETE",
      amount_gross: "1.00",
      merchant_id: process.env.PAYFAST_MERCHANT_ID ?? "",
    };
    const signature = signPayFastParams(fields, process.env.PAYFAST_PASSPHRASE ?? "");
    expect(() => handlePayFastItn({ ...fields, signature })).toThrow(
      "billing.payfast_amount_mismatch",
    );
  });
});
