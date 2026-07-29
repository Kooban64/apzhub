# Wave 05 — Workbench

| Item       | Value                                                              |
| ---------- | ------------------------------------------------------------------ |
| Wave       | **05 — Workbench / Presentation**                                  |
| Version    | **1.0.0**                                                          |
| Parent     | [README.md](./README.md)                                           |
| Contract   | [../BUILD-CONTRACT.md](../BUILD-CONTRACT.md)                       |
| Prior      | [WAVE-04-INFRASTRUCTURE-API.md](./WAVE-04-INFRASTRUCTURE-API.md)   |
| Next stage | [../engineering-review/README.md](../engineering-review/README.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## Objectives

1. Implement Workbench / presentation surfaces per Accepted ES and Design System rules.
2. Consume platform APIs / Application only — no direct engine or connector calls.
3. Permission-filter UI elements; server remains authoritative.
4. Meet component/E2E/a11y expectations specified for the capability.
5. File continuous evidence for Owner Wave Review.

---

## Authorised scope

Wave 05 **MAY** include:

- Routes, views, and Workbench components within authorised screens
- Shared UI reuse via design-system components (tokens only; no hardcoded one-offs)
- Client-side state that is presentation/session only (not System of Record)
- Component tests, critical-path E2E, and accessibility checks as required
- Storybook entries when ES / UI SDK require them

Wave 05 **SHALL** require Wave 04 Acceptance (or Owner-recorded exception).

---

## Prohibited activities

1. Business logic, authz decisions, or lifecycle transitions invented in the UI.
2. Direct calls to connectors/backends.
3. Standalone module search/notification subsystems.
4. Hardcoded modules into shell registration bypassing Module Registry.
5. Speculative screens beyond ES / Owner Instruction.
6. Auto-starting ECR or Certification.

---

## Success criteria

| Criterion             | Requirement                                      |
| --------------------- | ------------------------------------------------ |
| ES/Workbench fidelity | Screens and actions match contracts              |
| Permissions           | UI shows only permitted actions; server enforces |
| Quality               | Component/E2E/a11y expectations met              |
| Design system         | Tokens/shared components; no one-off product UI  |
| Build                 | Repository buildable; gates pass                 |
| Evidence              | Continuous evidence + Deviation Register         |

---

## Stop condition

**IMPLEMENTED / AWAITING OWNER WAVE REVIEW** for Wave 05.

After Owner Acceptance of Wave 05 (and any Owner determination that Engineering Waves are complete), proceed only under a separate Directive to [../engineering-review/README.md](../engineering-review/README.md) (ECR).

**STOP** on Architecture/ES conflict, a11y/security gaps needing Owner Decision, or incomplete authorised screens presented as complete.

---

## Owner decision gate

| Decision            | Effect                                                                     |
| ------------------- | -------------------------------------------------------------------------- |
| ACCEPTED            | ECR **MAY** be separately authorised when Owner deems Engineering complete |
| RETURN FOR REVISION | Remediate under Wave 05                                                    |
| REJECTED            | Stop; Owner directs remediation / rollback                                 |

---

## STOP

```text
WAVE 05 WORKBENCH
PRESENTATION ONLY
AWAITING OWNER WAVE REVIEW
```
