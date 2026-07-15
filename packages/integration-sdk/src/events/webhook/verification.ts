import { createHmac, timingSafeEqual } from "node:crypto";

import type { SecretProvider } from "../../auth/secret-provider";
import type { EventError } from "../errors";
import { webhookVerificationFailedError } from "../errors";
import type { WebhookSecretRef } from "./types";

export type WebhookVerificationStatus =
  "verified" | "failed" | "skipped" | "missing_signature" | "missing_secret";

export interface WebhookVerificationRequest {
  readonly rawBody: string | Uint8Array;
  readonly headers: Readonly<Record<string, string>>;
  readonly signatureHeader?: string;
  readonly timestampHeader?: string;
  readonly secretRef: WebhookSecretRef;
  readonly correlationId: string;
  readonly tenantId: string;
  readonly algorithm?: string;
}

export interface WebhookVerificationResult {
  readonly status: WebhookVerificationStatus;
  readonly ok: boolean;
  readonly algorithm?: string;
  readonly reason?: string;
  readonly error?: EventError;
}

export interface WebhookVerifier {
  verify(request: WebhookVerificationRequest): Promise<WebhookVerificationResult>;
}

export interface ResolveSecretHook {
  (input: {
    readonly secretRef: WebhookSecretRef;
    readonly tenantId: string;
    readonly correlationId: string;
  }): Promise<string | undefined>;
}

export interface MockHmacWebhookVerifierOptions {
  readonly secretProvider?: SecretProvider;
  readonly resolveSecret?: ResolveSecretHook;
  readonly signatureHeaderName?: string;
  readonly timestampHeaderName?: string;
  readonly algorithm?: string;
  readonly encoding?: "hex" | "base64";
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
 * Generic HMAC webhook verifier for tests and adapter reference implementations.
 * Not provider-specific (Plane/Zammad supply their own header conventions).
 */
export function createMockHmacWebhookVerifier(
  options: MockHmacWebhookVerifierOptions = {},
): WebhookVerifier {
  const signatureHeaderName = options.signatureHeaderName ?? "x-webhook-signature";
  const algorithm = options.algorithm ?? "sha256";
  const encoding = options.encoding ?? "hex";

  return {
    async verify(request) {
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
            "Webhook secret could not be resolved",
          ),
        };
      }

      const provided =
        request.signatureHeader ?? headerValue(request.headers, signatureHeaderName);

      if (!provided) {
        return {
          status: "missing_signature",
          ok: false,
          reason: "signature_header_missing",
          error: webhookVerificationFailedError(
            { correlationId },
            "Webhook signature header missing",
          ),
        };
      }

      const body = toBuffer(request.rawBody);
      const digest = createHmac(request.algorithm ?? algorithm, secret)
        .update(body)
        .digest(encoding);

      const providedNormalized = provided.replace(/^sha256=/i, "");
      const expectedBuf = Buffer.from(digest, "utf8");
      const providedBuf = Buffer.from(providedNormalized, "utf8");

      const matches =
        expectedBuf.length === providedBuf.length &&
        timingSafeEqual(expectedBuf, providedBuf);

      if (!matches) {
        return {
          status: "failed",
          ok: false,
          algorithm: request.algorithm ?? algorithm,
          reason: "signature_mismatch",
          error: webhookVerificationFailedError({ correlationId }),
        };
      }

      return {
        status: "verified",
        ok: true,
        algorithm: request.algorithm ?? algorithm,
      };
    },
  };
}

/** Compute HMAC signature for test fixtures. */
export function computeMockHmacSignature(
  secret: string,
  rawBody: string | Uint8Array,
  options: { readonly algorithm?: string; readonly encoding?: "hex" | "base64" } = {},
): string {
  const algorithm = options.algorithm ?? "sha256";
  const encoding = options.encoding ?? "hex";
  return createHmac(algorithm, secret).update(toBuffer(rawBody)).digest(encoding);
}
