# ADR-0003 — Better Auth Session Validation

> **Status:** Accepted  
> **Date:** 2026-06-29  
> **Sprint:** SPR-001 closeout

## Problem

SPR-001 middleware initially checked only for the presence of a session cookie. Cookie presence does not confirm a valid user, unexpired session, or non-revoked session in the database — weakening the Zero Trust boundary described in Document 013.

## Decision

Middleware validates sessions by calling Better Auth's **`/api/auth/get-session`** endpoint with forwarded request cookies. The handler:

1. Confirms a session record exists
2. Confirms a user record exists
3. Rejects expired sessions (`expiresAt` in the past)
4. Relies on Better Auth database lookup for revoked sessions

Server-side helpers expose `getValidatedSession()` in `@apzhub/auth/server` for route handlers.

Middleware remains on the Edge-compatible fetch path; full `createAuth()` with PostgreSQL is not invoked directly in middleware.

## Alternatives

| Alternative                                 | Why rejected                                               |
| ------------------------------------------- | ---------------------------------------------------------- |
| Cookie presence only (`getSessionCookie`)   | Insufficient validation; identified in architecture review |
| Direct Drizzle session lookup in middleware | Duplicates Better Auth logic; Edge runtime constraints     |
| JWT-only validation without DB              | Misses revocation and session invalidation                 |

## Consequences

- Unauthenticated users with stale or forged cookies are redirected to login.
- Each protected navigation incurs a get-session round trip (acceptable for foundation; optimise later).
- OAuth and SSO remain out of scope until a dedicated IAM sprint.
