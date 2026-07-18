# APZ TCMS — Integration Strategy

**Product:** APZ TCMS  
**Milestone:** APZTCMS-001  
**Status:** Integration strategy — **planning only**; no adapters or webhooks in 001  
**Authority:** [008](../008-module-plugin-connector-architecture.md) · [010](../010-api-gateway-integration-communication-standards.md) · [026](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [Reference Adapter Standard](./REFERENCE-ADAPTER-STANDARD.md) · [ADR-0059](../adr/ADR-0059-apz-tcms-native-product-architecture.md)

---

## Explicit exclusions (APZTCMS-001)

No result adapters, CI webhooks, Jira import, or cross-module APIs implemented. Await phased milestones after **APZTCMS-002**.

---

## Integration principles

1. **Module → Platform Service → Connector → Engine** — never bypass
2. **Result ingestion only** for test engines — TCMS does not own runner processes
3. **Refs not replication** for Projects/Support/Documents business data
4. **Self-hosted OSS first** for tools and formats
5. **SDK harness ≠ product TCMS** — adapter certification remains orthogonal

---

## APZHUB product integrations

| Product        | Integration mode           | Direction        | Notes                                                               |
| -------------- | -------------------------- | ---------------- | ------------------------------------------------------------------- |
| **Projects**   | Platform Service refs      | TCMS ↔ Projects  | Feature/Epic/Story links; DefectLink to issues via `ProjectService` |
| **Support**    | Platform Service refs      | TCMS ↔ Support   | DefectLink to tickets via Support services                          |
| **Documents**  | Optional evidence/doc refs | TCMS → Documents | Link formal docs; blobs still object storage for test evidence      |
| **Analytics**  | Events / export (future)   | TCMS → Analytics | Quality metrics dashboards — no Metabase branding in UI             |
| **Automation** | Trigger/notify (future)    | Events           | n8n-style flows consume TCMS events — modules do not call n8n       |

Cross-module coupling is **forbidden**. Coordination is via Platform Services and events.

---

## CI/CD and SCM

| System                                                                                | Role                          | TCMS interaction                                                                     |
| ------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| **CI/CD** (Document 015 pipelines, GitHub Actions, GitLab CI, Azure DevOps Pipelines) | Runs engines                  | Publishes result artefacts / webhooks → **result adapters** → TestingService         |
| **GitHub / GitLab / Azure DevOps**                                                    | SCM + PR checks               | Status checks may reflect gate outcomes (future); never expose engine UI as SoR      |
| **M17 / platform CI**                                                                 | APZHUB’s own quality pipeline | Sibling consumer of engines; TCMS may ingest platform CI results for APZHUB products |

TCMS **integrates with** CI ownership — it does not replace pipeline definition ownership.

---

## Result adapters (future connectors)

| Adapter (example)                    | Input                               | Output to domain                        |
| ------------------------------------ | ----------------------------------- | --------------------------------------- |
| `VitestResultAdapter`                | Vitest JSON / report                | AutomatedExecution, TestRun, TestResult |
| `PlaywrightResultAdapter`            | Playwright JSON / HTML / trace refs | Results + Evidence refs                 |
| `JUnitXmlAdapter`                    | JUnit XML                           | Normalised results                      |
| Allure report adapter (optional)     | Allure results dir                  | Results + attachments metadata          |
| axe / Lighthouse / ZAP / k6 adapters | Tool-specific reports               | Typed results + evidence                |

All follow Integration SDK + Reference Adapter Standard. Capability discovery, health, error translation required. CE/self-hosted first.

```text
CI / Runner
  → artefact or webhook
  → Result Adapter
  → TestingService
  → Platform PG + evidence store
  → Events → Notifications / Search / Activity
```

---

## Jira import (future)

| Aspect      | Plan                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| Purpose     | One-time or staged import of cases/requirements from Jira (and similar) |
| Boundary    | Import adapter → TestingService — not live Jira as SoR                  |
| Priority    | After core domain + manual execution foundations                        |
| User-facing | “Import” — never “Jira TCMS” branding                                   |

---

## Kiwi TCMS

| Decision                            | Detail                                                             |
| ----------------------------------- | ------------------------------------------------------------------ |
| Product SoR                         | **Not used** — superseded by native APZ TCMS                       |
| OSS Wave 7 “Kiwi as Testing engine” | **Superseded** for user-facing test management                     |
| Possible future                     | Optional migration/import tooling only — not architecture baseline |

---

## Orthogonal: Integration SDK certification harness

| Concern                             | Owner                                 |
| ----------------------------------- | ------------------------------------- |
| Certify Plane/Zammad/… adapters     | SDK harness (OSS-100-09/10, ADR-0057) |
| Certify product releases / features | **APZ TCMS** CertificationService     |

Both may use the word “certification” in docs; they are **different products**. Coexist without merging codepaths.

---

## Security & tenancy

- Per-tenant adapter connections and secrets via Integration SDK secret refs
- Ingestion workers: dedicated identities, idempotent processing
- No raw engine errors to UI (010)

---

## Related

- [Technology Decisions](./APZHUB-APZ-TCMS-Technology-Decisions.md)
- [Reference Architecture](./APZHUB-APZ-TCMS-Reference-Architecture.md)
- [Backlog](../backlog/APZTCMS-Backlog.md)
