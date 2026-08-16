# SPR-UX-PHASE-K — Create-user wizard (Stream 6 §§31–39)

> **Status:** **COMPLETE · CERTIFIED 100%** — 2026-08-16  
> **Authority:** [UX-STREAM-006 §§31–39](../ux/UX-STREAM-006-tenant-identity-rbac-administration.md) · [S6-04](./SPR-UX-STREAM-006-tenant-identity-rbac-administration.md) · [OWNER programme order](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md)  
> **Prerequisite:** [SPR-IAM-COMMERCIAL-001](./SPR-IAM-COMMERCIAL-001-sprint-guide.md) **ACCEPTED** · Phases I–J Inspector certified  
> **Does not:** Teams inheritance · access-request workflows · BetterAuth session admin · parked APZPEN enterprise

## Objective

Replace the flat Org Admin invite form with a **review-before-provision** wizard:

Identity → Template → Products → Resource scopes → Source scopes → Professional Tools → **Review** → Provision.

## Ships

| ID  | Ship                                                               | Exit                        |
| --- | ------------------------------------------------------------------ | --------------------------- |
| K0  | Sprint + gap map + registry                                        | Docs live                   |
| K1  | Multi-step wizard UI on Org Admin members                          | Review step before submit   |
| K2  | API overlays: resource/source scope grants + professional tool ids | Effective after provision   |
| K3  | Unit cert + gap-map closeout                                       | Vitest green; map CERTIFIED |

## Definition of Done

- Wizard collects all Stream 6 create-user steps and shows a review summary before create.
- Provision path remains BetterAuth + PermissionService + product grants (no parallel IAM).
- Scope grants use `support.queue:` / `projects.project:` / `source.repo:` only.
- Professional Tools grants require reason + expiry (wizard supplies defaults).
- Provider brands never appear in the wizard.
- Gap map certified; tests pass.
