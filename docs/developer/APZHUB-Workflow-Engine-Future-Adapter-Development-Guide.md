# APZHUB Workflow Engine — Future Adapter Development Guide

**Milestone:** APZWORKFLOW-011  
**Status:** Guidance only — **do not implement** additional adapters without owner approval  
**Authority:** [Workflow Engine Reference Adapter Standard](../architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md)

---

## Intent

This guide explains how a **future** Workflow Engine adapter (Camunda, Temporal, Flowable, Zeebe, etc.) should be developed. It is **not** an implementation authorisation.

Roadmap item: **APZWORKFLOW-012 — Future Workflow Engine Adapters**.

## Prerequisites

1. Owner-approved milestone guide
2. Read [REFERENCE-ADAPTER-STANDARD](../architecture/REFERENCE-ADAPTER-STANDARD.md)
3. Read [Workflow Engine Reference Adapter Standard](../architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md)
4. Read Integration SDK (026) + frozen n8n architecture docs

## Recommended sequence (when approved)

1. `integration.yaml` + package scaffold under `integrations/{provider}/`
2. Adapter capabilities: connection, health, diagnostics, compatibility, read-only metadata
3. Platform Services wiring (`gateway.workflow.engine.*` or successor facet) — only if milestone authorises
4. HTTP + OpenAPI + typed client — only if milestone authorises
5. Workbench — only if milestone authorises
6. Vertical certification + freeze update

## Non-negotiables

- No Workbench → adapter bypass
- No HTTP → adapter bypass
- No execution unless explicitly scoped
- Product-neutral user-facing names
- CE / self-hosted first

## Copy the pattern, not the vendor

Use `@apzhub/integration-n8n` as the **structural** reference. Do not hardcode n8n semantics into new adapters.
