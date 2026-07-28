# APZ Law Platform 1.0.0 — Commercial Product Guide

> **Product:** APZ Law Platform  
> **Version:** **1.0.0**  
> **Audience:** Product owners · commercial stakeholders · architects  
> **Date:** 2026-07-19

---

## What it is

**APZ Law Platform** is APZHUB’s primary commercial vertical for legal practice management. Release **1.0.0** packages the existing native Law application — matters, clients, documents, tasks, time, billing, calendar, and trust accounting — on Platform Core. Users see **Law Platform**, never third-party legal suite brands as the product identity.

## What users get

- Matters · Clients · Documents · Tasks
- Time · Billing / invoices
- Calendar
- Trust Accounting (ledger, reconciliation, interest, approvals, reports)
- Legal search / knowledge discovery
- Dashboard · Reports · Administration surfaces

## What it is not (Release 1.0)

A Clio/PracticePanther clone brand · Plane/Zammad as Law SoR · shared Financial Engine · Email inbox SoR · court e-filing product · practice-area specialty SKUs.

## Architecture (one sentence)

Law Workbench → APZHUB Gateway → Auth → Authz → Law Platform Services / native persistence (connectors only when OSS-backed adjacency is authorised).

## Related

- [Release Notes](../APZ-LAW-1.0-RELEASE-NOTES.md)
- [Practitioner Guide](./PRACTITIONER-GUIDE.md)
- [Administrator Guide](./ADMINISTRATOR-GUIDE.md)
- [Known Limitations](../../../products/apz-law/KNOWN-LIMITATIONS.md)
