# APZQEP-REM-001 — L-02 Security Remediation Programme

| Field               | Value                                                          |
| ------------------- | -------------------------------------------------------------- |
| Programme           | **APZQEP-REM-001**                                             |
| Capability          | Test Execution                                                 |
| Type                | Controlled Post-Release Security Remediation                   |
| Status              | **IMPLEMENTED / AWAITING OWNER SECURITY REMEDIATION DECISION** |
| Candidate version   | `@apzhub/qep-test-execution` **1.0.1-rc.1**                    |
| Production baseline | `@apzhub/qep-test-execution` **1.0.0** (unchanged)             |
| Limitation          | **L-02** — EvidenceAccessPort default-allow                    |
| L-02 disposition    | **REMEDIATED_PENDING_VERIFICATION**                            |
| Governing standard  | APZ Engineering Lifecycle Standard v1.0                        |
| Date                | 2026-07-29                                                     |

## Purpose

Replace EvidenceAccessPort **default-allow** behaviour with secure **default-deny** enforcement so Test Execution can later progress from Limited Availability toward unrestricted GA (subject to CERT-002 and Owner decision).

## Governing authority (inherited)

APZ Engineering Lifecycle Standard v1.0 · APZQEP Constitution · Engineering Operating Model · Engineering Build Contract · ARCH-015 · OES-ENG-090A · Waves 1–5 · ECR-001 · CERT-001 · FREEZE-001 · RELEASE-001 · Risk Acceptance Register · production baseline 1.0.0.

## Authorised scope

Evidence access contract, default-deny enforcement, permission/policy integration for associate, API/server-side enforcement, audit of denied access, Workbench reflection of server authority only, security + regression tests, documentation, CERT-002 **planning only**.

## Explicitly not authorised

Unrelated features · RBAC/tenancy redesign · L-01/L-03/L-04 · unrestricted GA · CERT-002 execution · final 1.0.1 promotion · deployment · Lifecycle Standard modification.

## Mandatory stop

```text
IMPLEMENTED
AWAITING OWNER SECURITY REMEDIATION DECISION
```

Do not execute CERT-002, close L-02/RA-02, promote 1.0.1, publish, approve unrestricted GA, or deploy under this programme.
