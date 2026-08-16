# SPR-UX-PHASE-I — User Inspector flagship deepen

> **Status:** **COMPLETE · CERTIFIED 100%** — 2026-08-16  
> **Authority:** [OWNER-UX-STREAM-006-SUPERSEDE](../decisions/OWNER-UX-STREAM-006-SUPERSEDE.md) · [UX-STREAM-006](../ux/UX-STREAM-006-tenant-identity-rbac-administration.md) §§40–45  
> **Gap map:** [PHASE-I-USER-INSPECTOR-GAP-MAP](./PHASE-I-USER-INSPECTOR-GAP-MAP.md)  
> **Depends on:** Phase A thin inspector · Phase G/H resource scopes · Professional Tools ledger  
> **Does not:** Sessions/Activity/Audit live streams · Access-request workflows · New Owner ADR

## Intent

Deepen Stream 6 **User Inspector** from thin why-lines to flagship tabs:

Overview · Products · Roles · Scopes · Professional Tools · Provisioning

Each line carries **explain-why** (granted by / denied because).

## Signature ships

| ID  | Ship                                                            |
| --- | --------------------------------------------------------------- |
| I0  | Sprint + gap map                                                |
| I1  | Inspection payload tabs (products/roles/scopes/tools/provision) |
| I2  | `UserInspectorPanel` tabbed UI on Org members                   |
| I3  | Unit tests + certify                                            |

## Definition of Done

- API returns structured `tabs` with explain-why per line
- Org Admin members surface shows tabbed inspector
- Scopes surface Phase G/H grant keys when present
- Professional Tools status independent of product grants
- Gap map CERTIFIED
