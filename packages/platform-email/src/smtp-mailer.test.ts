import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { resetLocalSecretsLoadForTests } from "@apzhub/config";
import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveSmtpTransportConfig } from "./smtp-config";
import { resetPlatformEmailForTests } from "./smtp-mailer";

describe("resolveSmtpTransportConfig", () => {
  afterEach(() => {
    resetPlatformEmailForTests();
  });

  it("requires host user and pass", () => {
    expect(
      resolveSmtpTransportConfig({
        SMTP_HOST: "smtp.example.com",
        SMTP_USER: "u",
        SMTP_PASS: "p a s s",
        SMTP_FROM: "from@example.com",
      }),
    ).toEqual({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      user: "u",
      pass: "pass",
      from: "from@example.com",
    });
  });

  it("returns null when incomplete", () => {
    expect(resolveSmtpTransportConfig({ SMTP_HOST: "x" })).toBeNull();
  });
});

describe("sendPlatformEmail", () => {
  afterEach(() => {
    resetPlatformEmailForTests();
    resetLocalSecretsLoadForTests();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("throws when SMTP is not configured", async () => {
    const emptySecrets = mkdtempSync(path.join(tmpdir(), "apzhub-no-secrets-"));
    vi.stubEnv("APZHUB_SECRETS_DIR", emptySecrets);
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_USER", "");
    vi.stubEnv("SMTP_PASS", "");
    resetLocalSecretsLoadForTests();
    const { sendPlatformEmail } = await import("./smtp-mailer");
    await expect(
      sendPlatformEmail({
        to: "a@example.com",
        subject: "t",
        text: "body",
      }),
    ).rejects.toThrow(/SMTP is not configured/);
  });
});
