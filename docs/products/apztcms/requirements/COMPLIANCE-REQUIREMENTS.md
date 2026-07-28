# APZ TCMS — Compliance Requirements

> **Programme:** APZTCMS-REQ-001 · IDs: RR-*

| ID     | Regime             | Requirement                                                                                       | Priority | Risk     | Acceptance criteria                                        |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------- | -------- | -------- | ---------------------------------------------------------- |
| RR-001 | POPIA              | Personal data in TCMS (names, emails in assignees/comments) minimised; lawful basis documented    | P0       | Critical | Data categories listed in Definition; retention intent set |
| RR-002 | GDPR               | Where EU subjects in scope, support access/erasure workflows via Platform patterns                | P1       | High     | GDPR applicability flagged per deployment                  |
| RR-003 | ISO 9001           | Quality process artefacts (plans, evidence, certification) support QMS alignment                  | P2       | Medium   | Process artefacts exportable                               |
| RR-004 | ISO 27001          | Security controls align with Platform Zero Trust and access management                            | P1       | High     | Authz + audit + secrets NFRs met                           |
| RR-005 | SOC 2              | Audit logging and access control evidence suitable for SOC 2 narratives                           | P2       | Medium   | Audit export available                                     |
| RR-006 | OWASP              | APIs protected against common web vulnerabilities via Platform gateway controls                   | P0       | High     | Validation, authz, CSRF/XSS platform controls              |
| RR-007 | Audit retention    | Certification and privileged audit retained per policy (default ≥ 7 years intent for cert packs)  | P0       | Critical | Retention policy documented                                |
| RR-008 | Evidence retention | Evidence metadata/refs retained aligned to release support lifecycle                              | P0       | High     | Retention per evidence class                               |
| RR-009 | Digital signatures | Support human electronic sign-off records for certification (cryptographic e-sign optional later) | P1       | Medium   | Sign-off actor/timestamp/reason mandatory; crypto P2       |
| RR-010 | Industry           | Vertical overlays (e.g. legal-tech suite) must not weaken TCMS audit                              | P1       | Medium   | No bypass of FR-012/FR-020                                 |

## Notes

- Compliance requirements state **intent**. Control implementation is Architecture/Engineering after Definition.
- Platform freezes (Email SoR, SMTP) remain; compliance notifications use Platform Notification Framework only.
