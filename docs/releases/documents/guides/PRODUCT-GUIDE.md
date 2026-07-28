# APZ Documents 1.0.0 — Commercial Product Guide

> **Product:** APZ Documents  
> **Version:** **1.0.0**  
> **Audience:** Product owners · commercial stakeholders · architects  
> **Date:** 2026-07-19

---

## What it is

**APZ Documents** is the APZHUB commercial product for enterprise document **metadata**, organisation, permissions, and discovery inside the Workbench. Release **1.0.0** packages the certified native Documents Platform (APZDOCS) — not an external DMS brand.

## What users get

- Document metadata SoR with versions (descriptors), folders, collections, tags
- Lifecycle actions: classify, archive, restore, retention descriptors
- Permission-driven Workbench at `/workspace/documents`
- Platform HTTP at `/api/v1/documents`
- Search publication into Unified Search

## What it is not (Release 1.0)

A full binary DMS (uploads/downloads/OCR/preview/editing), Paperless-ngx, or an AI document assistant.

## Architecture (one sentence)

Module → Gateway → Auth → Authz → Platform Document Services → Core / Persistence / Storage.

## Related

- [Release Notes](../APZ-DOCUMENTS-1.0-RELEASE-NOTES.md)
- [User Guide](./USER-GUIDE.md)
- [Administrator Guide](./ADMINISTRATOR-GUIDE.md)
- [Known Limitations](../../../products/apz-documents/KNOWN-LIMITATIONS.md)
