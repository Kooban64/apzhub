# APZHUB Configuration Authorization Guide

**Milestone:** APZCONFIG-002

## Permissions

| Permission                 | Use                                           |
| -------------------------- | --------------------------------------------- |
| `configuration.*`          | Wildcard                                      |
| `configuration.read`       | list/get/diagnostics                          |
| `configuration.manage`     | configurations, namespaces, groups, overrides |
| `configuration.version`    | version create/publish/deprecate              |
| `configuration.validation` | validate metadata, list rules                 |
| `configuration.audit`      | audit list/get                                |

## Operation map

Service keys: `configurationConfigurations`, `configurationNamespaces`, `configurationGroups`, `configurationVersions`, `configurationOverrides`, `configurationScopes`, `configurationValidation`, `configurationReferences`, `configurationAudit`, `configurationDiagnostics`.

Production mode is **deny-by-default** — no allow-all in bootstrap.

## Enablement

Set `APZHUB_CONFIGURATION_ENABLED=true` and provide PostgreSQL via `DATABASE_URL`.
