# APZHUB IAM quick reference

One-page lookup derived from [007](./007-identity-authentication-authorisation-rbac-architecture.md).

## Identity is platform capability — not a module

BetterAuth = **authentication only**. Permissions, roles, provisioning, audit = **APZHUB**.

No alternative auth/authz without approval.

## Core services

Identity · Authorisation · Permission · Role · Provisioning · Session · Audit + Adapters

**PermissionService** → drives permission-filtered UI (005).

## SSO & seamless UX (critical)

| Requirement             | Detail                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Single login            | User authenticates once via BetterAuth / APZHUB                                                                     |
| No engine login screens | Standard users never see Plane/Kimai/Zammad/etc. login                                                              |
| Per-engine config       | Many engines need extra SSO setup (SAML, OIDC, forward-auth, tokens, outposts) — **APZHUB owns and documents this** |
| Silent handoff          | Token/proxy/session exchange automatic from user perspective                                                        |
| Masking                 | Engine auth errors → platform messages; no raw 401 pages                                                            |
| Adapter docs            | Each engine: auth mode, config keys, provisioning prereqs, limitations, health                                      |

Legacy host uses Authentik today — migration to BetterAuth-centred SSO planned per engine.

## Auth vs authorisation

**Authentication** (BetterAuth) → who you are — **does not grant permissions**.

**Authorisation** (APZHUB) → what you can do.

## Session

Secure cookies · HttpOnly · SameSite · expiry · sliding · revocation · device tracking · concurrent sessions.

## User lifecycle

Pending · invited · active · suspended · locked · disabled · archived · deleted — auditable transitions.

## Platform roles (broad)

Platform Administrator · Administrator · Manager · Supervisor · Employee · Support Agent · Auditor · Compliance Officer · Executive · Developer

→ map to **granular permissions** (`project.create`, `ticket.view`, …).

## Service roles (internal only)

Plane/Kimai/Zammad/Paperless/Kiwi/Metabase native roles — never shown in UI; translated via Role Service.

```
Platform Role → Permission Set → Service Mapping → Backend Role
```

User may have **different service roles per engine**.

## Superadmin

**Not a normal user** — special permission tier; explicit superadmin permissions; admin/diagnostic/SSO config surfaces; fully audited; **not a security bypass**.

## Permission evaluation pipeline

```
Auth → Session → Roles → Permissions → Policies → Business Logic → Audit → Response
```

Frontend never evaluates backend permissions directly.

## Policy engine (contextual)

Department · business unit · project membership · document ownership · time · approval chains · location (future).

## Provisioning

Create/update/disable backend accounts · sync · retry · audit — **idempotent**.

States: not assigned · pending · provisioning · provisioned · synchronising · failed · suspended · revoked.

## Service registration (each adapter)

Supported roles · permissions · provisioning · auth method · health · API version.

## Audit (immutable)

Login/logout/failures · password · role/permission changes · provisioning · revocation · admin override.

## Security events

Suspicious login · repeated failures · privilege escalation · role changes · provisioning failures · permission violations.

## Future multi-tenancy

Orgs · isolated identities · tenant roles/permissions/provisioning — no IAM redesign.

## Identity APIs

Auth · users · roles · permissions · provisioning · sessions · policies · audit — all endpoints auth + authz.

## Testing

Unit · integration · API · security · Playwright auth · permission matrix · provisioning · regression · **per-engine SSO handoff**.

## Acceptance highlights

One login · platform permissions everywhere · auto backend role translation · auditable provisioning · silent engine SSO · documented engine auth config · superadmin distinct from users.
