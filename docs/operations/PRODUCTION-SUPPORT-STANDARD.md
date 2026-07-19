# Production Support Standard

> **Programme:** APZHUB-OPERATIONS-001  
> **Related:** [HOTFIX-POLICY](./HOTFIX-POLICY.md) · [INCIDENT-MANAGEMENT-STANDARD](./INCIDENT-MANAGEMENT-STANDARD.md) · Product KNOWN-LIMITATIONS

---

## Purpose

How APZHUB handles production defects, maintenance, and support responsibilities after packages/products are in Production.

---

## Production support

- Production slices are used **within documented limitations**.
- Support does not silently treat limited surfaces as complete.
- Engine branding remains masked for standard users.
- Connector/engine instance health may be external to the monorepo — document operational dependencies.

---

## Bug lifecycle

```text
Report / detect
  → Classify (severity + product/platform)
  → Triage (reproduce, assign)
  → Fix under Hotfix or Owner-approved programme
  → Test + certify
  → Release / deploy
  → Verify + close
  → Update KNOWN-LIMITATIONS / release notes if needed
```

---

## Issue classification

| Class                    | Route                                                                 |
| ------------------------ | --------------------------------------------------------------------- |
| Defect in accepted scope | Hotfix or maintenance programme                                       |
| Limitation (documented)  | Educate / backlog enhancement — not a “bug” until Owner expands scope |
| Misconfiguration / env   | Ops runbook                                                           |
| Security                 | Immediate Owner + security path; treat as S1/S2 until cleared         |
| Enhancement              | [CHANGE-MANAGEMENT-STANDARD](./CHANGE-MANAGEMENT-STANDARD.md)         |

---

## Escalation process

1. On-call / Technical Lead triage.
2. Product Owner for user-impact priority.
3. Architect if architecture/freeze involved.
4. Owner for S1/S2, security, or freeze exceptions.
5. Incident process if service-wide impact ([INCIDENT-MANAGEMENT-STANDARD](./INCIDENT-MANAGEMENT-STANDARD.md)).

---

## Maintenance releases

- PATCH/MINOR packages under normal release management.
- Group non-urgent fixes; prefer not to spam production.
- Still require quality gates and documentation updates.

---

## Support responsibilities

| Role           | Responsibility                                                    |
| -------------- | ----------------------------------------------------------------- |
| Engineers      | Reproduce, fix, test, document                                    |
| Technical Lead | Triage, merge, release readiness                                  |
| Product Owner  | Priority vs limitations vs enhancements                           |
| Architect      | Freeze/architecture calls                                         |
| Owner          | S1/S2 approval, acceptance of hotfix programmes                   |
| AI agents      | Repository-first; no silent scope expansion; STOP when unapproved |
