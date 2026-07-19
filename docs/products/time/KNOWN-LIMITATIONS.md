# APZ Time — Known Limitations

> **Release:** APZ Time **1.0.0** Phase 1 (**ACCEPTED / CLOSED**)  
> **Product Definition Pack**  
> **Portfolio:** [time/](./README.md)  
> **Evidence:** [docs/releases/time/1.0.0/](../../releases/time/1.0.0/README.md)  
> **Quality baseline:** [QA-002 PRODUCTION READY](../../foundation/completion-reports/APZHUB-QA-002-repository-quality-certification.md) (Owner ACCEPTED)  
> **Rule:** Do not invent functionality. Frozen architectures require ADR + Owner to change.

---

## Known limitations (repository-documented)

- **Product maturity:** **Production** — **1.0.0** Phase 1 Workbench (**ACCEPTED / CLOSED**) with documented limitations
- **Kimai `@apzhub/integration-kimai` 0.2.0:** CERTIFIED_DOMAIN — tags search partial; approvals/reporting/analytics unsupported at adapter
- **Phase 1 excludes:** Approvals · Reporting UI · Analytics · Dashboards · Notifications · Exports · Billing · Leave · Scheduling · AI · Workflow automation · Cross-product deep integrations
- **Search:** Foundation `/api/v1/time/search` composition — no dedicated Platform Search SoR publication adapter (`search-time`)
- **Time projects (`tproj_*`)** are time-domain references, not APZ Projects (`proj_*`)
- **In-memory domain:** non-production verification only — never Production SoR
- **Engine branding:** hidden in UI; diagnostics JSON redacts engine brand tokens
- **Operational:** Health/diagnostics present; dedicated product ops runbooks remain thin

## Honesty rule

Limitations must remain visible in certification and product docs. Further scope requires Owner Approval of a named release.
