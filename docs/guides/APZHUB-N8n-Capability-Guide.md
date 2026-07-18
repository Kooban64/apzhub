# APZHUB n8n Capability Guide

## Supported operations

`list` · `get` · `validate` · `metadata` · `capabilities` · `health` · `diagnostics` · `compatibility`

## Services

| Service                 | Support                     |
| ----------------------- | --------------------------- |
| workflows               | supported                   |
| workflowTemplates       | partial                     |
| credentialsMetadata     | supported (metadata only)   |
| variablesMetadata       | partial (edition-dependent) |
| executionsMetadata      | supported (metadata only)   |
| tags                    | supported                   |
| users                   | partial                     |
| projects                | partial                     |
| version / compatibility | supported                   |

## Unsupported (by design)

`create` · `update` · `delete` · `execute` · `activate` · `deactivate` · `schedule` · `webhook` · `credentialSecrets`

Return `N8nNotSupportedError` / NOT_SUPPORTED for unavailable edition endpoints.
