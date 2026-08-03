# LAW-ALIGNMENT-MATRIX

| Field     | Value                |
| --------- | -------------------- |
| Programme | APZHUB-LAW-ADOPT-001 |
| Product   | APZ Law Platform     |
| Timestamp | 20260803T100641Z     |

Scale: **Aligned** · **Partially Aligned** · **Not Aligned** · **Evidence Insufficient**

| #   | Assessment area           | Classification        | Justification (evidence)                                                                                  |
| --- | ------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Engineering governance    | Partially Aligned     | LAW-001…015 historical programmes; no ENG-003 product eng authority                                       |
| 2   | Programme lifecycle       | Partially Aligned     | PBR selected Law; ADOPT-001 assessed; this alignment assessment now complete; later phases not authorised |
| 3   | Product Board governance  | Partially Aligned     | PBR-APZHUB-001 APPROVED Law; no Law `PRODUCT-STATUS.md`                                                   |
| 4   | Architecture              | **Aligned**           | Reference architecture + LAW architecture index + domain/trust/persistence RAs                            |
| 5   | Domain boundaries         | **Aligned**           | Domain model + Financial vs Law separation                                                                |
| 6   | Application services      | Partially Aligned     | `services/legal-platform/service.yaml` exists; much orchestration remains app-local                       |
| 7   | Repository model          | Partially Aligned     | Repository interfaces + adapters; memory/debt residuals                                                   |
| 8   | Events                    | Partially Aligned     | Runtime wiring + Trust events docs; only 2 `events/legal/*/event.yaml` manifests                          |
| 9   | API                       | Partially Aligned     | OpenAPI + developer packs; OpenAPI↔runtime honesty residual                                               |
| 10  | Security                  | Partially Aligned     | Integration security model + OBS-LAW hardening; some planning-status language remains                     |
| 11  | Authentication            | **Aligned**           | BetterAuth session path documented as implemented                                                         |
| 12  | RBAC                      | Partially Aligned     | Permission keys + AuthZ hardening; Trust catalogue partly planning                                        |
| 13  | Tenant isolation          | Partially Aligned     | RLS/binding present; KL-LAW-05 tenant-claim placeholder                                                   |
| 14  | Persistence               | Partially Aligned     | Strong persistence architecture + migrations; dual-mode/debt notes                                        |
| 15  | Documentation             | Partially Aligned     | Deep dual packs; status/label conflicts                                                                   |
| 16  | ES-001/002/003 compliance | Evidence Insufficient | No product ES citation / conformance pack found                                                           |
| 17  | Testing                   | Partially Aligned     | Testing strategy + extensive Vitest/Playwright; not framed as ES-001                                      |
| 18  | Certification             | Partially Aligned     | 1.0.0 PRWL packaging cert; not ENG-003/ES-002 adoption cert path                                          |
| 19  | Evidence lifecycle        | Partially Aligned     | Durable release evidence; acceptance footers inconsistent                                                 |
| 20  | Release governance        | Partially Aligned     | 1.0.0 ACCEPTED/CLOSED vs parent README “Awaiting Acceptance”                                              |
| 21  | Operational governance    | **Not Aligned**       | No standing Law OPS programme (APZQEP-OPS-001 class)                                                      |
| 22  | Monitoring                | Evidence Insufficient | Health routes + one authz runbook; no standing metrics programme                                          |
| 23  | Version management        | Partially Aligned     | Product 1.0.0; `@apzhub/search-law` 0.1.0 drift disclosed                                                 |
| 24  | Package structure         | Partially Aligned     | Coherent Law vertical; no Law `integrations/` connector pack                                              |
| 25  | Workspace model           | Partially Aligned     | Dedicated Law Workbench; ENG-003 workspace-session adoption not evidenced                                 |
| 26  | Operational readiness     | Partially Aligned     | Ops readiness docs; live post-release checks not executed by packaging                                    |

## Summary

| Classification        |  Count |
| --------------------- | -----: |
| Aligned               |      3 |
| Partially Aligned     |     18 |
| Not Aligned           |      1 |
| Evidence Insufficient |      4 |
| **Total**             | **26** |

**Enterprise compliance summary:** 3/26 Aligned (≈12%) · 18/26 Partially Aligned (≈69%) · 1 Not Aligned · 4 Evidence Insufficient.
