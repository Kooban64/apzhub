# APZOR Commercial Pillars — Path Forward

> **Status:** **OWNER-DIRECTED STRATEGY** — crystallised 2026-08-13  
> **Classification:** Commercial & product strategy authority  
> **Does not authorise:** unrestricted engineering; named sprints still required for implementation  
> **Supersedes (commercial packaging story):** selling “APZHUB” as the customer product  
> **Complements:** [APZHUB Constitution](../000-apzhub-engineering-constitution.md) · existing product packs under `docs/products/` · [PACKAGING-STRATEGY](./commercial/PACKAGING-STRATEGY.md)

---

## 1. The critical distinction

**The platform you build and the business you sell are not the same thing.**

| Layer                    | Name                                                | Role                                                         |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------------------ |
| **Internal platform**    | **APZHUB**                                          | How APZOR builds, operates, integrates, and governs products |
| **Commercial solutions** | **APZQEP · APZPEN · APZPRD**                        | What customers buy                                           |
| **Providers**            | GitHub, Playwright, ZAP, Trivy, Greenbone, Plane, … | Best-of-breed engines — normally invisible                   |

```text
                 Commercial Solutions
      APZQEP        APZPEN        APZPRD
                     │
        ───────────────────────────────
             APZHUB Enterprise Platform
        ───────────────────────────────
                     │
     Adapters · Providers · Delivery Standard
```

Customers buy the **top** layer.  
APZOR owns the **middle** layer.  
Providers stay **masked** unless a specialist is explicitly granted Professional Tool Access.

### Non-goals

- Do **not** create three separate platforms or three codebases.
- Do **not** require customers to understand or license “APZHUB” to buy a solution.
- Do **not** rebuild every specialist tool — orchestrate, govern, evidence, and certify them.

---

## 2. Three commercial pillars

| Internal ID | Executive question                               | Customer-facing brand (illustrative; may evolve) |
| ----------- | ------------------------------------------------ | ------------------------------------------------ |
| **APZQEP**  | _Can we release with confidence?_                | APZ Quality                                      |
| **APZPEN**  | _Can we trust / demonstrate that we are secure?_ | APZ Security                                     |
| **APZPRD**  | _Can our people work effectively?_               | APZ Workspace                                    |

Internal engineering IDs (`APZQEP`, `APZPEN`, `APZPRD`) stay stable.  
Marketing names may change without architecture churn.

### Independent commercialisation (firm rule)

A customer may buy **any combination**:

- Software company → APZQEP + APZPEN
- Consulting firm → APZPRD only
- Bank / regulated → all three

One identity ecosystem when combinations are licensed.  
Shared platform capabilities (IAM, search, audit, notifications, events) where appropriate.  
**Never force** unused pillars into the sale.

---

## 3. Pillar vision authorities

| Pillar | Authority document                                                                                       |
| ------ | -------------------------------------------------------------------------------------------------------- |
| APZQEP | [APZQEP-ENTERPRISE-QUALITY-ENGINEERING-PLATFORM.md](./APZQEP-ENTERPRISE-QUALITY-ENGINEERING-PLATFORM.md) |
| APZPEN | [APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md](./APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)   |
| APZPRD | [APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md](./APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md)               |

These documents **improve and supersede** earlier “sell the portal / TCMS-only” framing.  
They **do not** delete accepted engineering baselines under `docs/products/apzqep/` — those remain product-definition and delivery history; **commercial identity and experience intent** now follow the pillar visions.

---

## 4. Shared platform (APZHUB — internal)

APZHUB remains the single operating platform:

- Identity, sessions, permissions, org/tenant model
- API Gateway, Platform Services, adapters
- Operator consoles (`/console`, `/ops`, `/finance`, `/compliance`, `/org`)
- Entitlements and commercial catalogue
- Search, notifications, activity, audit, events, jobs
- Design system and workbench chrome

**Customers do not buy APZHUB.** They buy solutions that run on it.

---

## 5. Provider philosophy (all pillars)

> Use the best tool for each discipline.  
> Own the **model**, **orchestration**, **evidence**, **risk**, and **certification** in APZ*.

Examples (non-exhaustive — expand continuously):

| Area                 | Example providers                                   |
| -------------------- | --------------------------------------------------- |
| SCM                  | GitHub, GitLab, Bitbucket, Azure DevOps             |
| CI/CD                | GitHub Actions, GitLab CI, Jenkins, Azure Pipelines |
| E2E                  | Playwright, Cypress                                 |
| Unit/integration     | Vitest, Jest, JUnit, NUnit, pytest                  |
| SAST                 | CodeQL, Semgrep, SonarQube                          |
| DAST                 | OWASP ZAP, Burp Suite                               |
| SCA / deps           | Snyk, Dependabot, OSV-Scanner                       |
| Containers           | Trivy, Grype                                        |
| VA / network         | Nuclei, OpenVAS/Greenbone, Nmap                     |
| Secrets              | Gitleaks, TruffleHog                                |
| Performance          | k6, JMeter, Lighthouse                              |
| Accessibility        | axe-core, Pa11y                                     |
| Productivity engines | Plane, Zammad, Kimai, Metabase, n8n, Paperless-ngx  |

**GitHub intimacy** is first-class for QEP and PEN: repositories, branches, PRs, Actions, read-only source where authorised, customer-hosted clone/test or granted read access — both operating modes must be supported.

---

## 6. Cross-pillar integration (without merging products)

```text
GitHub / Engineering change
           │
     ┌─────┴─────┐
  APZQEP       APZPEN
  (quality)    (security assurance)
     └─────┬─────┘
   Release / assurance evidence
           │
        APZHUB
   (identity · audit · search)
           │
        APZPRD
   (work that delivers the change)
```

APZPEN security evidence may feed APZQEP release certification.  
APZPRD may raise work items from QEP/PEN findings.  
Products stay independently sellable.

---

## 7. Near-term path forward (engineering sequence)

| Phase | Focus                                        | Outcome                                                                                                                  |
| ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **A** | Operator + solution shell chrome             | Cursor-like frame; one left rail; persona-aware workspaces                                                               |
| **B** | **APZPEN first (owner priority)**            | [SPR-APZPEN-001](../sprint/SPR-APZPEN-001-security-assurance-foundation.md) then provider depth, GitHub, customer portal |
| **C** | APZQEP extraordinary depth                   | Quality Graph, Evidence Engine, GitHub, Playwright-first, broad QA tool providers, gates, certification                  |
| **D** | APZPRD composable workspace                  | Entitlement-assembled UX; per-product licensing; Professional Tool Access rare                                           |
| **E** | Quality / Security Intelligence (bounded AI) | Assist only — never autonomous certify or attack                                                                         |

Catalogue IDs today (`qa` / `pentest` / `productivity`) map to **APZQEP / APZPEN / APZPRD**; rename when a named commercial sprint authorises it.

---

## 8. Relationship to prior strategy docs

| Prior doc                                                                                         | Relationship                                                                            |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [APZHUB-Quality-Engineering-Platform-Strategy](./APZHUB-Quality-Engineering-Platform-Strategy.md) | Historical; product identity → APZQEP pillar vision                                     |
| [APZHUB-APZ-TCMS-Product-Vision](./APZHUB-APZ-TCMS-Product-Vision.md)                             | TCMS is a **capability inside** APZQEP, not the whole product                           |
| [PACKAGING-STRATEGY](./commercial/PACKAGING-STRATEGY.md)                                          | Still valid for editions; **GTM packages** align to three pillars + composable PRD SKUs |
| [MKT-MULTI-SITE-HOSTS](../operations/MKT-MULTI-SITE-HOSTS.md)                                     | Marketing hosts align to pillar brands                                                  |
| `docs/products/apzqep/**`                                                                         | Engineering baselines remain; experience intent follows pillar vision                   |

---

## 9. Owner confirmation

This pack records owner direction of **2026-08-13**:

1. APZHUB = internal platform only for commercial narrative.
2. Three independently sellable pillars on one platform.
3. Best-of-breed providers; APZ owns graphs, evidence, gates, certification.
4. APZPRD is composable — never force the full productivity suite.
5. Next detailed engineering plans proceed pillar-by-pillar under named approvals.

**Revision:** 1.0.0 · 2026-08-13
