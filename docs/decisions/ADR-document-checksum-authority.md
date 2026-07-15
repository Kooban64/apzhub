# ADR — Document Checksum Authority

> **Status:** Accepted  
> **Date:** 2026-07-13  
> **Milestone:** APZDOCS-002

## Context

Object stores return ETags that may be MD5 of a single part, composite multipart tokens, or vendor-specific values. Treating ETag as integrity would create false confidence.

## Decision

**SHA-256 hex computed by APZHUB** over collected bytes is the sole canonical checksum. Provider ETags may be stored observationally but are always ignored for verification (`providerEtagIgnored: true`). Algorithm catalogue for content versions is `sha256` only.

## Consequences

- Consistent integrity across filesystem and S3/MinIO
- Verification re-reads/re-hashes platform-side expectations
- Future algorithms require explicit contract + migration changes

## Alternatives considered

- Trust S3 checksum headers only — rejected (provider variance)
- MD5 for compatibility — rejected for new platform content
