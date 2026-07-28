# GitLab CI Authentication

**Milestone:** R12-TCMS-01

## Modes

| `authMode`              | Status                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| `personal_access_token` | **Implemented** — live connect via SecretProvider                   |
| `oauth`                 | Placeholder — `oauth.enabled` **must be false**; live auth rejected |

## PAT flow

1. Config: `personalAccessTokenRef` (secret reference, never raw token in config/diagnostics)
2. Factory may seed `InMemorySecretProvider` via `personalAccessToken` for tests
3. Adapter resolves token through SDK `authenticationProvider` + `SecretProvider.resolve`
4. REST client sends `Authorization: Bearer <token>` and `PRIVATE-TOKEN: <token>`

## Required scopes

Use a GitLab personal access token with at least `read_api` (and project access for the configured `projectPath` / `projectId`).

## Secrets policy

Diagnostics, logs, and health payloads **never** include token values or OAuth client secrets.
