import { describe, expect, it, beforeEach } from "vitest";

import { resetBillingLedgerForTests } from "./billing-ledger";
import {
  createCommerceCheckout,
  handlePayFastItn,
  recordManualPayment,
} from "./billing-service";
import {
  resetCataloguePriceOverlayForTests,
  setPackageListPrice,
} from "./catalogue-price-overlay";
import {
  getCommerceOrderByInvoice,
  resetCommerceOrdersForTests,
} from "./commerce-order";
import { resetCommerceIntentsForTests } from "./commerce-package-intent";
import {
  hasProductAccess,
  listOrgProductSubscriptions,
  resetProductAccessForTests,
} from "./product-access";
import { signPayFastParams } from "./payfast-adapter";

describe("commercial activation", () => {
  beforeEach(() => {
    resetBillingLedgerForTests();
    resetCataloguePriceOverlayForTests();
    resetCommerceOrdersForTests();
    resetCommerceIntentsForTests();
    resetProductAccessForTests();
    setPackageListPrice("pkg.apzqep.starter", 9900);
    setPackageListPrice("pkg.apzprd.projects", 7900);
  });

  it("creates checkout without granting entitlements before payment", () => {
    const checkout = createCommerceCheckout({
      organisationId: "org-ext-1",
      ownerId: "user-ext-1",
      packageIds: ["pkg.apzqep.starter", "pkg.apzprd.projects"],
      planId: "plan.business",
    });
    expect(checkout.quote.totalCents).toBe(17800);
    expect(checkout.order.status).toBe("pending_payment");
    expect(listOrgProductSubscriptions("org-ext-1")).toHaveLength(0);
  });

  it("activates org entitlements only after verified ITN", () => {
    const checkout = createCommerceCheckout({
      organisationId: "org-ext-2",
      ownerId: "user-ext-2",
      packageIds: ["pkg.apzqep.starter"],
      planId: "plan.business",
    });
    const fields = {
      merchant_id: "10000100",
      amount_gross: (checkout.quote.totalCents / 100).toFixed(2),
      item_name: "APZQEP",
      m_payment_id: checkout.invoice.invoiceId,
      payment_status: "complete",
      pf_payment_id: "pf-1",
    };
    const signature = signPayFastParams(fields, "");
    const result = handlePayFastItn({ ...fields, signature });
    expect(result.ok).toBe(true);
    expect(
      listOrgProductSubscriptions("org-ext-2").some((s) => s.productKey === "qep"),
    ).toBe(true);
    expect(
      hasProductAccess({
        organisationId: "org-ext-2",
        userId: "user-ext-2",
        productKey: "qep",
      }),
    ).toBe(false);
    const order = getCommerceOrderByInvoice(checkout.invoice.invoiceId);
    expect(order?.status).toBe("active");
  });

  it("rejects invalid signature", () => {
    expect(() =>
      handlePayFastItn({
        m_payment_id: "inv-missing",
        payment_status: "complete",
        amount_gross: "99.00",
        signature: "bad",
      }),
    ).toThrow("billing.payfast_signature_invalid");
  });

  it("rejects incorrect amount", () => {
    const checkout = createCommerceCheckout({
      organisationId: "org-ext-3",
      ownerId: "user-ext-3",
      packageIds: ["pkg.apzqep.starter"],
    });
    const fields = {
      merchant_id: "10000100",
      amount_gross: "1.00",
      item_name: "APZQEP",
      m_payment_id: checkout.invoice.invoiceId,
      payment_status: "complete",
      pf_payment_id: "pf-2",
    };
    const signature = signPayFastParams(fields, "");
    expect(() => handlePayFastItn({ ...fields, signature })).toThrow(
      "billing.payfast_amount_mismatch",
    );
    expect(listOrgProductSubscriptions("org-ext-3")).toHaveLength(0);
  });

  it("rejects unknown invoice", () => {
    const fields = {
      merchant_id: "10000100",
      amount_gross: "99.00",
      item_name: "APZQEP",
      m_payment_id: "inv-unknown",
      payment_status: "complete",
      pf_payment_id: "pf-3",
    };
    const signature = signPayFastParams(fields, "");
    expect(() => handlePayFastItn({ ...fields, signature })).toThrow(
      "billing.invoice_not_found",
    );
  });

  it("is idempotent on duplicate ITN", () => {
    const checkout = createCommerceCheckout({
      organisationId: "org-ext-4",
      ownerId: "user-ext-4",
      packageIds: ["pkg.apzqep.starter"],
    });
    recordManualPayment(checkout.invoice.invoiceId, checkout.quote.totalCents);
    recordManualPayment(checkout.invoice.invoiceId, checkout.quote.totalCents);
    expect(listOrgProductSubscriptions("org-ext-4")).toHaveLength(1);
  });
});
