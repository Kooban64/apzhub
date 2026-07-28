# Product Lifecycle — Definition Gate

> **Programme:** APZHUB-PRODUCTS-003 · Aligns with [../framework/PRODUCT-LIFECYCLE.md](../framework/PRODUCT-LIFECYCLE.md)

## Mandatory lifecycle

```text
Product Definition
  ↓
Business Approval
  ↓
Architecture
  ↓
Architecture Decisions (Product / Platform ADRs as required)
  ↓
Engineering Design
  ↓
Implementation
  ↓
Operational Readiness
  ↓
Approved Remediation
  ↓
Build Validation
  ↓
Certification
  ↓
Production Release
  ↓
Maintenance
```

## Stage rules

| Stage                      | Entry criteria                                            | Exit criteria                           |
| -------------------------- | --------------------------------------------------------- | --------------------------------------- |
| **Product Definition**     | Owner authorises Definition work (or portfolio authority) | Complete template + checklist           |
| **Business Approval**      | Definition READY FOR BUSINESS APPROVAL                    | Owner/business ACCEPTED Definition      |
| **Architecture**           | Business-approved Definition                              | ARCHITECTURE.md + ADRs as required      |
| **Architecture Decisions** | Architecture draft                                        | ADRs Owner-accepted where required      |
| **Engineering Design**     | Architecture accepted for programme                       | Design pack                             |
| **Implementation**         | Named Engineering programme Owner-approved                | Code within scope                       |
| **Operational Readiness**  | Engineering Acceptance                                    | OR pack                                 |
| **Approved Remediation**   | Owner-approved findings only                              | REM closed                              |
| **Build Validation**       | Packaging scope clear                                     | BLD evidence                            |
| **Certification**          | Prior stages complete                                     | CERT classification                     |
| **Production Release**     | Owner CERT Acceptance                                     | SemVer evidence                         |
| **Maintenance**            | Release CLOSED                                            | Patches/minors/majors via new Approvals |

## Hard gate (binding)

**No product may enter Architecture until:**

1. APZHUB-PRODUCTS-003 (this standard) is Owner-**ACCEPTED**, and
2. That product’s Definition is Business-**APPROVED**.

## Relationship to Framework

The Product Engineering Framework (PRODUCTS-002) defines how products are built on Platform 1.4.  
This Definition Standard defines **what must be known before Architecture starts**.
