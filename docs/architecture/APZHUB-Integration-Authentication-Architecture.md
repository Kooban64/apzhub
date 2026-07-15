# APZHUB Integration Authentication Architecture

**Milestone:** OSS-100-02  
**Status:** Canonical authentication foundation  
**Authority:** [Platform Integration SDK Architecture](./APZHUB-Platform-Integration-SDK-Architecture.md) · [Adapter SDK Specification](../specs/APZHUB-Adapter-SDK-Specification.md)

---

## Principle

Capability Services must **never** handle vendor credentials directly.

```text
Capability Service
        ↓
Vendor Adapter
        ↓
Integration SDK — AuthenticationProvider
        ↓
CredentialResolver → SecretProvider
        ↓
Future Transport Layer (OSS-100-03+)
```

Credentials remain inside the integration boundary. They must not appear in diagnostics, errors, logs, events, or user-facing responses.

---

## Authentication modes

OSS-100-02 implements foundation validation for static credential modes. OAuth 2.0 and session cookie modes are declared at the type level only.

| Mode | Foundation validation |
|------|----------------------|
| API token / Bearer | Secret presence via `SecretProvider` |
| Basic | Password ref + username ref |
| API key header/query | Secret + header/query param metadata |
| Custom | Secret + custom scheme identifier |
| OAuth 2.0 | Rejected until OAuth phase |
| Session cookie | Rejected until browser auth phase |

---

## Secret provider bridge

| Provider | Status |
|----------|--------|
| `InMemorySecretProvider` | Tests and local dev |
| Platform Configuration | Future — via `@apzhub/config` bridge |
| Vault-compatible | `PlaceholderVaultSecretProvider` only |

No Vault integration, no credential persistence, no new secret store in OSS-100-02.

---

## Safe credential handling

| Surface | Allowed | Prohibited |
|---------|---------|------------|
| `ResolvedCredential` | `maskedPreview`, `secretPresent` | Raw secret value |
| Errors | `credentialRef`, error codes | Tokens, passwords |
| Diagnostics | mode, source type, warnings | Authorization headers |
| Logs | correlation ID, connection ID | Secret payloads |

---

## Package surface

Import: `@apzhub/integration-sdk/auth`

Key types: `AuthenticationProvider`, `CredentialResolver`, `AuthCredentialReference`, `ResolvedCredential`, `SecretProvider`.

---

## Next phase

**OSS-100-03** — Live health probe, version provider, lifecycle platform hooks, and enhanced diagnostics (still no HTTP transport for vendor APIs unless explicitly scoped).

---

## Related

- [Integration Connection Management](./APZHUB-Integration-Connection-Management.md)
- [Package AUTHENTICATION.md](../../packages/integration-sdk/docs/AUTHENTICATION.md)
- [OSS-100-02 Completion Report](../sprint/OSS-100-02-completion-report.md)
