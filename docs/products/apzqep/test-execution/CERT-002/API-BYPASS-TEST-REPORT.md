# API-BYPASS-TEST-REPORT — APZQEP-CERT-002

## Surface

| Method | Path                                             | Handler                                    | Enforcement                                                                             |
| ------ | ------------------------------------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| POST   | `/api/v1/qep/executions/:id/evidence-references` | `handleAssociateQepExecutionEvidence`      | `withPlatformApiAuth` → service.associateEvidence → PermissionPort + EvidenceAccessPort |
| GET    | same path                                        | `handleListQepExecutionEvidenceReferences` | Auth → listEvidenceReferences → READ + tenant `requireExecution`                        |

## Findings

1. **Hidden UI is not the boundary** — POST always hits server associate path.
2. **Client permission state** — not accepted as authority; server `PermissionPort.assertAny` + EvidenceAccessPort.
3. **Forged / modified payloads** — body validated via Zod schema; accessibility checked on URI.
4. **Replay** — each call re-evaluates permissions + evidence access (no sticky client grant).
5. **Handler unit tests** — confirm route invokes `associateEvidence` once; do not substitute for application security tests (those re-run PASS).

## Result

**No API bypass of EvidenceAccessPort identified for association.** List path is reference metadata under execution tenancy (ADR-0080), not a blob download bypass.
