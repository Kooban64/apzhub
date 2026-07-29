# Engineering Conformance Matrix — {{PROGRAMME_ID}}

| Field             | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| Template          | **ENGINEERING-CONFORMANCE-MATRIX**                             |
| Standard          | APZ Engineering Lifecycle Standard **v1.0**                    |
| Programme ID      | {{PROGRAMME_ID}}                                               |
| Product           | {{PRODUCT_ID}}                                                 |
| Capability        | {{CAPABILITY_NAME}}                                            |
| Package / version | {{PACKAGE_NAME}} {{VERSION}}                                   |
| Stage             | Architecture / ES / Wave {{N}} / ECR / CERT / Freeze / Release |
| Updated at (UTC)  | {{UPDATED_AT_UTC}}                                             |

---

## 1. Purpose

Provide a single traceability matrix from **authoritative requirements/contracts** to **implementation / evidence**, for Owner Review and Certification. Use at Wave completion, ECR, and CERT as required by the Owner Instruction.

---

## 2. Legend

| Result  | Meaning                                                             |
| ------- | ------------------------------------------------------------------- |
| **C**   | Conforms                                                            |
| **PC**  | Partial — see deviation                                             |
| **NC**  | Non-conforming                                                      |
| **NA**  | Not applicable at this stage                                        |
| **NYI** | Not yet implemented (only valid if Instruction allows partial Wave) |

---

## 3. Architecture conformance

| Arch ID  | Architecture statement / contract | Implementing artefact | Tests / evidence     | Result                 | Deviation    |
| -------- | --------------------------------- | --------------------- | -------------------- | ---------------------- | ------------ |
| A-{{NN}} | {{ARCH_STATEMENT}}                | {{IMPL_PATH}}         | {{TEST_OR_EVIDENCE}} | C / PC / NC / NA / NYI | D-{{NN}} / — |

---

## 4. Engineering Specification conformance

| ES ID    | ES contract     | Implementing artefact | Tests / evidence     | Result                 | Deviation    |
| -------- | --------------- | --------------------- | -------------------- | ---------------------- | ------------ |
| E-{{NN}} | {{ES_CONTRACT}} | {{IMPL_PATH}}         | {{TEST_OR_EVIDENCE}} | C / PC / NC / NA / NYI | D-{{NN}} / — |

If this programme is Architecture-only: mark section **NA** and state why.

---

## 5. Wave / Instruction scope conformance

| Scope ID | Authorised scope item | Delivered          | Evidence     | Result            | Notes |
| -------- | --------------------- | ------------------ | ------------ | ----------------- | ----- |
| S-{{NN}} | {{SCOPE_ITEM}}        | Yes / No / Partial | {{EVIDENCE}} | C / PC / NC / NYI |       |

---

## 6. Cross-cutting platform rules

| Rule ID | Rule (Document 000 / lifecycle / Build Contract)          | Result      | Evidence |
| ------- | --------------------------------------------------------- | ----------- | -------- |
| P-01    | Modules do not call connectors/backends directly          | C / NC / NA |          |
| P-02    | Business logic in Platform Services / Domain as specified | C / NC / NA |          |
| P-03    | Authn/authz on exposed APIs                               | C / NC / NA |          |
| P-04    | Audit / events via platform patterns                      | C / NC / NA |          |
| P-05    | No secrets in repo                                        | C / NC      |          |
| P-06    | Tokens-only UI / shared components (if UI in scope)       | C / NC / NA |          |
| P-07    | {{CUSTOM_PLATFORM_RULE}}                                  | C / NC / NA |          |

---

## 7. Quality evidence map

| Quality concern                 | Required by                 | Evidence path | Result      |
| ------------------------------- | --------------------------- | ------------- | ----------- |
| Unit coverage for new behaviour | Build Contract              | {{PATH}}      | C / NC / NA |
| Integration / API tests         | Instruction                 | {{PATH}}      | C / NC / NA |
| Playwright / E2E                | Instruction                 | {{PATH}}      | C / NC / NA |
| a11y                            | Instruction / Design System | {{PATH}}      | C / NC / NA |
| Docs / Storybook                | Instruction                 | {{PATH}}      | C / NC / NA |

---

## 8. Summary

| Category                  | C   | PC  | NC  | NA  | NYI |
| ------------------------- | --- | --- | --- | --- | --- |
| Architecture              |     |     |     |     |     |
| Engineering Specification |     |     |     |     |     |
| Scope items               |     |     |     |     |     |
| Platform rules            |     |     |     |     |     |
| Quality                   |     |     |     |     |     |

**Overall conformance claim:** `{{OVERALL_CLAIM}}`

**Blocking NC/PC IDs:** {{BLOCKING_IDS_OR_NONE}}

---

## 9. Sign-off (agent)

| Field                     | Value                                                      |
| ------------------------- | ---------------------------------------------------------- |
| Prepared by               | {{AGENT_OR_ENGINEER}}                                      |
| Mode                      | Engineer (matrix authoring) / Review-verify (CERT/ECR use) |
| Linked Deviation Register | {{DEVIATION_PATH}}                                         |
| Linked Validation Report  | {{VALIDATION_PATH}}                                        |

Owner acceptance of the programme constitutes acceptance of this matrix unless RETURN FOR REVISION cites specific rows.

---

## STOP

```text
{{PROGRAMME_ID}}
ENGINEERING CONFORMANCE MATRIX
{{OVERALL_CLAIM}}
TRACEABILITY IS MANDATORY FOR OWNER REVIEW
```
