# PLUGIN-ARCHITECTURE

| Field     | Value                   |
| --------- | ----------------------- |
| Programme | APZQEP-160              |
| Timestamp | 20260803T141613Z        |
| Stream    | F — Enterprise Platform |

## Intent

Extensibility without forking the core: runners, providers, integrations, and dashboard widgets register via manifests and SDKs.

## Extension types

| Type               | Examples                         |
| ------------------ | -------------------------------- |
| Runner plugin      | Playwright, k6, axe, custom      |
| Integration plugin | GitHub, GitLab, Azure DevOps     |
| AI provider plugin | Model/runtime backends           |
| Evidence exporter  | External archive / SIEM (future) |
| Dashboard widget   | Role-specific views              |

## Contracts

- Manifest-first (`integration.yaml` / capability manifests per platform SDKs)
- Capability discovery + health
- No business logic in UI components
- Marketplace-ready packaging later (Commercial Strategy)

## Version 1.0 alignment

Builds on existing Module / Service / Integration / Event SDKs (024–029). Does not invent a parallel plugin runtime in this programme.
