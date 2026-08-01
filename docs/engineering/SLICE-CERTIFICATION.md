# Slice Certification

| Field     | Value                                                            |
| --------- | ---------------------------------------------------------------- |
| Document  | Slice Certification                                              |
| Programme | **APZHUB-ENG-001**                                               |
| Status    | **IN FORCE**                                                     |
| Process   | [ENGINEERING-SLICE-STANDARD.md](./ENGINEERING-SLICE-STANDARD.md) |

Defines **slice-level** certification outcomes. This is not full product CERTIFICATION (CERT programmes) unless the Owner instruction requires product CERT.

Portfolio certification lifecycle: [APZHUB Lifecycle Standard](../governance/APZHUB-LIFECYCLE-STANDARD.md) · [lifecycle-standard certification](./lifecycle-standard/v1.0/certification/).

---

## Outcomes

| Result               | Meaning                                                          | May commit as complete?        |
| -------------------- | ---------------------------------------------------------------- | ------------------------------ |
| **PASS**             | All acceptance criteria met; security/docs/repo gates green      | Yes                            |
| **CONDITIONAL PASS** | Criteria met with Owner-accepted residual risk / waiver recorded | Yes, only with waiver evidence |
| **FAIL**             | One or more gates failed; fixable in-slice                       | No — fix or STOP               |
| **BLOCKED**          | Cannot proceed without Owner decision or external dependency     | No — report and await          |

---

## Required evidence (minimum)

| Evidence                      | Required when                                                             |
| ----------------------------- | ------------------------------------------------------------------------- |
| Completion JSON               | Always                                                                    |
| Security JSON                 | Slice touches authz, ACL, tenant, upload, secrets, or public API security |
| Certification JSON            | Always                                                                    |
| Engineering notes             | Always for non-trivial slices                                             |
| Test command + result summary | Always                                                                    |
| Commit hashes                 | After commit                                                              |

Path pattern:

```text
docs/operations/evidence/{domain}/
  {TIMESTAMP}-{SLICE-ID}-COMPLETION.json
  {TIMESTAMP}-{SLICE-ID}-SECURITY.json
  {TIMESTAMP}-{SLICE-ID}-CERTIFICATION.json
```

---

## Gates

### Security gate

**PASS** requires:

- Default-deny preserved where applicable
- No cross-tenant leakage in tested paths
- No known bypass of authorised ACL
- Deny paths covered for missing permission / anonymous as applicable
- No secrets in code, logs, or evidence payloads

**FAIL** if any P0 security defect remains in slice scope.  
**BLOCKED** if a security defect is found outside slice scope and Owner decision is required.

### Documentation gate

**PASS** requires:

- Affected docs updated
- Closed limitations marked CLOSED with slice ID
- No contradictory standing records left stale for this slice

### Repository gate

**PASS** requires:

- Working tree clean after commits
- No unrelated changes
- Affected packages build / typecheck as required
- Repository remains releasable (mainline not broken)

### Regression gate

**PASS** requires:

- Targeted regression green per [ENGINEERING-SLICE-STANDARD.md](./ENGINEERING-SLICE-STANDARD.md) regression policy
- No known test failures introduced

---

## Regression policy (summary)

| Scope of change         | Required regression         |
| ----------------------- | --------------------------- |
| Local package           | Package tests               |
| Shared contract / authz | Package + consumers         |
| Migration / persistence | Migration + package + smoke |
| Release band close      | Per release plan            |

Full-repo Playwright is **not** required every slice.

---

## Relationship to product CERT

| Level                     | When                                  |
| ------------------------- | ------------------------------------- |
| Slice certification       | Every engineering slice               |
| Package / capability CERT | When Owner opens a CERT programme     |
| Freeze / Release          | Lifecycle suite — separate programmes |

A slice **PASS** does not imply product GA or freeze acceptance.

---

## Certification record (fields)

```json
{
  "slice": "{SLICE-ID}",
  "result": "PASS | FAIL | CONDITIONAL PASS | BLOCKED",
  "acceptanceCriteria": [],
  "securityGate": "PASS | FAIL | N/A",
  "documentationGate": "PASS | FAIL",
  "repositoryGate": "PASS | FAIL",
  "regressionGate": "PASS | FAIL",
  "waivers": [],
  "recommendation": "Ready for {next} | STOPPED"
}
```

---

## STOP

```text
NO SLICE COMPLETE WITHOUT CERTIFICATION RESULT
PASS ≠ PRODUCT CERT ≠ GA
```
