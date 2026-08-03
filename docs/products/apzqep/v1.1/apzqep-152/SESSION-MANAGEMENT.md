# Session Management — APZQEP-152

| Field     | Value                                 |
| --------- | ------------------------------------- |
| Programme | APZQEP-152                            |
| Artefact  | SESSION-MANAGEMENT                    |
| Timestamp | 20260803T064000Z                      |
| Policy    | `packages/auth/src/session-policy.ts` |

---

## Policy summary

| Setting                | Value                                                                     |
| ---------------------- | ------------------------------------------------------------------------- |
| Absolute timeout       | 7 days (`604800` s)                                                       |
| Idle / sliding refresh | 24 hours (`86400` s)                                                      |
| Cookie cache           | 5 minutes                                                                 |
| httpOnly               | always `true`                                                             |
| secure                 | `true` in production; relaxed in development                              |
| sameSite               | `lax`                                                                     |
| Fixation mitigation    | `session_rotation_on_login`                                               |
| Dev registration       | Blocked in production; opt-in via `ALLOW_DEV_REGISTRATION` in development |

## Cap API use of session

1. Cookie session validated by Better Auth / `authenticatePlatformApiRequest`.
2. Invalid or missing session → **401** (JSON; no HTML login redirect on `/api/v1/*`).
3. Tenant enrichment feeds Cap tenant binding.
4. Authorization bridge enabled — Cap path additionally resolves permissions via `resolveSessionAuthorization`.

## Logout / expiry

Expired or logged-out sessions fail authentication. Cap handlers do not implement a separate session store.

## Transport

TLS is assumed at the edge (Caddy). Not Cap-specific; unchanged by APZQEP-152.
