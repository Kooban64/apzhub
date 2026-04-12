import { z } from "zod";

import { sessionCredentialStateSchema } from "@/lib/auth/session-credential-state";
import { sessionSnapshotSchema } from "@/lib/auth/session-types";

const loginOkSchema = z.object({
  ok: z.literal(true),
  defaultLandingPath: z.string(),
  canAccessAdmin: z.boolean(),
});

const loginErrSchema = z.object({
  error: z.string(),
  ssoAuthorizePath: z.string().optional(),
});

export class LoginRejectedError extends Error {
  readonly ssoAuthorizePath?: string;

  constructor(message: string, ssoAuthorizePath?: string) {
    super(message);
    this.name = "LoginRejectedError";
    this.ssoAuthorizePath = ssoAuthorizePath;
  }
}

export class AuthApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

const authErrorBodySchema = z.object({ error: z.string() });

async function readAuthErrorMessage(res: Response): Promise<string> {
  const json: unknown = await res.json().catch(() => ({}));
  const parsed = authErrorBodySchema.safeParse(json);
  return parsed.success ? parsed.data.error : res.statusText || "Request failed";
}

export async function postPasswordResetRequest(body: { email: string }): Promise<void> {
  const res = await fetch("/api/auth/password/request-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: body.email }),
  });
  if (!res.ok) {
    throw new AuthApiError(res.status, await readAuthErrorMessage(res));
  }
}

export async function postPasswordResetConfirm(body: { token: string; password: string }): Promise<void> {
  const res = await fetch("/api/auth/password/confirm-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token: body.token, password: body.password }),
  });
  if (!res.ok) {
    throw new AuthApiError(res.status, await readAuthErrorMessage(res));
  }
}

export async function postVerifyEmailRequest(body: { email: string }): Promise<void> {
  const res = await fetch("/api/auth/verify-email/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: body.email }),
  });
  if (!res.ok) {
    throw new AuthApiError(res.status, await readAuthErrorMessage(res));
  }
}

export async function postVerifyEmailConfirm(body: { token: string }): Promise<void> {
  const res = await fetch("/api/auth/verify-email/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token: body.token }),
  });
  if (!res.ok) {
    throw new AuthApiError(res.status, await readAuthErrorMessage(res));
  }
}

export const clientSessionEnvelopeSchema = z.object({
  snapshot: sessionSnapshotSchema,
  credential: sessionCredentialStateSchema,
});

export type ClientSessionEnvelope = z.infer<typeof clientSessionEnvelopeSchema>;

export async function getClientSession(): Promise<ClientSessionEnvelope> {
  const res = await fetch("/api/auth/session", { credentials: "include" });
  const json: unknown = await res.json();
  return clientSessionEnvelopeSchema.parse(json);
}

export async function postClientLogin(body: {
  email: string;
  password: string;
}): Promise<z.infer<typeof loginOkSchema>> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const json: unknown = await res.json();
  if (!res.ok) {
    const err = loginErrSchema.safeParse(json);
    if (err.success) {
      throw new LoginRejectedError(err.data.error, err.data.ssoAuthorizePath);
    }
    throw new LoginRejectedError("Login failed");
  }
  return loginOkSchema.parse(json);
}

export async function postClientLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export async function postProfileGoogleConnect(): Promise<void> {
  const res = await fetch("/api/profile/google/connect", { method: "POST", credentials: "include" });
  if (!res.ok) {
    throw new Error("Connect failed");
  }
}

export async function postProfileGoogleDisconnect(): Promise<void> {
  const res = await fetch("/api/profile/google/disconnect", { method: "POST", credentials: "include" });
  if (!res.ok) {
    throw new Error("Disconnect failed");
  }
}
