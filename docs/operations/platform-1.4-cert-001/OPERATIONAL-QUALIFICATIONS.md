# Operational Qualifications — Platform-1.4-CERT-001

> Qualifications are **not** Platform defects. Operators and release procedures must honour them.

## OQ-BLD-001 — Production build environment

| Field      | Value                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------ |
| Source     | Platform-1.4-BLD-001 **ACCEPTED**                                                          |
| Trigger    | Shell / IDE exports `NODE_ENV=development` during `pnpm build`                             |
| Symptom    | Next.js 16 `/_global-error` prerender `useContext` null                                    |
| Ownership  | Environment (primary) · Framework (contributing)                                           |
| Mitigation | `env -u NODE_ENV pnpm build` · CI uses `NODE_ENV=test` (compatible)                        |
| Deferred   | Optional Repository/Tooling harden of build script (requires separate Owner authorisation) |

## OQ-PW-001 — Product Playwright residuals

| Field     | Value                                            |
| --------- | ------------------------------------------------ |
| Source    | Platform-1.4-REM-001 OR-DEF-004                  |
| Items     | APZ Notify / APZ TCMS / APZ Support UI residuals |
| Ownership | Product backlogs — **not Platform**              |
| Platform  | Action **CLOSED**                                |

## OQ-DUR-001 — Durable delivery enablement posture

| Field        | Value                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------ |
| Status       | Durable runtime **implemented**; feature flag **defaults OFF**; process-local **retained** |
| Intent       | Design freeze through Platform 1.4 close — enablement requires separate named Approval     |
| Not a defect | Schema migrations 0065–0067 present; admin/ops surfaces exist with flag OFF                |

## OQ-SCOPE-001 — Retained Platform freezes

Inherited / retained exclusions remain binding:

- Integration SDK **1.0.0** frozen
- Workflow Execute gated
- Email SoR excluded · SMTP deferred
- FIN-001 STOP · WebSockets unauthorised
- ENG-001B-P5 **PROPOSED / BLOCKED** (not certified as delivered)
