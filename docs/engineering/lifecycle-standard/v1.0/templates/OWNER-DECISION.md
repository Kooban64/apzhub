# Owner Decision — {{PROGRAMME_ID}}

| Field                   | Value                                       |
| ----------------------- | ------------------------------------------- |
| Template                | **OWNER-DECISION**                          |
| Standard                | APZ Engineering Lifecycle Standard **v1.0** |
| Programme ID            | {{PROGRAMME_ID}}                            |
| Programme type          | {{PROGRAMME_TYPE}}                          |
| Product                 | {{PRODUCT_ID}}                              |
| Capability              | {{CAPABILITY_NAME}}                         |
| Package / version       | {{PACKAGE_NAME}} {{VERSION}}                |
| Decision type           | {{DECISION_TYPE}}                           |
| Pack path               | {{PACK_PATH}}                               |
| Implementation evidence | {{IMPLEMENTATION_EVIDENCE_ID}}              |
| Decision evidence       | {{DECISION_EVIDENCE_ID}}                    |
| Decided at (UTC)        | {{DECIDED_AT_UTC}}                          |

---

## 1. Decision under review

| Item                        | Value                         |
| --------------------------- | ----------------------------- |
| Recommended outcome (agent) | {{AGENT_RECOMMENDATION}}      |
| Classification / class      | {{CLASSIFICATION}}            |
| Availability (if release)   | {{AVAILABILITY}}              |
| Known limitations cited     | {{KNOWN_LIMITATIONS_SUMMARY}} |

---

## 2. Governing authority

| Rank | Authority                                                    |
| ---- | ------------------------------------------------------------ |
| 1    | Document 000 / Product Constitution                          |
| 2    | APZ Engineering Lifecycle Standard v1.0                      |
| 3    | Applicable OES / Build Contract / Certification Independence |
| 4    | Accepted baselines for this capability                       |
| 5    | Owner Instruction {{PROGRAMME_ID}}                           |

---

## 3. Materials reviewed

| Artefact                                                | Path                        | Reviewed |
| ------------------------------------------------------- | --------------------------- | -------- |
| Completion / stage report                               | {{REPORT_PATH}}             | ☐        |
| Validation report                                       | {{VALIDATION_REPORT_PATH}}  | ☐        |
| Certification / Freeze / Release report (as applicable) | {{STAGE_REPORT_PATH}}       | ☐        |
| Risk acceptance register                                | {{RISK_REGISTER_PATH}}      | ☐        |
| Deviation register                                      | {{DEVIATION_REGISTER_PATH}} | ☐        |
| Engineering conformance matrix                          | {{CONFORMANCE_MATRIX_PATH}} | ☐        |
| Evidence JSON                                           | {{EVIDENCE_PATH}}           | ☐        |
| Owner Summary                                           | {{OWNER_SUMMARY_PATH}}      | ☐        |

---

## 4. Owner Decision

Select **exactly one** primary decision:

| Code                         | Meaning                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| **ACCEPTED**                 | Programme outcomes accepted; baseline / closed as stated                                                |
| **ACCEPTED WITH CONDITIONS** | Accepted subject to listed conditions                                                                   |
| **RETURN FOR REVISION**      | Not accepted; revise under same programme id (or Owner-directed id)                                     |
| **REJECTED**                 | Stop; Owner directs remediation under a new Instruction                                                 |
| **DEFERRED**                 | Decision postponed; no baseline change                                                                  |
| **RISK ACCEPTED**            | Specific residual risk accepted (attach register rows)                                                  |
| **AUTHORISE NEXT**           | Explicitly authorises a named next programme (separate Instruction still required unless combined here) |

**Primary decision:** `{{PRIMARY_DECISION}}`

**Status string (normative):** `{{STATUS_STRING}}`

Examples:

- `ACCEPTED / APPROVED / ARCHITECTURE BASELINED / CLOSED`
- `ACCEPTED / APPROVED / WAVE N BASELINED / CLOSED`
- `ACCEPTED / APPROVED / CERTIFICATION BASELINED / CLOSED`
- `ACCEPTED / APPROVED / PRODUCTION BASELINE FROZEN / CLOSED`
- `ACCEPTED / APPROVED / PRODUCTION RELEASE BASELINED / CLOSED`
- `RETURN FOR REVISION`

---

## 5. Conditions (if any)

| ID       | Condition          | Owner               | Due / gate         |
| -------- | ------------------ | ------------------- | ------------------ |
| C-{{NN}} | {{CONDITION_TEXT}} | {{CONDITION_OWNER}} | {{CONDITION_GATE}} |

If none: **None.**

---

## 6. Risks accepted (if any)

| Risk ID  | Statement          | Expiry / review | Citation              |
| -------- | ------------------ | --------------- | --------------------- |
| R-{{NN}} | {{RISK_STATEMENT}} | {{RISK_REVIEW}} | {{RISK_REGISTER_ROW}} |

If none: **None.**

---

## 7. What this decision authorises

1. {{AUTHORISES_1}}
2. {{AUTHORISES_2}}

---

## 8. What this decision does **not** authorise

1. {{DOES_NOT_AUTHORISE_1}}
2. {{DOES_NOT_AUTHORISE_2}}
3. Auto-start of any unnamed next Wave / CERT / Freeze / Release / GA
4. Unrestricted GA unless explicitly stated

---

## 9. Baseline / SemVer / tag effects

| Effect                   | Value                              |
| ------------------------ | ---------------------------------- |
| Package version change   | {{VERSION_EFFECT}}                 |
| Git tag                  | {{GIT_TAG_OR_NONE}}                |
| Freeze established       | {{FREEZE_YES_NO}}                  |
| Release artefacts path   | {{RELEASE_ARTEFACTS_PATH_OR_NONE}} |
| Changelog entry required | {{CHANGELOG_YES_NO}}               |

---

## 10. Indexes to update after decision

- [ ] Product / capability Standing Programme Record
- [ ] `docs/foundation/OWNER-ACCEPTANCE-REGISTER.md` (or product equivalent)
- [ ] `docs/foundation/AI-MANIFEST.md` / CURRENT-STATE / CURRENT-MILESTONE (as applicable)
- [ ] Product CHANGELOG
- [ ] Evidence JSON acceptance file under `docs/operations/evidence/`

---

## 11. Signature

| Field           | Value                    |
| --------------- | ------------------------ |
| Owner           | {{OWNER_NAME}}           |
| Timestamp (UTC) | {{DECIDED_AT_UTC}}       |
| Evidence ID     | {{DECISION_EVIDENCE_ID}} |

---

## STOP

```text
{{PROGRAMME_ID}}
OWNER DECISION RECORDED
{{STATUS_STRING}}
```
