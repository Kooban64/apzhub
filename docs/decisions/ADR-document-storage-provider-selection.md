# ADR — Document Storage Provider Selection

> **Status:** Accepted  
> **Date:** 2026-07-13  
> **Milestone:** APZDOCS-002

## Context

APZDOCS-001 defined provider kinds including Azure Blob and GCS. Self-hosted OSS priority and implementation cost force prioritisation.

## Decision

Implement **filesystem** (dev/on-prem with explicit production flag) and **S3-compatible** (AWS S3 / MinIO) in `@apzhub/document-storage` **0.1.0**. Keep Azure/GCS as **unimplemented placeholders** (`implemented: false`) that cannot be registered. Memory provider is **test-only**.

## Consequences

- Production path is S3-compatible first
- Filesystem requires `allowFilesystemInProduction`
- New cloud providers need a later milestone + SDK dependency review (core stays SDK-free)

## Alternatives considered

- Implement all three clouds in APZDOCS-002 — rejected (scope)
- Filesystem-only — rejected for multi-node production
