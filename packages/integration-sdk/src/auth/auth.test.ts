import { describe, expect, it } from "vitest";

import {
  DefaultAuthenticationProvider,
  DefaultCredentialResolver,
  InMemorySecretProvider,
  PlaceholderVaultSecretProvider,
  buildAuthenticationDiagnostics,
  containsLikelySecret,
  maskSecretValue,
} from "./index";

const correlationId = "corr-auth-001";
const tenantId = "tenant-a";
const rawSecret = "super-secret-token-value";

function createAuthStack(
  secrets: Record<string, string>,
  usernames?: Record<string, string>,
) {
  const secretProvider = new InMemorySecretProvider({ secrets, usernames });
  const credentialResolver = new DefaultCredentialResolver({ secretProvider });
  const authenticationProvider = new DefaultAuthenticationProvider({
    credentialResolver,
  });
  return { secretProvider, credentialResolver, authenticationProvider };
}

describe("authentication credential resolver", () => {
  it("validates bearer token credentials", async () => {
    const { credentialResolver } = createAuthStack({ "ref/bearer": rawSecret });

    const result = await credentialResolver.resolve({
      tenantId,
      correlationId,
      credential: {
        credentialRef: "ref/bearer",
        authenticationMode: "bearer",
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.secretPresent).toBe(true);
      expect(result.value.maskedPreview).toBe("****alue");
      expect(result.value.maskedPreview).not.toContain(rawSecret);
    }
  });

  it("validates api_token credentials", async () => {
    const { credentialResolver } = createAuthStack({ "ref/token": rawSecret });

    const result = await credentialResolver.resolve({
      tenantId,
      correlationId,
      credential: { credentialRef: "ref/token", authenticationMode: "api_token" },
    });

    expect(result.ok).toBe(true);
  });

  it("validates basic authentication credentials", async () => {
    const { credentialResolver } = createAuthStack(
      { "ref/password": "password123" },
      { "ref/user": "admin" },
    );

    const result = await credentialResolver.resolve({
      tenantId,
      correlationId,
      credential: {
        credentialRef: "ref/password",
        authenticationMode: "basic",
        usernameRef: "ref/user",
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.usernamePresent).toBe(true);
    }
  });

  it("rejects missing credentials", async () => {
    const { credentialResolver } = createAuthStack({});

    const result = await credentialResolver.resolve({
      tenantId,
      correlationId,
      credential: { credentialRef: "missing", authenticationMode: "bearer" },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toMatch(
        /missing_credentials|secret_provider_unavailable/,
      );
      expect(result.error.message).not.toContain(rawSecret);
    }
  });

  it("rejects unsupported oauth2 mode", async () => {
    const { credentialResolver } = createAuthStack({ oauth: "token" });

    const result = await credentialResolver.resolve({
      tenantId,
      correlationId,
      credential: { credentialRef: "oauth", authenticationMode: "oauth2" },
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("integration.auth.unsupported_mode");
    }
  });

  it("masks credentials and keeps secrets out of errors", async () => {
    const { authenticationProvider } = createAuthStack({});

    const auth = await authenticationProvider.authenticate({
      tenantId,
      integrationId: "example-engine",
      connectionId: "conn-1",
      correlationId,
      credential: { credentialRef: "missing", authenticationMode: "api_token" },
    });

    expect(auth.ok).toBe(false);
    if (!auth.ok) {
      expect(containsLikelySecret(auth.error.message, rawSecret)).toBe(false);
      expect(JSON.stringify(auth.error.details ?? {})).not.toContain(rawSecret);
    }

    expect(maskSecretValue(rawSecret)).not.toBe(rawSecret);
  });

  it("reports placeholder vault provider as unavailable", async () => {
    const provider = new PlaceholderVaultSecretProvider();
    const result = await provider.resolve({
      credentialRef: "vault/ref",
      tenantId,
      correlationId,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("integration.auth.secret_provider_unavailable");
    }
  });

  it("builds safe authentication diagnostics", () => {
    const diagnostics = buildAuthenticationDiagnostics({
      configured: true,
      authenticationMode: "bearer",
      credentialSourceType: "static",
      secretPresent: false,
      credentialRef: "ref/bearer",
      maskedPreview: "****",
    });

    expect(diagnostics.secretPresent).toBe(false);
    expect(diagnostics.warnings.length).toBeGreaterThan(0);
    expect(JSON.stringify(diagnostics)).not.toContain(rawSecret);
  });
});
