# APZHUB Security Catalogue (Enterprise Architecture)

> **Programme:** APZHUB-ARCHITECTURE-001  
> **Classification:** DOCUMENTATION ONLY  
> **Authority:** Document 013 · platform-security · BetterAuth · AuthZ · governance security guides  
> **Date:** 2026-07-19

---

## Purpose

EA inventory of **security** architecture — platform controls vs future OSS security tooling.

---

## Inventory

| Component                   | On disk?                                      | Role                                    | Status                    |
| --------------------------- | --------------------------------------------- | --------------------------------------- | ------------------------- |
| **Authentication**          | Yes — BetterAuth (`@apzhub/auth`)             | User AuthN; SSO handoff                 | **Production**            |
| **Authorisation**           | Yes — `@apzhub/platform-authorization`        | Permissions / roles (platform-owned)    | **Production**            |
| **Identity Administration** | Yes — identity-* SoR                          | Admin plane (not login UX)              | **Frozen** PRWL           |
| **Secrets**                 | Secret provider refs; no secrets in repo      | Credential hygiene                      | **Operational** standard  |
| **Security headers / CSP**  | `@apzhub/platform-security` · central headers | XSS/CSP controls                        | **Operational**           |
| **Zero Trust pipeline**     | RequestPipeline Auth→Authz→Validation         | Every API                               | **Operational**           |
| **Security Reviews**        | `docs/reviews/` · programme security reviews  | Gate artefacts                          | **Operational** (process) |
| **Session security**        | Session guides under governance               | Session policy                          | **Documented**            |
| **Faraday**                 | **No** package                                | Security Ops platform (planned Wave 8)  | **Concept / Planned**     |
| **MobSF**                   | **No** package                                | Mobile security (planned Wave 9)        | **Concept / Planned**     |
| **Greenbone**               | **No** package                                | Vulnerability scanning (planned Wave 8) | **Concept / Planned**     |
| **Future security tooling** | —                                             | Enterprise add-on track                 | **Concept**               |

---

## Rules

1. Never expose backend engine security UIs to standard users.
2. Superadmin is an explicit audited tier — not a bypass.
3. Security OSS adapters require Owner-approved programmes + Integration SDK compliance.

---

## Related

- [OBSERVABILITY-CATALOGUE.md](./OBSERVABILITY-CATALOGUE.md)
- [INTEGRATION-CATALOGUE.md](./INTEGRATION-CATALOGUE.md)
- Security ops guides under `docs/governance/`
