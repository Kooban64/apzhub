# APZ TCMS — Technology Decisions

**Product:** APZ TCMS  
**Milestone:** APZTCMS-001  
**Status:** Technology evaluation — **engines/tools TCMS integrates with**, not TCMS itself  
**Authority:** [004](../004-technology-stack-repository-standards-development-environment.md) · [015](../015-software-quality-testing-qa-cicd-release-management-framework.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)

---

## Explicit exclusions (APZTCMS-001)

No package installs, runners, or adapter code. Recommendations guide later milestones. Await **APZTCMS-002** before any implementation.

---

## Clarifying statement

**APZ TCMS is not Vitest, Playwright, Allure, or Kiwi.** Those are **execution engines, report formats, or scanners**. TCMS orchestrates and stores results via adapters.

| Layer                               | Technology                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| APZ TCMS product                    | Native APZHUB (Next.js workbench, Platform Services, platform PostgreSQL, S3-compatible evidence) — per 004 |
| Result formats / runners / scanners | External OSS tools listed below                                                                             |

---

## Platform stack (TCMS product — planned)

| Concern                | Decision                           | Reason                                                      |
| ---------------------- | ---------------------------------- | ----------------------------------------------------------- |
| Language / runtime     | TypeScript, Node LTS               | Platform standard (004)                                     |
| App shell              | Next.js App Router + DEF           | Existing APZHUB workbench                                   |
| SoR                    | Platform PostgreSQL                | Document 011                                                |
| Evidence blobs         | S3-compatible object storage       | Binary evidence not in PG                                   |
| Cache / queues         | Redis + async workers              | Document 012                                                |
| Auth                   | Better Auth + APZHUB permissions   | Document 007                                                |
| Validation             | Zod at service/API boundary        | Platform standard                                           |
| Quality of TCMS itself | Vitest + Playwright + Document 015 | Dogfood engines as **consumers**, separate from product SoR |

---

## Recommended OSS components (integration targets)

### Unit / component result sources

| Component           | Role                                      | Selection reason                                                       |
| ------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| **Vitest**          | Unit/component test runner & JSON results | Already APZHUB standard; fast; structured reporters ideal for adapters |
| **Jest** (optional) | Legacy unit runner                        | Wide ecosystem; JUnit/JSON reporters; ingest via same patterns         |

### E2E / UI automation

| Component      | Role                                   | Selection reason                                      |
| -------------- | -------------------------------------- | ----------------------------------------------------- |
| **Playwright** | E2E runner, traces, screenshots, video | Mandated by Document 015; rich artefacts for Evidence |

### Report interchange

| Component     | Role                            | Selection reason                                                                  |
| ------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| **JUnit XML** | Cross-tool result interchange   | De facto CI standard; many engines emit it; first generic adapter target          |
| **Allure**    | Rich report model / attachments | Optional enrichment layer; strong evidence metadata — **not** TCMS UI replacement |

### Accessibility

| Component                      | Role              | Selection reason                                       |
| ------------------------------ | ----------------- | ------------------------------------------------------ |
| **axe-core** (and CI wrappers) | a11y scan results | OSS, WCAG-aligned; complements Document 015 a11y gates |

### Performance / UX metrics

| Component      | Role                     | Selection reason                                         |
| -------------- | ------------------------ | -------------------------------------------------------- |
| **Lighthouse** | Perf/a11y/SEO audits     | OSS; CI-friendly JSON for adapters                       |
| **k6**         | Load/performance testing | OSS, scriptable, CI-native; separate from functional E2E |

### Security scanning (product-under-test)

| Component     | Role                          | Selection reason                                                |
| ------------- | ----------------------------- | --------------------------------------------------------------- |
| **OWASP ZAP** | Dynamic security scan results | Self-hosted OSS; fits Zero Trust programme without SaaS lock-in |

### Observability of runs (optional correlation)

| Component         | Role                                           | Selection reason                                               |
| ----------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| **OpenTelemetry** | Trace/metrics correlation IDs across ingestion | Aligns with Document 014; correlate CI run → adapter → service |

---

## Explicit non-choices (product identity)

| Option                                   | Decision   | Reason                                        |
| ---------------------------------------- | ---------- | --------------------------------------------- |
| Kiwi TCMS as SoR/UI                      | **Reject** | Native APZ TCMS product; Kiwi wave superseded |
| Embed Playwright UI as TCMS              | **Reject** | Orchestration only; Playwright remains engine |
| Commercial-only result SaaS as mandatory | **Reject** | Self-hosted OSS first                         |
| Merge SDK adapter harness into TCMS      | **Reject** | Orthogonal certification domains              |

---

## Adapter priority (recommended sequence)

1. JUnit XML (broadest CI coverage)
2. Vitest JSON
3. Playwright artefacts
4. axe / Lighthouse
5. k6 / ZAP
6. Allure enrichment

Exact sequencing follows [APZTCMS-Backlog](../backlog/APZTCMS-Backlog.md) automation/ingestion phases.

---

## Related

- [Integration Strategy](./APZHUB-APZ-TCMS-Integration-Strategy.md)
- [Reference Architecture](./APZHUB-APZ-TCMS-Reference-Architecture.md)
- [Product Vision](../strategy/APZHUB-APZ-TCMS-Product-Vision.md)
