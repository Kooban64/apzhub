# APZHUB Session Security Architecture (PRH-006)

## Purpose

Harden platform session handling through canonical policy owned by `@apzhub/auth` with diagnostics consumed by `@apzhub/platform-security`.

## Owner

| Concern | Owner |
|---------|-------|
| Session policy & Better Auth config | `@apzhub/auth` |
| Tenant binding resolution | `@apzhub/auth` + `@apzhub/platform-identity` |
| Session diagnostics in security probes | `@apzhub/platform-security` |
| Law API session consumption | `withLawApiAuth` → `getValidatedSession` |

## Components

```
@apzhub/auth
├── session-policy.ts        — canonical timeouts, cookie policy, env profiles
├── session-diagnostics.ts   — posture + recommendations (no secrets)
├── session-validation.ts    — active/expired/tenant consistency checks
├── middleware-session.ts    — edge-safe middleware fetch helper
└── server.ts                — Better Auth config from policy
```

## Timeout policy

| Control | Value |
|---------|-------|
| Absolute timeout | 7 days |
| Idle / sliding refresh | 1 day (`updateAge`) |
| Cookie cache | 5 minutes |

## Cookie policy (production)

| Attribute | Value |
|-----------|-------|
| Secure | true |
| HttpOnly | true |
| SameSite | lax |
| Path | / |

Development relaxes `Secure` for localhost.

## Tenant binding

1. `user.activeTenantId`
2. Primary DB membership
3. In-memory resolver fallback

Law APIs require enriched session via `getValidatedSession`. Development tenant fallback is blocked in production.

## Fixation mitigation

Better Auth rotates session tokens on login (`fixationMitigation: session_rotation_on_login`).

## References

- [Session Policy Guide](../governance/APZHUB-Session-Policy-Guide.md)
- [Session Security Developer Guide](../governance/APZHUB-Session-Security-Developer-Guide.md)
