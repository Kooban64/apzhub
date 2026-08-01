# Engineering Slice Template

| Field     | Value                                                            |
| --------- | ---------------------------------------------------------------- |
| Document  | Engineering Slice Template                                       |
| Programme | **APZHUB-ENG-001**                                               |
| Status    | **IN FORCE**                                                     |
| Process   | [ENGINEERING-SLICE-STANDARD.md](./ENGINEERING-SLICE-STANDARD.md) |

Copy this template for each Owner slice instruction. Fill only the slice-specific fields.  
**Do not** paste the full lifecycle into every prompt — agents inherit the standard.

---

## Owner instruction (short form)

```text
# {SLICE-ID}

Authority: OPEN for this slice only. No other slice authorised.

Process: Follow docs/engineering/ENGINEERING-SLICE-STANDARD.md
Template: docs/engineering/ENGINEERING-SLICE-TEMPLATE.md
AI rules: docs/engineering/AI-ENGINEERING-WORKFLOW.md
Checklist: docs/engineering/ENGINEERING-CHECKLIST.md
Certification: docs/engineering/SLICE-CERTIFICATION.md
Reference: docs/engineering/S01-REFERENCE-PATTERN.md

## Objective
{one paragraph}

## Scope
- {in-scope item}
- {in-scope item}

## Explicit exclusions
- {out-of-scope item}

## Acceptance criteria
1. {testable criterion}
2. {testable criterion}

## Dependencies
- Technical: {packages / infra}
- Programme: {prior slices}
- Owner decisions: {IDs or NONE}

## Special constraints
- {compatibility / flags / security / NONE}

## Final report
Return the standard final report block from ENGINEERING-SLICE-TEMPLATE.md
```

---

## Expanded fields (for planning packs / complex slices)

### Programme

| Field          | Value                        |
| -------------- | ---------------------------- |
| Programme      |                              |
| Product        |                              |
| Classification | Enterprise Engineering Slice |

### Slice

| Field            | Value |
| ---------------- | ----- |
| Slice ID         |       |
| Title            |       |
| Workstream       |       |
| Priority         |       |
| Sequence         |       |
| Release boundary |       |

### Objective

Concise capability statement.

### Scope

Exact deliverables.

### Explicit exclusions

What will not be implemented.

### Repository inspection

Required before code changes. Record COMPLETE / PARTIAL / MISSING for affected capabilities.

### Architecture confirmation

Approved architecture reference:  
Confirmation: PASS / EXCEPTION → STOP

### Dependencies

| Type            | Detail |
| --------------- | ------ |
| Technical       |        |
| Programme       |        |
| Package         |        |
| Infrastructure  |        |
| Owner decisions |        |
| Credentials     |        |

### Implementation tasks

1. …
2. …

### Testing

| Layer             | Required |
| ----------------- | -------- |
| Unit              |          |
| Integration       |          |
| Security / tenant |          |
| Contract          |          |
| Failure-path      |          |
| Perf (if claimed) |          |
| E2E (if claimed)  |          |

Targeted regression only — see standard regression policy.

### Security

| Check            | Result |
| ---------------- | ------ |
| ACL / authz      |        |
| Tenant isolation |        |
| Default deny     |        |
| No bypass path   |        |
| Audit on op deny |        |
| Secrets hygiene  |        |

### Documentation

List exact docs to update (no unrelated rewrites).

### Evidence

| Artefact          | Path                                                               |
| ----------------- | ------------------------------------------------------------------ |
| Completion        | `docs/operations/evidence/.../{TIMESTAMP}-{SLICE}-COMPLETION.json` |
| Security          | `...-SECURITY.json`                                                |
| Certification     | `...-CERTIFICATION.json`                                           |
| Engineering notes | product pack path                                                  |

### Certification

Apply [SLICE-CERTIFICATION.md](./SLICE-CERTIFICATION.md). Result: PASS / FAIL / CONDITIONAL PASS / BLOCKED

### Commit

| Commit        | Message pattern                     |
| ------------- | ----------------------------------- |
| Engineering   | `feat(scope): …` or `fix(scope): …` |
| Documentation | `docs(scope): …` (if needed)        |

Push and verify remote when the programme requires.

### Validation

- [ ] Repository builds (affected packages)
- [ ] Tests pass (targeted)
- [ ] Security PASS
- [ ] Documentation complete
- [ ] Evidence complete
- [ ] Working tree clean
- [ ] No unrelated changes

### Stop conditions

Architecture conflict · security conflict · breaking API · unexpected dependency · repository instability · Owner decision required.

### Final report

```text
{SLICE-ID}

Status
COMPLETE | FAIL | BLOCKED

Engineering
COMPLETE | INCOMPLETE

Repository
CLEAN | NOT CLEAN

Security
PASS | FAIL | N/A

Tenant Isolation
PASS | FAIL | N/A

Documentation
UPDATED | NOT REQUIRED | INCOMPLETE

Evidence
COMPLETE | INCOMPLETE

Certification
PASS | FAIL | CONDITIONAL PASS | BLOCKED

Regression
PASS | FAIL

Outstanding Issues
NONE | {list}

Recommendation
Ready for {next slice} | STOPPED — {reason}
```

---

## STOP

```text
FILL SLICE-SPECIFIC FIELDS ONLY
INHERIT PROCESS FROM ENGINEERING-SLICE-STANDARD
```
