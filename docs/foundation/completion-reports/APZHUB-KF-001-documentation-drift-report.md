# APZHUB-KF-001 — Documentation Drift Report

> **Programme:** APZHUB-KF-001 Knowledge Foundation Reconciliation  
> **Date:** 2026-07-18  
> **Authority:** Repository implementation + `package.json` + completion reports  
> **Outcome:** Drift items below were **resolved** in the listed documents

---

## Method

Compared Knowledge Foundation / backlog / index documents against:

1. Disk `package.json` versions
2. Presence/absence of `integrations/*`
3. Completion reports and Architecture Freeze Notices
4. CURRENT-MILESTONE / ACTIVE-BACKLOG stop semantics

Conversation history was ignored as a status source.

---

## Drift found and resolved

| #   | Document                                                           | Incorrect / stale claim                                            | Correct (repository)                                                         | Resolution                                       |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | `CURRENT-STATE.md`                                                 | `@apzhub/search-integration` **0.1.0**                             | Disk **0.2.0**                                                               | Version updated; orchestrator/admin rows ensured |
| 2   | `CURRENT-STATE.md`                                                 | `testing-contracts` / `persistence` / `services` **0.10.0**        | Disk **0.11.0**                                                              | Versions updated                                 |
| 3   | `CURRENT-STATE.md`                                                 | APZSEARCH-018 listed as “Recommended next”                         | APZSEARCH-018/019 complete                                                   | Marked complete                                  |
| 4   | `CURRENT-STATE.md`                                                 | APZIDENTITY-005 listed as “Recommended next”                       | APZIDENTITY-005/006 complete                                                 | Marked complete                                  |
| 5   | `PRODUCT-CATALOGUE.md`                                             | PlaneAdapter “not implemented”; adapter blocked on OSS-100-05      | Plane **0.6.0** certified (OSS-101-10)                                       | Projects section rewritten                       |
| 6   | `PRODUCT-CATALOGUE.md`                                             | Identity stuck at APZIDENTITY-001 / next 002                       | APZIDENTITY-006 frozen; contracts/core **0.2.0**                             | Status row updated                               |
| 7   | `PRODUCT-CATALOGUE.md`                                             | APZ TCMS stop before 022; packages **0.9.0** / platform **0.12.0** | APZTCMS-001…024 complete; testing-* **0.11.0**; platform-services **0.25.0** | Status + packages updated                        |
| 8   | `OSS-CATALOGUE.md`                                                 | Wave 2 “PlatformService pending”; OSS-110-13+ blocked              | OSS-110-10…14 complete                                                       | Wave 2 section rewritten                         |
| 9   | `INTEGRATION-CATALOGUE.md`                                         | Provisioning labeled **OSS-100-11+**                               | Deferred as **OSS-100-12+** after freeze                                     | Label corrected                                  |
| 10  | `INTEGRATION-CATALOGUE.md`                                         | ProjectService via platform-services **v0.5.0**                    | Disk **0.25.0**                                                              | Version corrected                                |
| 11  | `APZTCMS-Backlog.md`                                               | APZTCMS-022 “Recommended next” / not started                       | 022–024 complete with completion reports                                     | Overview + sections updated                      |
| 12  | `APZTCMS-Milestone-Roadmap.md`                                     | Stop after 021; 022 recommended next                               | Through 024 complete                                                         | Roadmap rewritten                                |
| 13  | `DOCUMENT-MAP.md`                                                  | “47 ADRs”                                                          | **65** ADR files through ADR-0065                                            | Count updated                                    |
| 14  | `SESSION-START.md`                                                 | Status APZIDENTITY-004; stop before 005                            | KF-001 / OSS-100-11 stop                                                     | Launchpad updated                                |
| 15  | `PACKAGE-CATALOGUE.md`                                             | Version notes still listed testing-* **0.1.0** as current          | Current testing-* **0.11.0**; missing integration packages in notes          | Version notes + integration table reconciled     |
| 16  | `ARCHITECTURE-HANDBOOK.md`                                         | Identity Administration at APZIDENTITY-001 only                    | APZIDENTITY-006 closed/frozen                                                | Capability row + status line updated             |
| 17  | `PLATFORM-CAPABILITY-CATALOGUE.md`                                 | Provisioning **OSS-100-11+**                                       | **OSS-100-12+**                                                              | Label corrected                                  |
| 18  | Inventory §G                                                       | Listed catalogue drift as open                                     | Catalogues reconciled under KF-001                                           | §G rewritten to reconciliation status            |
| 19  | Status headers (INDEX / AI-CONTEXT / ACTIVE-BACKLOG / docs/README) | Stop framed as OSS-100-11 awaiting selection without KF programme  | **APZHUB-KF-001** complete; await owner                                      | Headers aligned                                  |

---

## Not treated as drift

| Item                                                                                                       | Reason                                                     |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Historical milestone version pins inside completion narratives (e.g. “at APZTCMS-014 packages were 0.8.0”) | Historical accuracy; CURRENT-STATE top inventory uses disk |
| Roadmap-only IDs (APZCONFIG-007, APZNOTIFY-007, APZWORKFLOW-012)                                           | Correctly awaiting owner; not invented                     |
| Absent Kimai/Paperless/Metabase adapters                                                                   | Correctly documented as absent                             |

---

## Validation (second pass)

Automated checks after edits:

- Key package versions in CURRENT-STATE / PACKAGE-CATALOGUE / Inventory match disk
- Stale patterns removed: PlaneAdapter not implemented; OSS-100-11+; 47 ADRs; SESSION-START Identity-004 stop; search-integration 0.1.0 in CURRENT-STATE inventory; testing 0.10.0 inventory; APZSEARCH-018 recommended-next; OSS-110-13+ blocked; APZTCMS-022 recommended next
- ADR file count = **65**

**Result:** VALIDATION_OK

---

## Residual risk

Documentation outside the KF-001 minimum set (individual historical sprint reports, strategy drafts, old review packs) may still contain period-accurate historical wording. Those are not CURRENT status sources. Prefer CURRENT-STATE / Inventory / `package.json` for live status.

---

## Conclusion

Documentation drift identified for KF status/catalogue/backlog/index surfaces is **resolved**. Knowledge Foundation status documents are reconciled with the repository as of 2026-07-18.
