# APZ TCMS — Repository Assessment

> **Programme:** APZ-TCMS-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Bootstrap:** AI-MANIFEST · PACKAGE-CATALOGUE · INTEGRATION-PRODUCT-CAPABILITY-INVENTORY · disk

---

## Platform maturity

| Area                     | Status                                                             | Evidence                                      |
| ------------------------ | ------------------------------------------------------------------ | --------------------------------------------- |
| Product identity         | **Established**                                                    | APZ TCMS / user-facing **Testing** · ADR-0059 |
| Engineering completeness | **APZTCMS-001…024 complete**                                       | Milestone Roadmap · backlog                   |
| Architecture             | **Documented + Accepted ADR**                                      | Reference Architecture corpus · ADR-0059      |
| Certification (slices)   | **PRWL where certified**                                           | e.g. APZTCMS-019 GHA vertical                 |
| Freezes                  | **GHA Reference Adapter frozen** (020) · Search Publication frozen | Freeze notices / inventory                    |
| Commercial SemVer        | **Not established**                                                | No `docs/releases/tcms*`                      |

**Maturity summary:** Platform / native product **Production-class slices** with limitations; commercial product PR **absent**.

---

## Packages (disk)

| Package                              | Version    | Role                       |
| ------------------------------------ | ---------- | -------------------------- |
| `@apzhub/testing-contracts`          | **0.11.0** | Domain contracts           |
| `@apzhub/testing-foundation`         | **0.1.0**  | Registries + validation    |
| `@apzhub/testing-persistence`        | **0.11.0** | Repositories + authz       |
| `@apzhub/testing-services`           | **0.11.0** | Domain services            |
| `@apzhub/integration-github-actions` | **0.1.0**  | CI/CD Reference Adapter    |
| `@apzhub/search-testing`             | **0.1.1**  | Search Publication adapter |

---

## Existing APIs

| Surface             | Status                                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/api/v1/testing/*` | **Present** — requirements, plans, suites, cases, executions, pipelines, certifications, coverage, defects, evidence, approvals, automation, quality, releases, engineering-intelligence, dashboard, … |
| Gateway             | `gateway.testing.*` used by HTTP handlers                                                                                                                                                              |
| OpenAPI             | Platform OpenAPI includes testing paths (validate under packaging programme)                                                                                                                           |

---

## Workbench modules

| Surface          | Status                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- |
| Module ID        | `testing`                                                                             |
| Components       | `apps/web/components/testing/*` (dashboard, catalog, execution, certification, EI, …) |
| User-facing name | **Testing** (Certification views within module)                                       |
| Boundary tests   | `testing-architecture-boundary.test.ts` present                                       |

---

## Documentation

Extensive architecture, developer, UX, CI/CD, certification, and vision docs under `docs/architecture/APZHUB-APZ-TCMS-*`, `docs/strategy/APZHUB-APZ-TCMS-Product-Vision.md`, backlog/roadmap. Commercial Release Planning pack (this folder) is new.

---

## Testing assets

| Asset                                               | Status                                                      |
| --------------------------------------------------- | ----------------------------------------------------------- |
| Unit/component tests                                | Present alongside testing packages and Workbench components |
| Vertical / GHA audits                               | APZTCMS-019 supporting audits                               |
| Playwright product cert suite for commercial SemVer | To be revalidated in packaging programme                    |
| Kiwi live integration tests                         | **N/A** — Kiwi absent                                       |

---

## Implementation status

| Layer                                      | Implemented?        |
| ------------------------------------------ | ------------------- |
| Native SoR + services                      | **Yes**             |
| HTTP + Workbench                           | **Yes**             |
| GHA CI metadata (read-only certified path) | **Yes**             |
| Kiwi adapter                               | **No** (superseded) |
| GitLab CI adapter                          | **No** (future)     |
| AI Assist                                  | **Deferred**        |
| Commercial SemVer pack                     | **No**              |

---

## Architecture status

| Item                           | Status                                     |
| ------------------------------ | ------------------------------------------ |
| ADR-0059 native product        | **Accepted**                               |
| Kiwi as SoR / user-facing      | **Superseded**                             |
| GHA Reference Adapter Standard | **Frozen**                                 |
| Full PDS re-foundation         | **Not required** for Release 1.0 packaging |

---

## Assessment conclusion

Supports **Existing Platform → Commercial Packaging**. See [DELIVERY-PATH.md](./DELIVERY-PATH.md).
