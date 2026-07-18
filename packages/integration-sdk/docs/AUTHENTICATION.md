# Authentication — @apzhub/integration-sdk

**Milestone:** OSS-100-02  
**Import:** `@apzhub/integration-sdk/auth`

---

## Purpose

Vendor-neutral authentication contracts for all OSS adapters. Capability Services **never** handle raw credentials — adapters consume the SDK authentication layer only.

```text
Vendor Adapter → AuthenticationProvider → CredentialResolver → SecretProvider
```

---

## Authentication modes

| Mode             | OSS-100-02 status                   |
| ---------------- | ----------------------------------- |
| `api_token`      | Validated                           |
| `bearer`         | Validated                           |
| `basic`          | Validated                           |
| `api_key_header` | Validated (requires `headerName`)   |
| `api_key_query`  | Validated (requires `queryParam`)   |
| `custom`         | Validated (requires `customScheme`) |
| `oauth2`         | Type only — flows not implemented   |
| `session_cookie` | Type only — flows not implemented   |

---

## Components

### `AuthenticationProvider`

Validates credentials through `CredentialResolver` without network I/O. Returns `SdkResult<AuthenticationResult>`.

### `CredentialResolver`

Resolves `AuthCredentialReference` to safe `ResolvedCredential` (masked preview only).

### `SecretProvider`

Bridge for secret material:

| Implementation                   | Use                           |
| -------------------------------- | ----------------------------- |
| `InMemorySecretProvider`         | Tests and local development   |
| `PlaceholderVaultSecretProvider` | Future Vault integration stub |

---

## Credential safety rules

- Secrets resolved only through `SecretProvider`
- `ResolvedCredential.maskedPreview` uses last-four masking
- Errors and diagnostics **never** include token/password values
- Use `containsLikelySecret()` in tests to guard against leakage

---

## Example

```typescript
import {
  DefaultAuthenticationProvider,
  DefaultCredentialResolver,
  InMemorySecretProvider,
} from "@apzhub/integration-sdk/auth";

const secretProvider = new InMemorySecretProvider({
  secrets: { "cred/service-token": "example-token" },
});
const resolver = new DefaultCredentialResolver({ secretProvider });
const auth = new DefaultAuthenticationProvider({ credentialResolver: resolver });
```

---

## Related

- [CONNECTION-MANAGEMENT.md](./CONNECTION-MANAGEMENT.md)
- [Integration Authentication Architecture](../../../docs/architecture/APZHUB-Integration-Authentication-Architecture.md)
