# Configuration Workbench Navigation Guide

Primary route: `/workspace/configuration`

| Section        | Path                                      | Permission                 |
| -------------- | ----------------------------------------- | -------------------------- |
| Overview       | `/workspace/configuration/overview`       | `configuration.read`       |
| Configurations | `/workspace/configuration/configurations` | `configuration.read`       |
| Namespaces     | `/workspace/configuration/namespaces`     | `configuration.read`       |
| Groups         | `/workspace/configuration/groups`         | `configuration.read`       |
| Versions       | `/workspace/configuration/versions`       | `configuration.version`    |
| Overrides      | `/workspace/configuration/overrides`      | `configuration.manage`     |
| Scopes         | `/workspace/configuration/scopes`         | `configuration.read`       |
| Validation     | `/workspace/configuration/validation`     | `configuration.validation` |
| References     | `/workspace/configuration/references`     | `configuration.read`       |
| Audit          | `/workspace/configuration/audit`          | `configuration.audit`      |
| Diagnostics    | `/workspace/configuration/diagnostics`    | `configuration.read`       |

Navigation is manifest-driven. The shell never hard-codes Configuration entries outside Workbench discovery.
