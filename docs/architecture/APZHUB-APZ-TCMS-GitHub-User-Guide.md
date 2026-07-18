# APZHUB APZ TCMS — GitHub User Guide (APZTCMS-018)

## Purpose

Read-only Testing workbench guidance for viewing GitHub Actions (and vendor-neutral CI) pipeline metadata through APZHUB. Backend branding stays hidden; users see **Pipelines**, not GitHub.

## What you can do

- Open **Testing → Pipelines**
- Browse registered (SoR) pipelines and providers
- Open a repository by owner/name
- View workflows and workflow runs
- Inspect a run: jobs, steps, artifacts (metadata), summary
- See Evidence / Coverage / Certification / Release link panels when SoR links exist
- Optionally **Refresh into platform** (import live run → SoR) when `pipeline.import` is granted

## What you cannot do (this milestone)

- Dispatch, rerun, or cancel workflows
- Download artifact binaries
- Manage repositories, issues, or pull requests
- Configure GitHub credentials in the UI

## Permissions

| Permission           | UI effect                                         |
| -------------------- | ------------------------------------------------- |
| `pipeline.read`      | View pipelines section and live/SoR reads         |
| `pipeline.import`    | Refresh / importFromProvider                      |
| `pipeline.providers` | Provider list (also covered by read in workbench) |

Server authorization remains authoritative.

## Navigation URLs

- `/workspace/testing/pipelines`
- `/workspace/testing/pipelines/repos/{owner}/{repo}`
- `/workspace/testing/pipelines/repos/{owner}/{repo}/workflows`
- `/workspace/testing/pipelines/repos/{owner}/{repo}/runs`
- `/workspace/testing/pipelines/repos/{owner}/{repo}/runs/{runId}`
