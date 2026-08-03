# Traceability — APZQEP-162

## Scope

Establish **relationships only** between SCM artefacts and APZQEP quality objects. No AI analysis.

## Link kinds

| Kind                | Example external / platform ref |
| ------------------- | ------------------------------- |
| `commit`            | `sha:…`                         |
| `branch`            | `refs/heads/main`               |
| `pull_request`      | `pr:42`                         |
| `execution_plan`    | platform execution plan id      |
| `execution_session` | platform session id             |
| `evidence`          | `evidence://…`                  |
| `defect`            | defect id                       |
| `requirement`       | requirement id                  |
| `quality_report`    | report id                       |

## API

`POST /api/v1/qep/scm/traceability` creates a link. Repository detail returns existing links.

## End-to-end product story (Wave 2)

```text
Developer pushes code → GitHub → APZQEP SCM events
  → (hooks) Automation / Evidence / QKI / Reporting relationships
```

Orchestrating Playwright runs from commits is integration via events — Automation Platform remains the executor (Wave 1). This programme does not embed CI/CD.
