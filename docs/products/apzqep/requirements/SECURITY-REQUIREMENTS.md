# APZ QEP — Security & Compliance Requirements

> **Programme:** APZQEP-REQ-001 · IDs: SEC-* · RR-*  
> **Rule:** Zero Trust · least privilege · Platform Authn/Authz · immutable audit for certification

## Security requirements

| ID      | Topic            | Requirement                                                              | Priority | Risk     | Acceptance criteria                          |
| ------- | ---------------- | ------------------------------------------------------------------------ | -------- | -------- | -------------------------------------------- |
| SEC-001 | Zero Trust       | Verify identity, permission, integrity, intent, context on every QEP API | P0       | Critical | No unauthenticated mutating routes           |
| SEC-002 | Authn            | Platform Identity (BetterAuth) only for standard users                   | P0       | Critical | No product login engine                      |
| SEC-003 | Authz            | PermissionService; server authoritative                                  | P0       | Critical | Deny by default                              |
| SEC-004 | Secrets          | No secrets in code/logs/repos; connector secrets via Platform patterns   | P0       | Critical | Secret scan / policy                         |
| SEC-005 | OWASP            | Protect against common web vulns via Gateway + validation                | P0       | High     | Input validation; CSRF/XSS platform controls |
| SEC-006 | Tenant isolation | Enforce tenant boundaries on all SoR access                              | P0       | Critical | Cross-tenant tests                           |
| SEC-007 | AI security      | AI tools inherit user permissions; no privilege escalation               | P0       | Critical | AIR + MCP authz                              |
| SEC-008 | MCP security     | MCP tools map to authorised service ops; certify not autonomous          | P0       | Critical | Tool catalogue reviewed                      |
| SEC-009 | Encryption       | TLS in transit; sensitive data encrypted at rest per Platform standards  | P0       | High     | Platform crypto posture                      |
| SEC-010 | Least privilege  | Dedicated service/worker identities for async jobs                       | P0       | High     | Worker identity model                        |

## Compliance regimes (RR-*)

| ID     | Regime             | Requirement                                                                                    | Priority | Risk     | Acceptance criteria                             |
| ------ | ------------------ | ---------------------------------------------------------------------------------------------- | -------- | -------- | ----------------------------------------------- |
| RR-001 | POPIA              | Personal data minimised; lawful basis documented                                               | P0       | Critical | Data categories in Definition; retention intent |
| RR-002 | GDPR               | Where EU subjects in scope, access/erasure via Platform patterns                               | P1       | High     | Applicability flagged per deployment            |
| RR-003 | ISO 9001           | Plans, evidence, certification support QMS alignment                                           | P2       | Medium   | Process artefacts exportable                    |
| RR-004 | ISO 27001          | Align with Platform Zero Trust and access management                                           | P1       | High     | Authz + audit + secrets NFRs                    |
| RR-005 | SOC 2              | Audit/access evidence suitable for SOC 2 narratives                                            | P2       | Medium   | Audit export available                          |
| RR-006 | OWASP              | See SEC-005                                                                                    | P0       | High     | Gateway controls                                |
| RR-007 | Audit retention    | Certification & privileged audit retained per policy (default ≥ 7 years intent for cert packs) | P0       | Critical | Retention policy documented                     |
| RR-008 | Evidence retention | Evidence metadata/refs aligned to release support lifecycle                                    | P0       | High     | Retention per evidence class                    |
| RR-009 | Digital signatures | Human electronic sign-off records mandatory; cryptographic e-sign optional later               | P1       | Medium   | Actor/timestamp/reason mandatory; crypto P2     |
| RR-010 | Immutable audit    | Certification and privileged history immutable                                                 | P0       | Critical | No silent rewrite of audit                      |
| RR-011 | Industry overlays  | Vertical overlays must not weaken QEP audit/certification                                      | P1       | Medium   | No bypass of FR-018/FR-031                      |

## Notes

- Compliance requirements state **intent**. Control implementation is Architecture/Engineering after Definition.
- Platform freezes (Email SoR, SMTP) remain; notifications use Platform Notification Framework only.
