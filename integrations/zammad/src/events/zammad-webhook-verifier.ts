/**
 * Zammad CE webhook signature verifier (APZHUB-ENG-0003 / R12-SUP-01).
 * ADR-0055 — HMAC-SHA1 over raw body; header X-Hub-Signature (`sha1=`).
 */

import { createHmac, timingSafeEqual } from "node:crypto";

import type { SecretProvider } from "@apzhub/integration-sdk";
import {
  webhookVerificationFailedError,
  type ResolveSecretHook,
  type WebhookVerificationRequest,
  type WebhookVerificationResult,
  type WebhookVerifier,
} from "@apzhub/integration-sdk/events";

export const ZAMMAD_WEBHOOK_SIGNATURE_HEADER = "x-hub-signature";
export const ZAMMAD_WEBHOOK_DELIVERY_HEADER = "x-zammad-delivery";
export const ZAMMAD_WEBHOOK_SECRET_CREDENTIAL_REF = "zammad.webhook.signature_token";

export interface ZammadWebhookVerifierOptions {
  readonly secretProvider?: SecretProvider;
  readonly resolveSecret?: ResolveSecretHook;
}

function toBuffer(body: string | Uint8Array): Buffer {
  return typeof body === "string" ? Buffer.from(body, "utf8") : Buffer.from(body);
}

function headerValue(
  headers: Readonly<Record<string, string>>,
  name: string,
): string | undefined {
  const direct = headers[name];
  if (direct) return direct;
  const lower = name.toLowerCase();
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === lower);
  return entry?.[1];
}

/**
 * Verify Zammad CE webhook signatures (HMAC-SHA1, `sha1=<hex>`).
 * Fail closed when secret or signature is missing.
 */
export function createZammadWebhookVerifier(
  options: ZammadWebhookVerifierOptions = {},
): WebhookVerifier {
  return {
    async verify(
      request: WebhookVerificationRequest,
    ): Promise<WebhookVerificationResult> {
      const correlationId = request.correlationId;
      let secret: string | undefined;

      if (options.resolveSecret) {
        secret = await options.resolveSecret({
          secretRef: request.secretRef,
          tenantId: request.tenantId,
          correlationId,
        });
      } else if (options.secretProvider) {
        const resolved = await options.secretProvider.resolve({
          credentialRef: request.secretRef.credentialRef,
          tenantId: request.tenantId,
          correlationId,
        });
        secret = resolved.ok ? resolved.value.value : undefined;
      }

      if (!secret) {
        return {
          status: "missing_secret",
          ok: false,
          reason: "secret_not_resolved",
          error: webhookVerificationFailedError(
            { correlationId },
            "Zammad webhook signature_token could not be resolved",
          ),
        };
      }

      const provided =
        request.signatureHeader ??
        headerValue(request.headers, ZAMMAD_WEBHOOK_SIGNATURE_HEADER);

      if (!provided) {
        return {
          status: "missing_signature",
          ok: false,
          reason: "signature_header_missing",
          error: webhookVerificationFailedError(
            { correlationId },
            "X-Hub-Signature header missing",
          ),
        };
      }

      const body = toBuffer(request.rawBody);
      const digest = createHmac("sha1", secret).update(body).digest("hex");
      const providedNormalized = provided.replace(/^sha1=/i, "").trim();
      const expectedBuf = Buffer.from(digest, "utf8");
      const providedBuf = Buffer.from(providedNormalized, "utf8");

      const matches =
        expectedBuf.length === providedBuf.length &&
        timingSafeEqual(expectedBuf, providedBuf);

      if (!matches) {
        return {
          status: "failed",
          ok: false,
          algorithm: "sha1",
          reason: "signature_mismatch",
          error: webhookVerificationFailedError({ correlationId }),
        };
      }

      return {
        status: "verified",
        ok: true,
        algorithm: "sha1",
      };
    },
  };
}

/** Compute Zammad CE `sha1=` signature for tests. */
export function computeZammadWebhookSignature(
  secret: string,
  rawBody: string | Uint8Array,
): string {
  const digest = createHmac("sha1", secret).update(toBuffer(rawBody)).digest("hex");
  return `sha1=${digest}`;
}
