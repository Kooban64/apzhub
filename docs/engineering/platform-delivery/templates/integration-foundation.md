# {PROVIDER} — Integration Foundation

> **Programme:** {PROGRAMME_ID}  
> **Lifecycle phase:** Provider Integration  
> **Standard:** [Platform Delivery Standard](../PLATFORM-DELIVERY-STANDARD.md)

## Purpose

Certify Integration Adapter for {PROVIDER} as Service Connector for {CAPABILITY}.

## Manifest

- Path: `integrations/{provider}/integration.yaml`
- Status: drafted / registered

## Package

- Package name: …
- Location: `integrations/{provider}/`
- Integration SDK version: **1.0.0** (frozen unless ADR)

## Capabilities

| Capability | Supported | Notes |
| ---------- | --------- | ----- |
|            |           |       |

## Health & error translation

- Health endpoint/report: …
- Error categories mapped: …

## Certification class

**CERTIFIED_FOUNDATION** (or stronger if authorised)

## Known limitations

- …

## Single recommendation

**{CERTIFIED_FOUNDATION | …}**

## Exit checklist

- [ ] `integration.yaml` before code
- [ ] Package builds / typechecks
- [ ] Unit + integration adapter tests
- [ ] No business logic in adapter
- [ ] CERTIFICATION-REPORT
- [ ] Docs under `docs/integrations/{provider}/`
- [ ] Completion + Acceptance reports
- [ ] SDK freeze intact
