# APZHUB Security Operations

> **Programme:** APZHUB-OPERATIONS-001  
> **Date:** 2026-07-20  
> **Authority:** Document **013** Zero Trust

---

## Scope

SecOps for Production APZHUB: identity abuse, AuthZ anomalies, secret exposure, TLS, supply-chain, adapter credential hygiene.

## Controls (operate)

| Control           | Practice                                          |
| ----------------- | ------------------------------------------------- |
| Least privilege   | Roles/permissions; dedicated worker identities    |
| Secrets           | Never in repo/logs; rotate on suspicion           |
| Superadmin        | Explicit tier; audited; not a bypass              |
| TLS               | Mandatory at edge                                 |
| CSRF/XSS/SQL/file | Central platform controls                         |
| AuthZ             | Server authoritative; Law path hardened (1.1-001) |

## SecOps incident classes

| Class                  | Example                 | Response                       |
| ---------------------- | ----------------------- | ------------------------------ |
| Credential leak        | Key in log/ticket       | Rotate, revoke sessions, audit |
| Privilege escalation   | Unexpected `*` grants   | Disable account, AuthZ review  |
| Engine brand/data leak | Raw backend error to UI | Patch + Problem                |
| Host compromise        | Unexpected process/port | Isolate, DR if needed          |

## Forbidden

Security must **not** disable AuthZ “to keep the business running.” Continuity fails closed.
