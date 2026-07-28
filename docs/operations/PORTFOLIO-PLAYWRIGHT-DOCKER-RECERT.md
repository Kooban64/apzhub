# Portfolio Playwright / Docker Re-cert Path

> **Backlog:** R12-QA-01 · **Programme:** APZHUB-ENG-0005 · **KL:** PL12-KL-06  
> **Classification:** Compliance / Operational Improvement  
> **Rule:** Process/CI only — no product redesign, no Platform 1.2.0 packaging mutation

---

## Purpose

Reaffirm portfolio CI honesty after Themes A–C and continuous engineering:

1. **Playwright** — full monorepo chromium suite (`pnpm test:e2e`) covering platform shell + commercial product UI certs.
2. **Docker** — APZHUB Compose rebuild/health (`infrastructure/docker/docker-compose.dev.yml`) — the half GitHub Actions service containers do not cover.
3. **Evidence** — dated JSON under `docs/operations/evidence/portfolio-recert/`.

---

## Commands

```bash
# Artefact + CI wiring only
pnpm ops:portfolio-recert

# Compose config + up + health
pnpm ops:portfolio-recert -- --mode docker

# Full monorepo Playwright (same bar as CI)
pnpm ops:portfolio-recert -- --mode playwright

# Docker + Playwright (recommended for KL closure)
pnpm ops:portfolio-recert -- --mode full
```

Ordinary PR/`main` CI already runs `pnpm test:e2e` (see `.github/workflows/ci.yml`). This path adds Docker honesty + durable evidence.

---

## Portfolio surface matrix

| Surface              | Playwright coverage (representative)                       |
| -------------------- | ---------------------------------------------------------- |
| Platform shell       | `spr-001` … `spr-007`                                      |
| Projects             | `apzhub-projects-*`                                        |
| Time                 | `apzhub-time-1.0-*`                                        |
| Support              | `oss-110-13-*`, `oss-110-14-*`                             |
| Documents            | `apzdocs-005-*`                                            |
| TCMS                 | `apztcms-*`                                                |
| Analytics / Workflow | `apzhub-analytics-*`, `apzhub-workflow-*`, `apzworkflow-*` |
| Law                  | `law-*` (optional `pnpm test:e2e:law` for trust project)   |
| Cross-cuts           | Search, Identity, Metrics, Observe, Admin, Notifications   |

---

## Pass / fail

| Verdict     | Meaning                                                     |
| ----------- | ----------------------------------------------------------- |
| **PASS**    | Required stages for the mode succeeded; evidence written    |
| **FAIL**    | Artefact missing, compose unhealthy, or Playwright non-zero |
| **BLOCKED** | Environment prevented Playwright execution                  |

---

## Host coexistence

Use APZHUB reserved ports only (ENVIRONMENT.md). Do not remap legacy `apz-stack` ports. Prefer `pnpm ops:host-coexistence-audit -- --live` before bringing Compose up on a shared host.

---

## Related

- Evidence: [evidence/portfolio-recert/](./evidence/portfolio-recert/README.md)
- Continuous certification: [../product-lifecycle/CONTINUOUS-CERTIFICATION.md](../product-lifecycle/CONTINUOUS-CERTIFICATION.md)
- ENG pack: [../engineering/APZHUB-ENG-0005/](../engineering/APZHUB-ENG-0005/IMPLEMENTATION-SUMMARY.md)
