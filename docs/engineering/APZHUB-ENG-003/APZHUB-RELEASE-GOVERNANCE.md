# APZHUB Release Governance

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZHUB-ENG-003   |
| Timestamp | 20260803T075550Z |

## Separation of powers

| Actor             | Authority                                             |
| ----------------- | ----------------------------------------------------- |
| Engineering       | Deliver under Owner Auth                              |
| Independent audit | Recommend GO / NO-GO                                  |
| Product Board     | Authorise release / GA / promotion / deploy authority |
| Operations        | Execute deploy per procedures when authorised         |
| Release process   | Tag / promote when scheduled under Board authority    |

## Release path

```text
Engineering COMPLETE
 → Readiness Audit (GO recommended | NO-GO)
 → [Remediation + Re-cert if needed]
 → Product Board Resolution (GO | NO-GO)
 → General Availability (if GO)
 → Ops-led standing cycle
```

## Mandatory release artefacts

| Artefact               | Purpose                          |
| ---------------------- | -------------------------------- |
| Version Manifest       | Packages, compatibility, support |
| Release Notes          | What ships                       |
| Release Checklist      | Gate confirmation                |
| Known Limitations      | Accepted residuals               |
| Issue Register         | Blockers / highs                 |
| Go/No-Go Report        | Audit recommendation             |
| Board Release Decision | Binding GO / NO-GO               |
| Release Authority      | What Board authorised            |

## Package promotion

Board may **authorise** promotion. Execution is a controlled release process — not ad hoc engineering inside a Board resolution or audit.
