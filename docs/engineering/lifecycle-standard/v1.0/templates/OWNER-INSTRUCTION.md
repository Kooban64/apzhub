# Owner Instruction — {{PROGRAMME_ID}}

| Field            | Value                                       |
| ---------------- | ------------------------------------------- |
| Template         | **OWNER-INSTRUCTION**                       |
| Standard         | APZ Engineering Lifecycle Standard **v1.0** |
| Programme ID     | {{PROGRAMME_ID}}                            |
| Programme type   | {{PROGRAMME_TYPE}}                          |
| Product          | {{PRODUCT_ID}}                              |
| Capability       | {{CAPABILITY_NAME}}                         |
| Package (if any) | {{PACKAGE_NAME}}                            |
| Issued by        | Owner                                       |
| Issued at (UTC)  | {{ISSUED_AT_UTC}}                           |
| Status           | **AUTHORISED** / **DRAFT** / **SUPERSEDED** |

---

## 1. Governing authority

This Instruction is issued under:

| Rank | Authority                                                   | Citation                                    |
| ---- | ----------------------------------------------------------- | ------------------------------------------- |
| 1    | Document 000 / Product Constitution                         | {{CONSTITUTION_REF}}                        |
| 2    | APZ Engineering Lifecycle Standard v1.0                     | `docs/engineering/lifecycle-standard/v1.0/` |
| 3    | OES trilogy / OES-003 / Build Contract (as applicable)      | {{OES_REFS}}                                |
| 4    | Accepted Architecture / Engineering Specification baselines | {{BASELINE_REFS}}                           |
| 5    | This Owner Instruction                                      | {{PROGRAMME_ID}}                            |

Agents and engineers **SHALL** obey higher-ranked authority on conflict and **SHALL NOT** invent scope beyond this Instruction.

---

## 2. Purpose

{{PURPOSE_ONE_PARAGRAPH}}

---

## 3. In scope

Explicitly authorised work:

1. {{IN_SCOPE_ITEM_1}}
2. {{IN_SCOPE_ITEM_2}}
3. {{IN_SCOPE_ITEM_3}}

### Deliverables required

| #   | Deliverable                         | Path / form                                                         |
| --- | ----------------------------------- | ------------------------------------------------------------------- |
| 1   | {{DELIVERABLE_1}}                   | {{DELIVERABLE_1_PATH}}                                              |
| 2   | {{DELIVERABLE_2}}                   | {{DELIVERABLE_2_PATH}}                                              |
| 3   | Evidence JSON                       | `docs/operations/evidence/{{EVIDENCE_SUBDIR}}/{{EVIDENCE_ID}}.json` |
| 4   | Owner Summary + Acceptance template | Programme pack                                                      |
| 5   | Deviation register (even if empty)  | Programme pack                                                      |

---

## 4. Out of scope

**SHALL NOT** be performed under this Instruction:

1. {{OUT_OF_SCOPE_ITEM_1}}
2. {{OUT_OF_SCOPE_ITEM_2}}
3. Any subsequent lifecycle stage not named in §6
4. Unauthorised Waves, CERT engineering, or silent SemVer promotion
5. Modification of frozen baselines unless this Instruction explicitly authorises it

---

## 5. Mode of work

| Mode                     | Applies?              | Rule                                                                                  |
| ------------------------ | --------------------- | ------------------------------------------------------------------------------------- |
| **Engineer**             | {{ENGINEER_YES_NO}}   | Implement production or documentation artefacts within authorised scope               |
| **Review / verify**      | {{REVIEW_YES_NO}}     | Evaluate as-delivered; **SHALL NOT** redesign or implement remediation as engineering |
| **Governance packaging** | {{GOVERNANCE_YES_NO}} | Assemble evidence, registers, and Owner Decision templates only                       |

**Stage rule:** {{STAGE_MODE_RULE}}

Examples:

- Architecture / Engineering Specification / Engineering Wave → **Engineer** (within Instruction)
- ECR / Certification → **Review / verify** (no production engineering)
- Freeze / Release → **Governance packaging** + Owner Decision; no silent engineering

---

## 6. Stop condition

Work **SHALL** stop when:

```text
{{STOP_CONDITION}}
```

Typical stop states:

| Programme type            | Expected stop                                                       |
| ------------------------- | ------------------------------------------------------------------- |
| Architecture              | `IMPLEMENTED / AWAITING OWNER ARCHITECTURE ACCEPTANCE`              |
| Engineering Specification | `IMPLEMENTED / AWAITING OWNER ENGINEERING SPECIFICATION ACCEPTANCE` |
| Engineering Wave          | `IMPLEMENTED / AWAITING OWNER WAVE REVIEW`                          |
| ECR                       | `IMPLEMENTED / AWAITING OWNER ECR DECISION`                         |
| Certification             | `IMPLEMENTED / AWAITING OWNER CERTIFICATION DECISION`               |
| Freeze                    | `IMPLEMENTED / AWAITING OWNER FREEZE DECISION`                      |
| Release                   | `IMPLEMENTED / AWAITING OWNER PRODUCTION RELEASE DECISION`          |

Agents **SHALL NOT** auto-start the next programme or Wave.

---

## 7. Required completion state

Before presenting for Owner Decision, the agent **SHALL** ensure:

- [ ] All in-scope deliverables exist and are indexed
- [ ] Out-of-scope items were not performed
- [ ] Evidence JSON written under `docs/operations/evidence/`
- [ ] Deviation register present (empty if none)
- [ ] Indexes updated as required by [REPOSITORY-STANDARDS.md](../REPOSITORY-STANDARDS.md)
- [ ] Stop condition status string set exactly as authorised
- [ ] No secrets in pack or evidence

**Completion status string:** `{{COMPLETION_STATUS}}`

---

## 8. Preconditions

| Precondition       | Status / citation         |
| ------------------ | ------------------------- |
| {{PRECONDITION_1}} | {{PRECONDITION_1_STATUS}} |
| {{PRECONDITION_2}} | {{PRECONDITION_2_STATUS}} |

If any mandatory precondition is unmet, **STOP** and escalate — do not proceed.

---

## 9. Risk and deviation handling

- Deviations **SHALL** be recorded in the Deviation Register.
- Material risk requiring Owner acceptance **SHALL** use [OWNER-DECISION.md](./OWNER-DECISION.md) / risk-acceptance templates — not silent proceed.
- Architectural conflict **SHALL** stop the programme immediately.

---

## 10. Explicit non-authorisations

This Instruction does **not** authorise:

- {{NON_AUTH_1}}
- {{NON_AUTH_2}}
- Unrestricted GA / Freeze / Release unless this programme type is exactly that stage

---

## 11. Owner signature block

| Field                  | Value                                 |
| ---------------------- | ------------------------------------- |
| Decision               | **AUTHORISE COMMENCEMENT** / withhold |
| Owner                  | {{OWNER_NAME}}                        |
| Timestamp (UTC)        | {{ISSUED_AT_UTC}}                     |
| Evidence ID (optional) | {{AUTHORISATION_EVIDENCE_ID}}         |

---

## STOP

```text
{{PROGRAMME_ID}}
OWNER INSTRUCTION
{{COMPLETION_STATUS_OR_AUTHORISED}}
DO NOT PROCEED BEYOND STOP CONDITION
```
