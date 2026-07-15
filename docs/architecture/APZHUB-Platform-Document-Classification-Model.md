# APZHUB Platform Document — Classification Model

**Milestone:** APZDOCS-001  
**Status:** Catalogue only — no policy engine

## Codes

| Code | Meaning |
|------|---------|
| `public` | Publicly shareable |
| `internal` | Internal default |
| `confidential` | Confidential |
| `restricted` | Restricted access |
| `legal` | Legal matter content |
| `financial` | Financial records |
| `compliance` | Compliance artefacts |
| `evidence` | Evidence packs |
| `generated_report` | Reporting Platform outputs |
| `template` | Templates |
| `attachment` | Attachments |
| `custom` | Requires `customCode` |

## Rules

- Classification is validated against the catalogue.
- `custom` requires a non-empty `customCode`.
- No automatic policy evaluation, DLP, or label inheritance engines in this milestone.
