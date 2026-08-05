# APZHUB Platform Document — Permissions

**Milestone:** APZDOCS-001

## Catalogue

| Permission           | Intent                                                 |
| -------------------- | ------------------------------------------------------ |
| `document.read`      | Read / find / summarize                                |
| `document.write`     | Create / update metadata / tag / relate                |
| `document.manage`    | Archive / restore                                      |
| `document.admin`     | Diagnostics / operator surfaces                        |
| `document.classify`  | Change classification                                  |
| `document.retention` | Retention operations (future-ready)                    |
| `document.audit`     | Read audit trail                                       |
| `document.*`         | Wildcard grant (not a security bypass of other layers) |

## Enforcement (domain)

`createDocumentPlatformService` checks `DocumentRequestContext.permissions` when supplied. Empty/undefined permissions are treated as unconstrained for unit tests; production gateway authz arrives in later milestones.

## Non-goals

No UI permission surfaces · no HTTP authz map wiring in APZDOCS-001.
