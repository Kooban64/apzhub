import { describe, expect, it, beforeEach } from "vitest";

import {
  advanceDunning,
  ensureBillingAccount,
  issueInvoice,
  recordPayment,
  resetBillingLedgerForTests,
  composeStatement,
  applyCredit,
  issueRefund,
} from "./billing-ledger";
import {
  createPayFastCheckout,
  signPayFastParams,
  verifyPayFastItn,
} from "./payfast-adapter";
import {
  grantSkuCapabilities,
  requireEntitlement,
  resetEntitlementsForTests,
} from "./entitlements";
import { purchaseSku, recordManualPayment } from "./billing-service";
import { listCatalogueSkus } from "./catalogue";

describe("commercial billing", () => {
  beforeEach(() => {
    resetBillingLedgerForTests();
    resetEntitlementsForTests();
  });

  it("exposes direct catalogue SKUs", () => {
    const skus = listCatalogueSkus();
    expect(skus.some((s) => s.skuId === "sku.qep.pentest")).toBe(true);
    expect(skus.some((s) => s.skuId === "sku.qep.qa-report")).toBe(true);
  });

  it("advances dunning one step at a time (never immediate suspend)", () => {
    const account = ensureBillingAccount({
      kind: "organisation",
      ownerId: "u1",
      subjectId: "org-1",
    });
    expect(account.dunningState).toBe("active");
    expect(advanceDunning(account.billingAccountId).dunningState).toBe("notice");
    expect(advanceDunning(account.billingAccountId).dunningState).toBe("warning");
    expect(advanceDunning(account.billingAccountId).dunningState).toBe("grace");
    expect(advanceDunning(account.billingAccountId).dunningState).toBe("soft_limited");
    expect(advanceDunning(account.billingAccountId).dunningState).toBe("suspended");
  });

  it("issues invoice, accepts payment, grants entitlements", () => {
    const purchase = purchaseSku({
      kind: "organisation",
      ownerId: "u1",
      subjectId: "org-1",
      skuId: "sku.qep.pentest",
    });
    expect(purchase.checkout.processUrl).toContain("payfast");
    recordManualPayment(purchase.invoice.invoiceId, purchase.invoice.amountCents);
    const decision = requireEntitlement("org-1", "cap.qep.pentest");
    expect(decision.allowed).toBe(true);
  });

  it("supports credits, refunds, and statements", () => {
    const account = ensureBillingAccount({
      kind: "individual",
      ownerId: "u1",
      subjectId: "u1",
    });
    const invoice = issueInvoice({
      billingAccountId: account.billingAccountId,
      skuId: "sku.qep.qa-report",
      amountCents: 7900,
    });
    applyCredit({
      billingAccountId: account.billingAccountId,
      amountCents: 1000,
      reason: "welcome discount",
    });
    recordPayment({
      invoiceId: invoice.invoiceId,
      amountCents: 7900,
      provider: "manual",
      status: "received",
    });
    grantSkuCapabilities(account.billingAccountId, "sku.qep.qa-report");
    const refund = issueRefund({
      invoiceId: invoice.invoiceId,
      amountCents: 7900,
      reason: "goodwill",
    });
    expect(refund.refundId).toMatch(/^ref-/);
    const statement = composeStatement(account.billingAccountId);
    expect(statement.credits.length).toBe(1);
    expect(statement.refunds.length).toBe(1);
  });

  it("signs and verifies PayFast params", () => {
    const fields = {
      merchant_id: "10000100",
      amount: "99.00",
      item_name: "Pen-Test",
    };
    const signature = signPayFastParams(fields, "secret");
    expect(
      verifyPayFastItn(
        { ...fields, signature },
        { PAYFAST_PASSPHRASE: "secret", PAYFAST_SANDBOX: "true" },
      ),
    ).toBe(true);
    const checkout = createPayFastCheckout({
      amountCents: 9900,
      itemName: "Pen-Test",
      invoiceId: "inv-1",
    });
    expect(checkout.fields.signature).toBeTruthy();
    expect(checkout.fields.return_url).toContain("/checkout/processing");
    expect(checkout.fields.cancel_url).toContain("/checkout/fail");
    expect(checkout.integration).toBe("form");
  });
});
