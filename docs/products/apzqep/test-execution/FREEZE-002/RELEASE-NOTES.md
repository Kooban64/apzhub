# Release Notes — Test Execution 1.0.1-rc.1

## Summary

Patch Release Candidate for APZ QEP **Test Execution** addressing CERT-001 limitation **L-02** (EvidenceAccessPort default-allow). Independently delta-certified under APZQEP-CERT-002 (**CERTIFIED_WITH_LIMITATIONS**).

## Security fix

- Fail-closed `EvidenceAccessPort` with typed access decisions
- Required server-side enforcement on `associateEvidence`
- Unconfigured / indeterminate / adapter-failure outcomes **deny**
- Affirmative baseline evidence-access policy wired in production bootstrap
- Denied association audit: `evidence_access_denied`

## Classification

**CERTIFIED_WITH_LIMITATIONS** (delta) · **LIMITED_AVAILABILITY** retained for operational browser readiness

## Known limitations

| ID      | Status                                                         |
| ------- | -------------------------------------------------------------- |
| L-01    | Open (accepted)                                                |
| L-02    | **CLOSED**                                                     |
| L-03    | Open (accepted)                                                |
| L-04    | Open (accepted)                                                |
| L-OP-01 | Playwright authenticated journeys partially verified — GA hold |

## Not in this RC

- Unrestricted General Availability approval
- Final package identity **1.0.1** (promotion under RELEASE-002)
- OpenAPI publication
- Outbox dispatcher
- Fine-grained Evidence Management ACL beyond baseline URI/actor policy

## Upgrade from 1.0.0

Apply candidate **1.0.1-rc.1** (then promoted **1.0.1** after RELEASE-002). No database migration required for L-02. Behaviour change: previously silent allow when evidence check omitted now **denies**.
