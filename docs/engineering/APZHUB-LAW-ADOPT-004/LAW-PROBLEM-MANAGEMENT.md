# LAW-PROBLEM-MANAGEMENT

| Field     | Value                |
| --------- | -------------------- |
| Programme | APZHUB-LAW-ADOPT-004 |
| Timestamp | 20260803T135126Z     |

## Purpose

Manage recurring or systemic issues that outlive a single incident. Problems are **governance artefacts** — not silent engineering queues.

## Relationship to incidents

| Artefact    | Role                                                  |
| ----------- | ----------------------------------------------------- |
| Incident    | Discrete production event                             |
| Problem     | Underlying cause pattern across one or more incidents |
| Known issue | Accepted residual / disclosed limitation              |
| Enhancement | Proposed product improvement (separate register)      |

## Process

1. Identify candidate problem from repeated incidents, support trends, or Board review.
2. Record Problem ID `LAW-PRB-YYYYMMDD-NNN` with linked incidents.
3. Document known workaround and operational mitigation.
4. Classify: Accept as Known Issue · Monitor · Propose remediation programme · Propose enhancement.
5. **No code changes** from problem management alone.

## Problem register

| Problem ID | Summary | Linked incidents | Workaround | Disposition | Owner | Status                  |
| ---------- | ------- | ---------------- | ---------- | ----------- | ----- | ----------------------- |
| —          | —       | —                | —          | —           | —     | Empty at programme open |

## Escalation

Problems that require engineering → Product Board / Owner Auth for a bounded remediation programme. Problems that are accepted residuals → [LAW-KNOWN-ISSUES.md](./LAW-KNOWN-ISSUES.md).
