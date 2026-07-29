# Completion Report — {{PROGRAMME_ID}}

| Field                 | Value                                       |
| --------------------- | ------------------------------------------- |
| Template              | **COMPLETION-REPORT**                       |
| Standard              | APZ Engineering Lifecycle Standard **v1.0** |
| Programme ID          | {{PROGRAMME_ID}}                            |
| Programme type        | {{PROGRAMME_TYPE}}                          |
| Product               | {{PRODUCT_ID}}                              |
| Capability            | {{CAPABILITY_NAME}}                         |
| Package               | {{PACKAGE_NAME}}                            |
| Version at completion | {{VERSION}}                                 |
| Pack path             | {{PACK_PATH}}                               |
| Status                | **{{COMPLETION_STATUS}}**                   |
| Completed at (UTC)    | {{COMPLETED_AT_UTC}}                        |
| Evidence ID           | {{EVIDENCE_ID}}                             |

---

## 1. Executive summary

{{EXECUTIVE_SUMMARY_2_TO_4_SENTENCES}}

**Single recommendation to Owner:** `{{SINGLE_RECOMMENDATION}}`

---

## 2. Governing authority & mode

| Item                               | Value                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Owner Instruction                  | {{OWNER_INSTRUCTION_REF}}                                              |
| Architecture baseline              | {{ARCHITECTURE_BASELINE}}                                              |
| Engineering Specification baseline | {{ES_BASELINE}}                                                        |
| Build Contract affirmed            | {{BUILD_CONTRACT_YES_NO_NA}}                                           |
| Mode of work                       | **Engineer** / **Review-verify** / **Governance packaging** — {{MODE}} |

---

## 3. In-scope work completed

| #   | Authorised item  | Result               | Evidence             |
| --- | ---------------- | -------------------- | -------------------- |
| 1   | {{SCOPE_ITEM_1}} | Done / Partial / N/A | {{SCOPE_EVIDENCE_1}} |
| 2   | {{SCOPE_ITEM_2}} | Done / Partial / N/A | {{SCOPE_EVIDENCE_2}} |

Partial work **SHALL NOT** be presented as complete. If partial, status must reflect it and Owner Decision must address it.

---

## 4. Out-of-scope confirmation

Confirm none of the following were performed:

- [ ] {{OUT_OF_SCOPE_1}}
- [ ] Next Wave / next lifecycle stage
- [ ] Unauthorised SemVer promotion
- [ ] Production engineering inside CERT/ECR (if this is a review programme)
- [ ] Frozen baseline modification (unless authorised)

---

## 5. Deliverables

| Deliverable                          | Path                                                                | Present |
| ------------------------------------ | ------------------------------------------------------------------- | ------- |
| {{DELIVERABLE_1}}                    | {{PATH_1}}                                                          | ☐       |
| {{DELIVERABLE_2}}                    | {{PATH_2}}                                                          | ☐       |
| Validation report                    | {{VALIDATION_PATH}}                                                 | ☐       |
| Deviation register                   | {{DEVIATION_PATH}}                                                  | ☐       |
| Risk acceptance register             | {{RISK_PATH}}                                                       | ☐       |
| Conformance matrix                   | {{MATRIX_PATH}}                                                     | ☐       |
| Owner Summary                        | {{OWNER_SUMMARY_PATH}}                                              | ☐       |
| Owner Acceptance / Decision template | {{OWNER_DECISION_PATH}}                                             | ☐       |
| Evidence JSON                        | `docs/operations/evidence/{{EVIDENCE_SUBDIR}}/{{EVIDENCE_ID}}.json` | ☐       |

---

## 6. Quality gates

| Gate                  | Command / method    | Result            | Notes |
| --------------------- | ------------------- | ----------------- | ----- |
| Typecheck             | {{TYPECHECK_CMD}}   | PASS / FAIL / N/A |       |
| Lint                  | {{LINT_CMD}}        | PASS / FAIL / N/A |       |
| Build                 | {{BUILD_CMD}}       | PASS / FAIL / N/A |       |
| Unit tests            | {{UNIT_CMD}}        | PASS / FAIL / N/A |       |
| Integration tests     | {{INTEGRATION_CMD}} | PASS / FAIL / N/A |       |
| E2E / Playwright      | {{E2E_CMD}}         | PASS / FAIL / N/A |       |
| Architecture fidelity | Review              | PASS / FAIL / N/A |       |
| Documentation         | Review              | PASS / FAIL / N/A |       |

Failed gates **SHALL** be explained; do not claim READY if gates required by the Instruction failed.

---

## 7. Traceability

| Baseline artefact                     | Satisfied by    | Gaps          |
| ------------------------------------- | --------------- | ------------- |
| Architecture requirements / contracts | {{TRACE_ARCH}}  | {{GAP_ARCH}}  |
| Engineering Specification contracts   | {{TRACE_ES}}    | {{GAP_ES}}    |
| Wave / stage scope items              | {{TRACE_SCOPE}} | {{GAP_SCOPE}} |

---

## 8. Deviations & risks

| Register   | Path               | Open items          |
| ---------- | ------------------ | ------------------- |
| Deviations | {{DEVIATION_PATH}} | {{DEVIATION_COUNT}} |
| Risks      | {{RISK_PATH}}      | {{RISK_COUNT}}      |

---

## 9. Known limitations

| ID       | Limitation     | Impact     | Disposition                      |
| -------- | -------------- | ---------- | -------------------------------- |
| L-{{NN}} | {{LIMITATION}} | {{IMPACT}} | Accept / Remediate later / Block |

---

## 10. Indexes updated

- [ ] Standing Programme Record / product index
- [ ] CHANGELOG (if version or baseline changed)
- [ ] AI-MANIFEST / CURRENT-STATE / CURRENT-MILESTONE (as required)
- [ ] Release artefacts under `docs/releases/` (if applicable)

---

## 11. Stop condition honoured

```text
{{STOP_CONDITION}}
```

**Next programme:** Awaiting Owner Decision. Do **not** start: {{FORBIDDEN_NEXT_LIST}}

---

## STOP

```text
{{PROGRAMME_ID}}
COMPLETION REPORT
{{COMPLETION_STATUS}}
AWAITING OWNER DECISION
```
