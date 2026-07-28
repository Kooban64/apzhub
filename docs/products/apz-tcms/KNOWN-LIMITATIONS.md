# APZ TCMS — Known Limitations (Release 1.0.0)

> **Product:** APZ TCMS  
> **Version:** **1.0.0**  
> **Programme:** APZ-TCMS-002 (packaging) · planning APZ-TCMS-001 **ACCEPTED**  
> **Certification class:** PRODUCTION_READY_WITH_LIMITATIONS  
> **Date:** 2026-07-19  
> **Authority:** APZTCMS vertical certifications · ADR-0059 · inventory

---

## Release 1.0.0 limitations

1. **Native SoR** — not Kiwi TCMS; no Kiwi adapter on disk
2. **GHA CI path** — certified **PRODUCTION_READY_WITH_LIMITATIONS** as read-only CI/CD metadata (APZTCMS-019); not a full GitHub admin console; dispatch/rerun/cancel excluded
3. **GitLab CI** — Release **1.0.0** product packaging excluded GitLab; Release **1.2** engineering delivers `@apzhub/integration-gitlab-ci` **0.1.0** metadata/read-only Reference Adapter (R12-TCMS-01) — dispatch/rerun/cancel/download remain unsupported; not a full GitLab admin console
4. **AI Assist** — deferred; AI must never auto-certify
5. **TCMS orchestrates** — does not become Vitest/Playwright/Jest/etc.
6. **Cross-product deep wiring** (Workflow execute, Analytics BI, Documents binary, Notifications delivery) — partial/later
7. **Slice-level PRWL** — individual vertical certifications retain documented limitations

---

## Honesty rule

Limitations must remain visible in certification and product docs. Do not silently treat limited surfaces as complete multi-CI or AI-assisted TCMS.

---

## Related

- [Release Notes](../../releases/tcms/APZ-TCMS-1.0-RELEASE-NOTES.md)
- [Certification Report](../../releases/tcms/1.0.0/CERTIFICATION-REPORT.md)
