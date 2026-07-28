# APZ TCMS 1.0.0 — Administrator Guide

> **Product:** APZ TCMS  
> **Version:** **1.0.0**  
> **Audience:** Platform administrators · operators  
> **Date:** 2026-07-19

---

## Prerequisites

- APZHUB platform deployed (PostgreSQL, Redis, Better Auth)
- Testing/certification permissions assigned via PermissionService
- Evidence storage configured (refs only — never commit secrets)
- Optional: GHA provider credentials as references for live CI metadata path

## Enablement checks

1. Testing module appears for authorised roles
2. `/api/v1/testing/*` returns standard envelopes under AuthZ
3. GHA adapter health (if enabled) without exposing GitHub as primary UX
4. Search publication healthy when Unified Search is enabled

## Security

- No Kiwi (or other TCMS engine) login for standard users
- Superadmin is an explicit tier — not a silent AuthZ bypass
- Correlate API operations with platform correlation IDs
- Never log GHA tokens or evidence storage secrets

## Backup

- Backup platform PostgreSQL (TCMS metadata)
- Backup evidence object storage per provider runbooks

## Out of scope ops (Release 1.0)

Kiwi sync · GitLab CI · AI Assist · GHA workflow dispatch/rerun as product features

## Related

- [Operational Readiness](../APZ-TCMS-1.0-OPERATIONAL-READINESS.md)
- [Compatibility](../APZ-TCMS-1.0-COMPATIBILITY.md)
