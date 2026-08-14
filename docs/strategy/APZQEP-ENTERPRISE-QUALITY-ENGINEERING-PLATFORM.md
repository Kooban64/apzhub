# APZQEP — Enterprise Quality Engineering Platform

> **Status:** **OWNER-DIRECTED PILLAR VISION** — 2026-08-13  
> **Commercial pillar:** APZQEP (illustrative external: APZ Quality)  
> **Executive question:** _Can we release with confidence?_  
> **Parent strategy:** [APZOR-COMMERCIAL-PILLARS](./APZOR-COMMERCIAL-PILLARS.md)  
> **Engineering baselines:** `docs/products/apzqep/` (remain; this doc is experience + commercial identity authority)  
> **Does not authorise:** unbounded implementation — named sprint guides required

---

## Positioning (locked)

> **APZQEP is an Enterprise Quality Engineering Platform that connects requirements, source code, engineering tools, testing, security, performance, accessibility, evidence, defects and releases into one continuous quality system.**

**APZQEP must never be understood as a test-case management system.**

Traditional TCMS:

`Test Case → Test Run → Result`

APZQEP:

`Business Requirement → Engineering Change → Verification → Evidence → Risk → Certification → Production`

Specialist tools (GitHub, Playwright, SonarQube, ZAP, k6, …) work **underneath**.  
The user works in **APZQEP**.

---

## Core principle

> Use the best tool for each engineering discipline and make APZQEP the quality system that connects, governs and interprets them.

APZQEP owns the **quality model**, **Quality Graph**, **Evidence Engine**, **risk**, **gates**, and **certification**.  
Providers supply **quality evidence**.

---

## Quality chain

**Requirements → Source Code → Pull Requests → Builds → Tests → Security → Performance → Accessibility → Defects → Evidence → Risk → Certification → Release**

Testing is one component — not the definition of the product.

---

## Provider catalogue (expand continuously)

| Discipline          | Example providers                                   |
| ------------------- | --------------------------------------------------- |
| Source control      | GitHub, GitLab, Bitbucket, Azure DevOps             |
| CI/CD               | GitHub Actions, GitLab CI, Jenkins, Azure Pipelines |
| Browser / E2E       | Playwright (**first-class**), Cypress               |
| Unit / integration  | Vitest, Jest, JUnit, NUnit, pytest                  |
| Test reporting      | Allure                                              |
| Code quality        | SonarQube, ESLint, TypeScript                       |
| SAST                | CodeQL, Semgrep, SonarQube                          |
| DAST                | OWASP ZAP                                           |
| Dependency security | Snyk, Dependabot                                    |
| Container security  | Trivy                                               |
| Performance         | k6, JMeter                                          |
| Web performance     | Lighthouse                                          |
| Accessibility       | axe-core, Pa11y                                     |
| API testing         | Postman/Newman, Playwright API                      |
| SBOM                | Syft (or equivalent)                                |
| Observability       | OpenTelemetry, Prometheus, Grafana                  |
| Runtime             | Docker, Kubernetes                                  |

Goal: make **every meaningful aspect of an application testable** by adding providers over time — not by rebuilding them inside APZQEP.

---

## User experience — one quality picture

Users must not face a wall of tools. Enter a project and see:

| Domain                                                | Example status                |
| ----------------------------------------------------- | ----------------------------- |
| Requirements                                          | coverage %                    |
| Unit / Integration / E2E                              | PASS / FAIL                   |
| Security / Accessibility / Performance / Code Quality | PASS / WARNING / FAIL         |
| Defects                                               | open by severity              |
| Evidence                                              | Complete / Gaps               |
| Release Readiness                                     | score                         |
| Certification                                         | READY / CONDITIONAL / BLOCKED |

Every status is clickable into evidence. Progressive disclosure: executives see posture; engineers drill down.

### Home answers

> What requires my attention?

Not: which module do you want?

### Signature screen

**Release Control Centre** — consolidated RC readiness with blockers and certification state.

---

## GitHub and source (intimate relationship)

Connect repository ↔ APZQEP project. Understand: repos, branches, commits, PRs, files, contributors, Issues, Actions, builds, releases, tags.

### Source access modes (both required)

1. **Customer grants read access** to APZQEP (OAuth/App installation) — platform analyses in place.
2. **Customer downloads / clones in their area** and runs tests there — results and evidence still flow into APZQEP.

Initial source capability: **read-only**. APZQEP is not an IDE.

### Pull Request as quality object

Each PR carries risk, affected requirements/tests, recommended suites, verification matrix, and **Merge Readiness** (READY / CONDITIONAL / BLOCKED) with reasons — not merely “tests passed.”

---

## Requirements and Quality Graph

Requirements may originate from APZ Projects, GitHub Issues, or connected systems.

Traceability:

**Requirement → Acceptance Criteria → Code → Test → Execution → Evidence → Defect → Fix → Certification → Release**

The **Quality Graph** enables questions such as:

- Which releases contain code affected by this vulnerability?
- Which requirements changed without regression coverage?
- Which tests should run because these files changed?

---

## Test management (necessary, not sufficient)

Full traditional capability remains: cases, suites, plans, cycles, runs, steps, data, environments — manual, automated, hybrid, exploratory, UAT, regression, smoke, API, performance, security, accessibility.

These feed the Quality Platform; they are not isolated records.

Customer-issued requests drive user stories, test cases, actual testing, and **QA certification** workflows — not platform-invented work disguised as customer work.

---

## Automation ingest

CI pushes results automatically (execution ID, SHA, branch, environment, results, artefacts, traces). No mandatory manual upload.

Playwright is first-class: suites, browsers, retries, flaky detection, screenshots, videos, traces explorable from APZQEP.

---

## Security, performance, accessibility as quality domains

Security evidence (SAST/DAST/SCA/containers/SBOM) may come from APZPEN and/or direct providers — normalised into release assessment.  
Performance (k6, JMeter, Lighthouse) and accessibility (WCAG mapping) participate in gates and certification.

---

## Evidence Engine (differentiator)

Evidence is attributable, timestamped, integrity-verifiable, linked, searchable, policy-retained, and **immutable after certification**.

Includes: test results, traces, CI logs, security/performance/a11y reports, reviews, UAT and release approvals.

---

## Gates, risk-based testing, certification

Organisations define policies (coverage, severity thresholds, automation minimums, performance baselines, a11y, mandatory evidence, human approvals).  
APZQEP evaluates gates; **humans retain release authority**.

Risk considers change size, criticality, history, security sensitivity, coverage — recommending smoke vs full regression.

Certification answers: **YES / NO / CONDITIONAL** with full evidence why.

---

## Navigation (permission-aware)

Home · My Work · Requirements · Quality (cases/suites/plans/runs/exploratory) · Automation · Code · Security · Performance · Defects · Evidence · Releases · Certification · Insights · Administration

Persona workspaces: Developer, QA, Release Manager, Executive — same graph, different surfaces.

---

## AI — Quality Intelligence (later, bounded)

Assist: coverage gaps, suite recommendations, failure explanation, flake detection, risk summaries, test generation assist.  
**AI never certifies releases.**

---

## Operating model (closed loop)

Developer change → GitHub → APZQEP understands PR/source → CI + providers execute → Evidence Engine + Quality Graph → Risk + Gates → Release Control Centre → human decision → Certification → Release → production feedback.

---

## Ultimate measure of success

| Persona         | Question APZQEP answers                   |
| --------------- | ----------------------------------------- |
| Release Manager | Can we safely release?                    |
| Developer       | What quality impact did my change create? |
| QA              | What needs testing?                       |
| Security        | What security risk remains?               |
| Product Owner   | Have my requirements been verified?       |
| Auditor         | Prove required controls were met.         |
| Executive       | How healthy is the portfolio?             |

**Not Kiwi. Not TestRail. Not a Playwright dashboard.**  
A Quality Engineering Operating Platform for the whole delivery organisation.

**Revision:** 1.0.0 · 2026-08-13
