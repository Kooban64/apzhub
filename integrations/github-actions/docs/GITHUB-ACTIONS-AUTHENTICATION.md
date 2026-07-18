# GitHub Actions Authentication

**Milestone:** APZTCMS-016

## Modes

| `authMode`              | Status                                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `personal_access_token` | **Implemented** — live connect via SecretProvider                                                                             |
| `github_app`            | Placeholder — config shape validated (`appIdRef`, `installationIdRef`, `privateKeyRef`); live connect returns not implemented |
| `oauth`                 | Placeholder — `oauth.enabled` **must be false**; live auth rejected                                                           |

## PAT flow

1. Config: `personalAccessTokenRef` (secret reference, never raw token in config/diagnostics)
2. Factory may seed `InMemorySecretProvider` via `personalAccessToken` for tests
3. Adapter resolves token through SDK `authenticationProvider` + `SecretProvider.resolve`
4. REST client sends `Authorization: Bearer <token>`

## Required headers

- `Accept: application/vnd.github+json`
- `X-GitHub-Api-Version: 2022-11-28`

## Secrets policy

Diagnostics, logs, and health payloads **never** include token values or private keys.
