# APZ Workflow — Release 1.0 Checklist

> **Programme:** APZ-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Complements:** [RELEASE-GOVERNANCE-CHECKLIST](../../releases/RELEASE-GOVERNANCE-CHECKLIST.md)  
> **Date:** 2026-07-19

---

## A. Before any implementation (planning gates)

| #   | Check                                                                   | Status now                    |
| --- | ----------------------------------------------------------------------- | ----------------------------- |
| A1  | Release Definition Pack complete                                        | **Done** (this programme)     |
| A2  | Owner Acceptance of APZ-WORKFLOW-001                                    | Pending                       |
| A3  | Architecture unlock ADR(s) for execute/schedule/approvals beyond freeze | **Open**                      |
| A4  | Marked Implementation Ready on disk for Release 1.0 scope               | **Open** — currently Planning |
| A5  | Named Owner Approval for implementation programmes                      | **Open**                      |
| A6  | Integration SDK **1.0.0** freeze respected                              | **Held**                      |

---

## B. Before Release Candidate

| #   | Check                                                                               |
| --- | ----------------------------------------------------------------------------------- |
| B1  | All Release 1.0 in-scope capabilities behind permissions                            |
| B2  | Exclusions still excluded (multi-engine GA, designer-primary, AI gen, engine login) |
| B3  | Known limitations filed                                                             |
| B4  | Playwright product cert suite green                                                 |
| B5  | Adapter + service health green (env-gated live where applicable)                    |
| B6  | No n8n brand in standard UI                                                         |
| B7  | Frozen planes untouched without ADR                                                 |
| B8  | Secrets never in logs/UI                                                            |

---

## C. Before Owner Acceptance of SemVer 1.0.0

| #   | Check                                                                                   |
| --- | --------------------------------------------------------------------------------------- |
| C1  | [RELEASE-GOVERNANCE-CHECKLIST](../../releases/RELEASE-GOVERNANCE-CHECKLIST.md) complete |
| C2  | Evidence under `docs/releases/workflow/1.0.0/`                                          |
| C3  | Portfolio Release Register row prepared                                                 |
| C4  | Commercial catalogue / edition matrix updated                                           |
| C5  | QA-002 PRODUCTION READY retained                                                        |
| C6  | STOP: no unapproved Major / multi-provider GA claims                                    |

---

## Related

- [CERTIFICATION-STRATEGY.md](./CERTIFICATION-STRATEGY.md)
- [RELEASE-PLAN.md](./RELEASE-PLAN.md)
