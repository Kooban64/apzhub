# APZHUB Future Configuration Platform Guide

**Status:** Informational roadmap only  
**Declared:** APZCONFIG-006  
**Implementation:** **Do not implement** without a new owner-approved programme

---

## Purpose

Describe possible future programmes that build *beyond* the frozen Configuration metadata SoR. This document is guidance only.

## Frozen baseline (do not alter here)

APZCONFIG-001…006 certified metadata plane remains frozen. See [Architecture Freeze Notice](../architecture/APZHUB-Configuration-Architecture-Freeze-Notice.md).

## Possible future programmes (roadmap)

### 1. Runtime Configuration Platform (recommended next label: APZCONFIG-007)

- Runtime resolution of effective values across hierarchy/overrides
- Safe application to consuming services
- Explicit separation from metadata SoR APIs
- Must not bypass Platform Services / Gateway

### 2. Feature Flag Platform

- Flag definitions, targeting, evaluation, and audit
- Distinct product surface — not a silent extension of Configuration SoR
- Evaluation must be permissioned, tenant-isolated, and observable

### 3. Secrets Platform

- Secret storage, rotation, reference resolution
- Vault or equivalent integration behind Integration SDK adapters
- Configuration SoR may hold *references* only — never secret payloads

### 4. Configuration Rollout Platform

- Staged rollout, canaries, freeze windows
- Orchestration via Platform Services + jobs — not HTTP request handlers
- Rollback execution as a governed operation (distinct from version metadata)

## Rules for any future programme

1. New programme guide + owner approval before code
2. ADR for any interaction with the frozen Configuration SoR
3. Same lifecycle: Foundation → Services → HTTP → Client → Workbench → Certification
4. No layer bypass
5. No merging secrets/flags/runtime apply into Configuration SoR tables without ADR

## Explicit non-goals of this document

- No implementation
- No HTTP routes
- No Workbench changes
- No Core/Persistence changes under APZCONFIG-006
