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
- **Search:** Foundation `/api/v1/time/search` composition remains; Platform Search publication adapter `@apzhub/search-time` **0.1.0** (R12-SEARCH-01) maps Time entities → Search Integration Framework. **Platform-1.3-ENG-001** wires composition-root hooks → publication journal → live drain (enable `APZHUB_SEARCH_ORCHESTRATION_ENABLED`). Billing/rates/financial fields and Kimai identifiers are never published.
- **Time projects (`tproj_*`)** are time-domain references, not APZ Projects (`proj_*`)
- **In-memory domain:** non-production verification only — never Production SoR
- **Engine branding:** hidden in UI; diagnostics JSON redacts engine brand tokens
- **Operational:** Health/diagnostics present; dedicated product ops runbooks remain thin

## Honesty rule

Limitations must remain visible in certification and product docs. Further scope requires Owner Approval of a named release.
