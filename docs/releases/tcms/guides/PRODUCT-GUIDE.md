# APZ TCMS 1.0.0 — Commercial Product Guide

> **Product:** APZ TCMS  
> **Version:** **1.0.0**  
> **Audience:** Product owners · commercial stakeholders · architects  
> **Date:** 2026-07-19

---

## What it is

**APZ TCMS** is APZHUB’s commercial Test & Certification Management System. Users work in the **Testing** module (Certification views included). Release **1.0.0** packages the native APZTCMS platform — not Kiwi TCMS and not a runner product (Playwright/Vitest).

## What users get

- Requirements · plans · suites · cases · executions
- Evidence · defects · coverage · quality gates
- Certification states · approvals
- CI metadata via GitHub Actions reference adapter (read-only certified path)
- Engineering Intelligence · executive dashboards
- Search publication into Unified Search

## What it is not (Release 1.0)

Kiwi TCMS · GitLab CI · AI auto-certification · a substitute for Vitest/Playwright · a GitHub admin console.

## Architecture (one sentence)

Module → Gateway → Auth → Authz → Platform Testing Services → Persistence / GHA adapter (where used).

## Related

- [Release Notes](../APZ-TCMS-1.0-RELEASE-NOTES.md)
- [Tester Guide](./TESTER-GUIDE.md)
- [Administrator Guide](./ADMINISTRATOR-GUIDE.md)
- [Known Limitations](../../../products/apz-tcms/KNOWN-LIMITATIONS.md)
