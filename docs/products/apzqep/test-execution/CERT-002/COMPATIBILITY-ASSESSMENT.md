# COMPATIBILITY-ASSESSMENT — APZQEP-CERT-002

| Area                         | Changed?                                                 | Classification             |
| ---------------------------- | -------------------------------------------------------- | -------------------------- |
| Public REST paths            | No                                                       | Compatible                 |
| Request/response DTO shapes  | No material change                                       | Compatible                 |
| Internal port contract       | Yes — typed decisions + required evidenceAccess          | Internal consumers updated |
| Event contracts              | No                                                       | Compatible                 |
| Database schema / migrations | No                                                       | Compatible                 |
| Package exports              | Additive helpers/types                                   | Compatible                 |
| Workbench routes             | No                                                       | Compatible                 |
| Configuration                | Bootstrap now requires affirmative evidence check wiring | Documented secure default  |
| Deployment                   | No new infra                                             | Compatible                 |
| Observability                | Deny audit action added                                  | Compatible                 |

## Overall

```text
COMPATIBLE_WITH_DOCUMENTED_CHANGE
```

Security semantics tightened: previously insecure unconfigured deployments that silently allowed association now deny. This is an intentional security correction, not an unrelated breaking public API change.
