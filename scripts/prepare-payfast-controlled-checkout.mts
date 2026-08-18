/**
 * Prepare controlled ZA Projects checkout for Owner PayFast payment.
 * Secrets stay under .secrets/; safe evidence only is summarised to stdout.
 */

import { join } from "node:path";

process.chdir(join(process.cwd()));

async function main() {
  // Ensure APP_URL from .env is present for notify/return URLs
  try {
    const { readFileSync } = await import("node:fs");
    for (const line of readFileSync(".env", "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const i = t.indexOf("=");
      const k = t.slice(0, i);
      const v = t.slice(i + 1);
      if (
        (k === "APP_URL" ||
          k === "NEXT_PUBLIC_APP_URL" ||
          k.startsWith("PAYFAST_") ||
          k.includes("SELF_SERVE")) &&
        !process.env[k]
      ) {
        process.env[k] = v;
      }
    }
  } catch {
    /* optional */
  }

  const {
    loadPayFastProductionSecretsIntoEnv,
    runPayFastProductionPreflight,
    prepareControlledZaProjectsCheckout,
  } = await import(
    "../apps/web/lib/commercial/payfast-production-certification.ts"
  );

  const loaded = loadPayFastProductionSecretsIntoEnv();
  const preflight = runPayFastProductionPreflight();
  console.log("PREFLIGHT", JSON.stringify(preflight));
  console.log("HEALTH", JSON.stringify(loaded));

  const failed = Object.values(preflight).some((v) => v === "FAIL");
  if (failed || !loaded.configured || loaded.sandbox) {
    console.log("STOP. DO NOT SEND MONEY. Pre-flight failed.");
    process.exit(2);
  }

  const result = prepareControlledZaProjectsCheckout({
    organisationId: "org-owner-payfast-cert",
    ownerId: "user-owner-payfast-cert",
    email: process.env.PAYFAST_CERT_EMAIL?.trim() || undefined,
  });
  if (!result.ok) {
    console.log("QUOTE_FAIL", result.quote);
    process.exit(3);
  }
  console.log("CHECKOUT_SAFE", JSON.stringify(result.safe, null, 2));
  console.log(
    "FORM_PATH",
    ".secrets/payfast-certification/controlled-checkout-form.html",
  );
  console.log(
    "Open the private form file locally and submit to complete production payment.",
  );
}

main().catch((err) => {
  console.error(String(err?.message ?? err));
  process.exit(1);
});
