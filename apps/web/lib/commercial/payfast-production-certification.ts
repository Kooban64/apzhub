/**
 * Controlled production PayFast certification helpers.
 * Loads credentials from `.secrets/payfast-production.env` only.
 * Never logs secret values.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { createCommerceCheckout } from "@/lib/commercial/billing-service";
import { quoteCommerceBasket } from "@/lib/commercial/commerce-quote";
import {
  getPayFastHealth,
  resolvePayFastConfig,
} from "@/lib/commercial/payfast-adapter";

import type { EnvVars } from "@/lib/env-vars";
function selfServeAllowed(env: EnvVars = process.env): boolean {
  return (
    env.ALLOW_SELF_SERVE_REGISTER === "true" ||
    env.NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER === "true"
  );
}

function secretsDir(): string {
  return join(process.cwd(), ".secrets");
}

export function loadPayFastProductionSecretsIntoEnv(): {
  readonly loaded: boolean;
  readonly sandbox: boolean;
  readonly configured: boolean;
} {
  const raw = readFileSync(join(secretsDir(), "payfast-production.env"), "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1);
    if (key.startsWith("PAYFAST_")) {
      process.env[key] = value;
    }
  }
  process.env.PAYFAST_SANDBOX = "false";
  process.env.ALLOW_SELF_SERVE_REGISTER = "false";
  process.env.NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER = "false";
  const health = getPayFastHealth();
  return {
    loaded: health.configured,
    sandbox: health.sandbox,
    configured: health.configured,
  };
}

export function runPayFastProductionPreflight(): Record<string, string> {
  loadPayFastProductionSecretsIntoEnv();
  const cfg = resolvePayFastConfig();
  const health = getPayFastHealth();
  const appUrl =
    process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || "";
  const out: Record<string, string> = {
    merchantConfigured: health.configured ? "PASS" : "FAIL",
    sandboxOff: health.sandbox ? "FAIL" : "PASS",
    productionEndpoint: health.sandbox ? "FAIL" : "PASS",
    httpsReturn: cfg.returnUrl.startsWith("https://") ? "PASS" : "FAIL",
    httpsCancel: cfg.cancelUrl.startsWith("https://") ? "PASS" : "FAIL",
    httpsNotify: cfg.notifyUrl.startsWith("https://") ? "PASS" : "FAIL",
    appUrlHttps: appUrl.startsWith("https://") ? "PASS" : "FAIL",
    selfServiceOff: selfServeAllowed() ? "FAIL" : "PASS",
  };
  return out;
}

/** Lowest-value currently available ZA item: APZPRD Projects @ published R99. */
export function prepareControlledZaProjectsCheckout(input: {
  readonly organisationId: string;
  readonly ownerId: string;
  readonly email?: string;
}) {
  loadPayFastProductionSecretsIntoEnv();
  const quote = quoteCommerceBasket({
    lines: [{ packageId: "pkg.apzprd.projects", quantity: 1 }],
    countryCode: "ZA",
    interval: "month",
    layer: "published",
  });
  if (!quote.ok) {
    return { ok: false as const, quote };
  }
  const checkout = createCommerceCheckout({
    organisationId: input.organisationId,
    ownerId: input.ownerId,
    email: input.email,
    quoteId: quote.quoteId,
    countryCode: "ZA",
    packageIds: ["pkg.apzprd.projects"],
    seats: 1,
    planId: "plan.business",
  });

  const evidenceDir = join(secretsDir(), "payfast-certification");
  mkdirSync(evidenceDir, { recursive: true });
  const safe = {
    catalogueItem: "pkg.apzprd.projects",
    name: "APZPRD Projects",
    quantity: 1,
    billingCountry: "ZA",
    currency: quote.currency,
    subtotalCents: quote.subtotalCents,
    taxCents: quote.taxCents,
    totalCents: quote.totalCents,
    quoteId: quote.quoteId,
    invoiceId: checkout.invoice.invoiceId,
    orderId: checkout.order.orderId,
    payfastMode: checkout.checkout.mode,
    processHost: new URL(checkout.checkout.processUrl).host,
    returnUrl: resolvePayFastConfig().returnUrl,
    cancelUrl: resolvePayFastConfig().cancelUrl,
    notifyUrl: resolvePayFastConfig().notifyUrl,
    selfServeAllowed: selfServeAllowed(),
    createdAt: new Date().toISOString(),
  };
  writeFileSync(
    join(evidenceDir, "controlled-checkout-safe.json"),
    JSON.stringify(safe, null, 2),
    { mode: 0o600 },
  );

  // Private form for Owner payment only — contains merchant fields; never commit / never serve publicly.
  const fields = checkout.checkout.fields;
  const inputs = Object.entries(fields)
    .map(
      ([k, v]) =>
        `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, "&quot;")}" />`,
    )
    .join("\n");
  const html = `<!DOCTYPE html><html><body>
<h1>APZ controlled PayFast production payment</h1>
<p>Item: APZPRD Projects × 1 · ZA · amount from server quote only.</p>
<p>Invoice: ${safe.invoiceId}</p>
<form id="pf" action="${checkout.checkout.processUrl}" method="post">
${inputs}
<button type="submit">Pay with PayFast (production)</button>
</form>
<script>/* Owner submits manually — do not auto-submit */</script>
</body></html>`;
  writeFileSync(join(evidenceDir, "controlled-checkout-form.html"), html, {
    mode: 0o600,
  });

  return { ok: true as const, quote, checkout, safe };
}
