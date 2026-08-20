/**
 * SPR-IAM-COMMERCIAL-001 — PayFast adapter (Integration SDK boundary).
 * Never stores card PAN. Signature verification for ITN.
 */

import { createHash } from "node:crypto";

import type { EnvVars } from "@/lib/env-vars";
export type PayFastConfig = {
  readonly merchantId: string;
  readonly merchantKey: string;
  readonly passphrase: string;
  readonly sandbox: boolean;
  readonly returnUrl: string;
  readonly cancelUrl: string;
  readonly notifyUrl: string;
};

export function resolvePayFastConfig(env: EnvVars = process.env): PayFastConfig {
  const appUrl =
    env.APP_URL?.trim() || env.NEXT_PUBLIC_APP_URL?.trim() || "http://127.0.0.1:3300";
  return {
    merchantId: env.PAYFAST_MERCHANT_ID?.trim() || "10000100",
    merchantKey: env.PAYFAST_MERCHANT_KEY?.trim() || "46f0cd694581a",
    passphrase: env.PAYFAST_PASSPHRASE?.trim() || "",
    sandbox: (env.PAYFAST_SANDBOX ?? "true").toLowerCase() !== "false",
    returnUrl: `${appUrl}/checkout/processing?payfast=return`,
    cancelUrl: `${appUrl}/checkout/fail?payfast=cancel`,
    notifyUrl: `${appUrl}/api/v1/billing/payfast/itn`,
  };
}

export type PayFastCheckoutRequest = {
  readonly amountCents: number;
  readonly itemName: string;
  readonly invoiceId: string;
  readonly email?: string;
};

export type PayFastCheckoutSession = {
  readonly processUrl: string;
  readonly fields: Readonly<Record<string, string>>;
  readonly signature: string;
  readonly mode: "sandbox" | "live";
  /** Form POST (classic) or onsite when merchant enables PayFast Onsite. */
  readonly integration: "form" | "onsite";
};

function md5(value: string): string {
  return createHash("md5").update(value).digest("hex");
}

/** PayFast signature over parameter string (simplified, deterministic for tests). */
export function signPayFastParams(
  params: Record<string, string>,
  passphrase: string,
): string {
  const pairs = Object.keys(params)
    .filter((key) => key !== "signature" && params[key] !== "")
    .sort()
    .map((key) => `${key}=${encodeURIComponent(params[key]!).replace(/%20/g, "+")}`);
  let paramString = pairs.join("&");
  if (passphrase) {
    paramString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`;
  }
  return md5(paramString);
}

/**
 * Classic custom integration (form POST). Prefer Onsite when
 * `PAYFAST_PAYMENT_MODE=onsite` and merchant supports it — APZ never stores PAN.
 */
export function createPayFastCheckout(
  input: PayFastCheckoutRequest,
  env: EnvVars = process.env,
): PayFastCheckoutSession {
  const config = resolvePayFastConfig(env);
  const amount = (input.amountCents / 100).toFixed(2);
  const fields: Record<string, string> = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: config.returnUrl,
    cancel_url: config.cancelUrl,
    notify_url: config.notifyUrl,
    amount,
    item_name: input.itemName.slice(0, 100),
    m_payment_id: input.invoiceId,
    email_address: input.email ?? "",
  };
  const signature = signPayFastParams(fields, config.passphrase);
  fields.signature = signature;
  const onsite = (env.PAYFAST_PAYMENT_MODE ?? "form").toLowerCase() === "onsite";
  const processUrl = onsite
    ? config.sandbox
      ? "https://sandbox.payfast.co.za/onsite/process"
      : "https://www.payfast.co.za/onsite/process"
    : config.sandbox
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";
  return {
    processUrl,
    fields,
    signature,
    mode: config.sandbox ? "sandbox" : "live",
    integration: onsite ? "onsite" : "form",
  };
}

export function verifyPayFastItn(
  params: Record<string, string>,
  env: EnvVars = process.env,
): boolean {
  const config = resolvePayFastConfig(env);
  const provided = params.signature;
  if (!provided) return false;
  const copy = { ...params };
  delete copy.signature;
  const expected = signPayFastParams(copy, config.passphrase);
  return expected === provided;
}

export type PayFastHealth = {
  readonly ok: boolean;
  readonly configured: boolean;
  readonly sandbox: boolean;
  readonly detail: string;
};

export function getPayFastHealth(env: EnvVars = process.env): PayFastHealth {
  const config = resolvePayFastConfig(env);
  const configured = Boolean(
    env.PAYFAST_MERCHANT_ID?.trim() && env.PAYFAST_MERCHANT_KEY?.trim(),
  );
  return {
    ok: true,
    configured,
    sandbox: config.sandbox,
    detail: configured
      ? "PayFast merchant credentials present"
      : "Using sandbox defaults — set PAYFAST_MERCHANT_ID / KEY for live",
  };
}
