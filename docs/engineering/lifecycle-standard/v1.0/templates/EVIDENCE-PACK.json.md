# Evidence Pack — JSON schema & guidance

| Field        | Value                                                 |
| ------------ | ----------------------------------------------------- |
| Template     | **EVIDENCE-PACK.json**                                |
| Standard     | APZ Engineering Lifecycle Standard **v1.0**           |
| Storage root | `docs/operations/evidence/`                           |
| Related      | [REPOSITORY-STANDARDS.md](../REPOSITORY-STANDARDS.md) |

This file is **guidance**. Programme evidence files are real `.json` files (not Markdown). Copy the schema below into:

```text
docs/operations/evidence/{{EVIDENCE_SUBDIR}}/{{EVIDENCE_ID}}.json
```

---

## 1. Naming

```text
{{EVIDENCE_ID}} = YYYYMMDDTHHMMSSZ-{{PROGRAMME_ID}}
```

Examples:

| Kind                            | Example                                               |
| ------------------------------- | ----------------------------------------------------- |
| Implementation / stage evidence | `20260729T164800Z-APZQEP-RELEASE-001.json`            |
| Owner acceptance evidence       | `20260729T174800Z-APZQEP-RELEASE-001-ACCEPTANCE.json` |
| Wave evidence                   | `20260729T145837Z-APZQEP-ENG-100E.json`               |

Rules:

1. UTC timestamp prefix, compact ISO-8601 (`YYYYMMDDTHHMMSSZ`).
2. Programme ID matches Owner Instruction exactly.
3. Acceptance / decision files append `-ACCEPTANCE` (or `-DECISION` if Owner prefers).
4. No secrets, tokens, connection strings, or PII.
5. Paths in JSON are repo-relative from repository root.

---

## 2. Required directory layout

```text
docs/operations/evidence/
  {{EVIDENCE_SUBDIR}}/          # e.g. portfolio-recert, {{PRODUCT_SLUG}}, {{CAPABILITY_SLUG}}
    README.md                   # optional index for the subdir
    {{EVIDENCE_ID}}.json
    {{EVIDENCE_ID}}-ACCEPTANCE.json
```

Prefer an existing product/portfolio subdir when one exists. Do not scatter evidence at the evidence root without an Owner convention.

---

## 3. Minimal schema (implementation / stage evidence)

```json
{
  "evidenceId": "{{EVIDENCE_ID}}",
  "schemaVersion": "1.0.0",
  "standard": "APZ-Engineering-Lifecycle-Standard/v1.0",
  "programme": "{{PROGRAMME_ID}}",
  "programmeType": "{{PROGRAMME_TYPE}}",
  "title": "{{PROGRAMME_TITLE}}",
  "product": "{{PRODUCT_ID}}",
  "capability": "{{CAPABILITY_NAME}}",
  "package": "{{PACKAGE_NAME}}",
  "version": "{{VERSION}}",
  "recordedAt": "{{ISO8601_UTC}}",
  "mode": "{{ENGINEER|REVIEW_VERIFY|GOVERNANCE_PACKAGING}}",
  "status": "{{COMPLETION_STATUS}}",
  "stopCondition": "{{STOP_CONDITION}}",
  "pack": "{{PACK_PATH}}",
  "ownerInstruction": "{{OWNER_INSTRUCTION_PATH}}",
  "baselines": {
    "architecture": "{{ARCHITECTURE_BASELINE_REF}}",
    "engineeringSpecification": "{{ES_BASELINE_REF}}",
    "buildContract": "{{BUILD_CONTRACT_REF_OR_NULL}}"
  },
  "deliverables": [
    {
      "id": "D-01",
      "name": "{{DELIVERABLE_NAME}}",
      "path": "{{DELIVERABLE_PATH}}",
      "present": true
    }
  ],
  "qualityGates": [
    {
      "gate": "typecheck",
      "result": "PASS",
      "command": "{{COMMAND}}",
      "notes": ""
    }
  ],
  "deviations": {
    "registerPath": "{{DEVIATION_REGISTER_PATH}}",
    "count": 0,
    "ids": []
  },
  "risks": {
    "registerPath": "{{RISK_REGISTER_PATH}}",
    "openCount": 0,
    "acceptedIds": []
  },
  "knownLimitations": [
    {
      "id": "L-01",
      "summary": "{{LIMITATION_SUMMARY}}",
      "blocksUnrestrictedGa": false
    }
  ],
  "git": {
    "branch": "{{BRANCH}}",
    "commit": "{{COMMIT_SHA_OR_NULL}}",
    "tag": "{{GIT_TAG_OR_NULL}}"
  },
  "indexesUpdated": ["{{INDEX_PATH}}"],
  "authorisesNext": false,
  "forbiddenNext": ["{{FORBIDDEN_PROGRAMME_OR_STAGE}}"],
  "recommendation": "{{SINGLE_RECOMMENDATION}}",
  "classification": "{{CLASSIFICATION_OR_NULL}}",
  "availability": "{{AVAILABILITY_OR_NULL}}",
  "notes": "{{FREE_TEXT_NO_SECRETS}}"
}
```

---

## 4. Acceptance / decision evidence schema

```json
{
  "evidenceId": "{{EVIDENCE_ID}}-ACCEPTANCE",
  "schemaVersion": "1.0.0",
  "standard": "APZ-Engineering-Lifecycle-Standard/v1.0",
  "programme": "{{PROGRAMME_ID}}",
  "title": "{{PROGRAMME_TITLE}}",
  "programmeType": "{{PROGRAMME_TYPE}}",
  "product": "{{PRODUCT_ID}}",
  "capability": "{{CAPABILITY_NAME}}",
  "recordedAt": "{{ISO8601_UTC}}",
  "decisionTimestampUtc": "{{YYYYMMDDTHHMMSSZ}}",
  "decision": "{{STATUS_STRING}}",
  "authority": "Owner {{DECISION_TYPE}}",
  "pack": "{{PACK_PATH}}",
  "acceptance": "{{OWNER_ACCEPTANCE_PATH}}",
  "implementationEvidence": "docs/operations/evidence/{{EVIDENCE_SUBDIR}}/{{EVIDENCE_ID}}.json",
  "package": "{{PACKAGE_NAME}}",
  "version": "{{VERSION}}",
  "gitTag": "{{GIT_TAG_OR_NULL}}",
  "conditions": [],
  "risksAccepted": [],
  "authorisesNextProgramme": null,
  "authorisesUnrestrictedGa": false,
  "stopCondition": "{{POST_DECISION_STOP}}",
  "operationalNotes": []
}
```

---

## 5. Field rules

| Field                 | Rule                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `status` / `decision` | Exact lifecycle status strings; no paraphrase                                              |
| `mode`                | Must match programme type (CERT/ECR → `REVIEW_VERIFY`)                                     |
| `authorisesNext`      | Default `false`; never imply next Wave without Owner Decision                              |
| `git.tag`             | Capability-scoped tags only (see REPOSITORY-STANDARDS)                                     |
| Arrays                | Prefer empty arrays over omitted required collections                                      |
| Extensibility         | Additional keys **MAY** be added under a namespaced object, e.g. `"productExtensions": {}` |

---

## 6. Validation checklist (before commit)

- [ ] Filename matches `evidenceId`
- [ ] Valid JSON (no trailing commas, no comments)
- [ ] All required paths resolve in-repo
- [ ] No secrets
- [ ] `programme` matches Owner Instruction
- [ ] `status` matches Completion Report
- [ ] Acceptance file references implementation evidence id
- [ ] Subdir README / portfolio index updated if that is local practice

---

## 7. Relationship to Markdown packs

| Concern                            | Markdown pack                    | Evidence JSON         |
| ---------------------------------- | -------------------------------- | --------------------- |
| Narrative, checklists, Owner prose | Yes                              | No                    |
| Machine-readable status & pointers | Supporting                       | Canonical pointer set |
| Owner Decision text                | `OWNER-DECISION.md` / acceptance | Summary fields only   |

JSON **SHALL NOT** replace the human-readable pack; it **SHALL** point to it.

---

## STOP

```text
EVIDENCE PACK GUIDANCE
SCHEMA VERSION 1.0.0
WRITE REAL JSON UNDER docs/operations/evidence/
NO SECRETS
```
