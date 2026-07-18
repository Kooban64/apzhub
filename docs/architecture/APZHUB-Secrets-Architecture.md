# APZHUB Secrets Architecture (PRH-004)

## Purpose

Define how the Platform classifies, validates, masks, and diagnoses secrets without implementing an external vault.

## Ownership

`@apzhub/config/governance` — secret classification registry and masking utilities.

## Secret classifications

| Class               | Examples                                | Diagnostics                            |
| ------------------- | --------------------------------------- | -------------------------------------- |
| `secret`            | `BETTER_AUTH_SECRET`                    | Masked preview, weak-length detection  |
| `connection-string` | `DATABASE_URL`, `REDIS_URL`             | URL credential redaction               |
| `credential`        | Reserved for future service credentials | Masked preview                         |
| `public`            | `NEXT_PUBLIC_*`                         | Full value permitted in client context |
| `none`              | `NODE_ENV`, `PORT`                      | No masking required                    |

## Masking rules

- Secrets never appear in validation error messages (`redactSecretsInMessage`)
- Diagnostics expose `maskedPreview` only
- Connection strings redact username/password components
- Operations APIs must not return raw secret values

## Validation

- `BETTER_AUTH_SECRET` minimum length: 32 characters
- Production profile requires strong secrets (`requireStrongSecrets: true`)
- Development profile may warn instead of fail for schema issues

## Vault abstraction (future)

```typescript
interface SecretVaultProvider {
  readonly name: string;
  getSecret(key: string): Promise<string | undefined>;
  listConfiguredKeys(): Promise<readonly string[]>;
}
```

**Current provider:** `ProcessEnvironmentSecretProvider` (`environment`)

Vault integration is deferred to **PCv2-04**. Environment variables remain authoritative in PRH-004.

## Diagnostics

`getConfigurationDiagnostics().secrets` reports per-key:

- `present`
- `status`: `configured` | `missing` | `weak`
- `maskedPreview`

## References

- [Configuration Architecture](./APZHUB-Configuration-Architecture.md)
- [Security Operations Guide](../governance/APZHUB-Security-Operations-Guide.md)
