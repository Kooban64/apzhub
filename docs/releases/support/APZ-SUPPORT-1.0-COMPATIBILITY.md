# APZ Support 1.0.0 — Compatibility Statement

> **Release:** APZ Support **1.0.0**  
> **Classification:** Documentation packaging of Production baseline  
> **Packaging programme:** APZHUB-RELEASES-001

| Component                           | Version                    | Status                                     |
| ----------------------------------- | -------------------------- | ------------------------------------------ |
| `@apzhub/integration-sdk`           | **1.0.0**                  | **Unchanged** (Architecture Frozen)        |
| `@apzhub/integration-zammad`        | **0.6.0**                  | **Unchanged** (CERTIFIED_WITH_LIMITATIONS) |
| Support Platform Services / Gateway | As certified OSS-110-10…12 | **Unchanged** by packaging                 |
| Support HTTP `/api/v1/support-*`    | As certified OSS-110-11    | **Unchanged** by packaging                 |
| Support Workbench UI                | OSS-110-13/14 PRWL         | **Unchanged** by packaging                 |
| APZ Projects                        | **1.1.0**                  | Unaffected                                 |
| APZ Time                            | **1.0.0**                  | Unaffected                                 |
| Plane / Kimai integrations          | **0.6.0** / **0.2.0**      | Unaffected                                 |

## Notes

1. Client → Platform HTTP → Gateway → Platform Services → Connector → Engine only.
2. Engine branding (Zammad) remains hidden from standard users.
3. Packaging introduces **no** new HTTP paths, packages, or adapter capabilities.
4. Future **2.0.0** is a Major line — not part of this baseline.
