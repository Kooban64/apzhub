# APZQEP Quality Ecosystem Map

| Field     | Value                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------- |
| Status    | **IN FORCE — north-star blueprint** (Owner rediscovery 2026-08-09)                                |
| Role      | Implementation guide for integrations & engines — not another governance layer                    |
| Programme | [FLAGSHIP-PROGRAMME.md](./FLAGSHIP-PROGRAMME.md) — Phases F0–F6 path to 100%                      |
| Relation  | Complements [PRODUCT-PHILOSOPHY.md](./PRODUCT-PHILOSOPHY.md); does **not** reopen Cap A–F freezes |

---

## One sentence

**APZQEP is the Quality Operating System for software engineering** — it owns the quality model, evidence, certification, and intelligence; it **orchestrates** best-of-breed providers; it does **not** replace GitHub, Playwright, SonarQube, or Kiwi-as-destination.

Kiwi / “better TCMS” was a stepping stone. Testing is one capability inside Quality.

---

## What APZQEP owns (five engines)

```text
Requirements Engine  →  Verification Engine  →  Evidence Engine
                              ↓
                    Certification Engine
                              ↓
                 Quality Intelligence Engine
```

| Engine                   | Owns (SoR / governance)                                                                            | Does **not** own                            |
| ------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Requirements**         | Approved requirements, baselines, relationships, change impact seeds                               | Project backlog engines (Plane/etc.) as SoR |
| **Verification**         | Plans, specs, suites, sessions, manual/automated/exploratory procedures, defects linked to quality | Runner binaries; CI product UX              |
| **Evidence**             | Immutable evidence objects, storage locators, associations, provenance                             | Raw tool dashboards                         |
| **Certification**        | Gates, readiness scores, GO/NO-GO packages, human sign-off                                         | Auto-certify without human                  |
| **Quality Intelligence** | Gap/risk/failure/regression/readiness _advice_ (derived)                                           | SoR mutations; silent cert changes          |

**Lifecycle spine (product identity):**

```text
Requirements → Risk → Planning → Verification → Execution
→ Evidence → Certification → Release → Operational Learning
```

---

## Biggest rule: everything becomes evidence

Not only test results. Every governed claim produces evidence that can feed certification:

| Domain                | Example evidence                                   |
| --------------------- | -------------------------------------------------- |
| Requirements          | Approval, baseline freeze                          |
| Design                | Design review record                               |
| Code                  | PR review, commit association                      |
| Static / code quality | Sonar/ESLint/CodeQL summaries                      |
| Security              | ZAP/Snyk/Trivy/Dependabot                          |
| Accessibility         | axe / Pa11y                                        |
| Performance           | k6 / Lighthouse                                    |
| Automation            | Playwright / Vitest / Cypress / JUnit              |
| Manual / UAT          | Session steps, observations                        |
| Release               | Sign-off, production verification                  |
| Ops learning          | Post-release quality notes (→ Knowledge companion) |

---

## Quality Graph (differentiator)

Not “tables only” — a navigable graph of quality nodes:

```text
Requirement → Story/Feature → Verification → Execution
→ Evidence → Defect → Fix → Regression → Certification → Release
```

Plus SCM edges: Issue → PR → Commit → Files → Tests → Evidence.

Impact, coverage, and certification become graph queries over governed evidence — not spreadsheet reconciliation.

---

## Provider layer (best of breed — branding masked)

APZQEP owns the **quality model**. Providers contribute **signals and artifacts**.

```text
                    APZQEP
           Quality Operating System
    Requirements · Evidence · Certification
                    │
          Integration / Provider Layer
                    │
 ┌─────────────────────────────────────────────┐
 │ GitHub │ Playwright │ SonarQube │ OWASP ZAP │
 │ k6 │ Lighthouse │ Snyk │ Allure │ Vitest    │
 │ Cypress │ JUnit │ Docker │ Kubernetes │ …   │
 └─────────────────────────────────────────────┘
```

### Domains → first providers → evidence → certification use

| Domain                          | First / primary providers                                   | Evidence contributed                       | Feeds certification                            |
| ------------------------------- | ----------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| **SCM / engineering heartbeat** | **GitHub** (first); later GitLab, Azure DevOps, Bitbucket   | Commit, PR, author, files, reviews, checks | Change scope, linked reqs, review completeness |
| **CI/CD**                       | GitHub Actions (first); Jenkins, GitLab CI, Azure Pipelines | Pipeline run, job status, artifacts        | Gate signals                                   |
| **UI / E2E automation**         | **Playwright** (first-class); Cypress later                 | Traces, screenshots, videos, results       | Automation pass/fail                           |
| **Unit / component**            | Vitest; JUnit / NUnit via result ingestion                  | Reports, coverage stubs                    | Build verification                             |
| **Code quality**                | SonarQube, ESLint, TypeScript, CodeQL                       | Findings, grade, hotspots                  | Quality / debt gates                           |
| **Security**                    | OWASP ZAP, Snyk, Trivy, Dependabot                          | Vuln reports, SBOM refs                    | Security gate                                  |
| **Performance**                 | k6, Lighthouse                                              | Benchmarks, budgets                        | Perf gate                                      |
| **Accessibility**               | axe-core, Pa11y                                             | a11y findings                              | A11y gate                                      |
| **Containers**                  | Docker/Trivy/SBOM tools                                     | Image scan, SBOM                           | Supply-chain gate                              |
| **Observability**               | OpenTelemetry, Prometheus, Grafana (via platform)           | Prod verification signals                  | Post-release evidence                          |
| **Manual TCMS ideas**           | Native APZQEP (TestRail/Xray/Zephyr/qTest _ideas_)          | Plans, sessions, defects                   | Manual coverage                                |
| **Reporting UX ideas**          | Allure / Azure Test Plans _ideas_                           | Aggregated run narratives                  | Readiness narrative                            |

User-facing summary (never ten dashboards):

```text
Release Candidate x.y.z
Requirements · Automation · Security · Performance · A11y · Coverage · Risk · Certification
```

Every number drills to immutable evidence.

---

## GitHub is central (not “just SCM”)

```text
Commit → GitHub → Webhook → APZQEP → Quality Pipeline
```

APZQEP should know SHA, branch, PR, author, files, reviewers, linked work/requirements/defects — without manual entry. Source-code intelligence attaches files and PRs into the Quality Graph. Full depth is **Tranche 4+**, not Tranche 2.

---

## AI (later) — intelligence, not SoR

Assist: coverage gaps, risk, failure explanation, regression recommendation, quality summary, certification blockers, readiness narrative.  
**Humans certify. AI never auto-certifies.**

---

## Foundation vs destination (honest status)

| Layer                                                 | Status after Platform POB + Tranche 2 Q0–Q6 |
| ----------------------------------------------------- | ------------------------------------------- |
| Native SoR spine (plan → execute → defect → evidence) | **Foundation in place**                     |
| Playwright as first live automation provider          | **Narrow path live**                        |
| Evidence storage / publish bridge                     | **Foundation in place**                     |
| Shell honesty (no stub → Requirements lie)            | **In place**                                |
| Quality Graph as first-class product model            | **Partial / future**                        |
| Certification Engine (product)                        | **Destination — not this tranche**          |
| GitHub heartbeat + multi-provider matrix              | **Destination — Tranche 4+**                |
| Quality Intelligence Engine                           | **Destination — later**                     |

What we built is the **foundation**, not the ceiling. Do not shrink ambition to “useful TCMS.” Do not throw away Cap A–F / V1.1 kernel.

---

## Friction → ship order (Owner picks next)

Question that drives slices:

> What friction exists today in enterprise quality engineering that nobody is solving well?

Default evolution order (refine when opening a tranche):

1. **Governed evidence from change** — GitHub PR/commit → evidence + graph edges
2. **Provider-neutral automation results** — deepen Playwright; ingest Vitest/CI
3. **Certification / readiness slice** — score + explain from evidence (human GO/NO-GO)
4. **Impact → regression recommendation** — files/reqs → suite pack
5. **Security / a11y / perf providers** — one domain at a time into Evidence Engine
6. **Quality Intelligence** — advisory only

---

## Explicit non-goals

- Replacing GitHub / Sonar / ZAP / k6 with APZHUB-owned clones
- Exposing engine brand dashboards to standard users
- Kiwi as product destination
- AI as SoR or auto-certifier
- Big-bang multi-provider rewrite in one tranche

---

## Related

- Plan: `platform_then_qep_knowledge` — Tranche 4 opens from this map
- Philosophy: [PRODUCT-PHILOSOPHY.md](./PRODUCT-PHILOSOPHY.md)
- Inventory: [../PRACTICAL-USEFULNESS-INVENTORY.md](../PRACTICAL-USEFULNESS-INVENTORY.md) B7
