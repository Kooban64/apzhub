# Product Certification Standard

> **Programme:** APZHUB-PRODUCTS-000  
> **Related:** [AI-WORKFLOW](../foundation/AI-WORKFLOW.md) · [PRODUCT-LIFECYCLE](./PRODUCT-LIFECYCLE.md) · [015 Quality](../015-software-quality-testing-qa-cicd-release-management-framework.md)

---

## Purpose

Minimum certification requirements for **every** APZHUB product programme before Owner Acceptance.

---

## Minimum gates

| Gate                            | Required                                                     |
| ------------------------------- | ------------------------------------------------------------ |
| **Unit tests**                  | PASS for product/programme scope                             |
| **Integration tests**           | PASS for product/programme scope                             |
| **Audit**                       | Programme `pnpm audit:*` / certify command PASS when defined |
| **Documentation**               | Product template docs + sprint/completion artefacts PASS     |
| **Completion Report**           | Written under `docs/sprint/` or product programme path       |
| **Programme Acceptance Report** | Written (foundation `completion-reports/` pattern)           |
| **Owner Acceptance**            | Explicit Owner ACCEPTED / CLOSED                             |
| **Repository verification**     | Versions, KF status, freezes, no SDK public API break        |

---

## Architecture compliance (certification checklist)

- [ ] Bootstrap used AI-MANIFEST / CURRENT-MILESTONE
- [ ] Frozen architectures unmodified (or ADR + Owner recorded)
- [ ] Platform Services used; no Module → Connector / Engine bypass
- [ ] Governance not bypassed
- [ ] Provisioning not bypassed for product activation
- [ ] Integration SDK public contracts unchanged
- [ ] Engine names not exposed in user-facing UI

---

## Acceptance report fields (minimum)

Align with [AI-WORKFLOW](../foundation/AI-WORKFLOW.md) Programme Acceptance Report:

- Programme / Product / Classification / Status
- Implementation · Architecture · Tests (+ count)
- Certification (+ audit command)
- Documentation · Repository (+ package versions)
- Known Limitations
- Recommendation → Await Owner Acceptance

---

## Incomplete certification

If any minimum gate fails, the programme is **not** ready for Owner Acceptance. Do not mark CLOSED. Do not start the next product programme.
