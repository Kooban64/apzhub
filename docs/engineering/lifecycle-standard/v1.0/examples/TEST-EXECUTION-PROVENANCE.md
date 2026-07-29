# Example — Test Execution Provenance

| Item       | Value                                                |
| ---------- | ---------------------------------------------------- |
| Document   | Test Execution Provenance (reference implementation) |
| Version    | **1.0.0**                                            |
| Parent     | [../README.md](../README.md)                         |
| Capability | APZQEP Test Execution                                |

---

## Purpose

This note briefly points to **APZQEP Test Execution** as the empirical reference implementation that proved the APZ Engineering Lifecycle (ARCH → ES → Waves 1–5 → ECR → CERT → FREEZE → RELEASE). It is not a second copy of that programme’s evidence.

---

## Proven path

```text
OES-ARCH-015 (Architecture)
  → OES-ENG-090A (Engineering Specification)
  → ENG-100A…E (Waves 01–05)
  → ECR
  → CERT-001
  → FREEZE-001
  → RELEASE-001
```

Production baseline referenced by the Release programme: `@apzhub/qep-test-execution` **1.0.0** (availability class per Owner Release Decision — Limited Availability authorised; unrestricted GA subject to residual limitations).

---

## Where to read the evidence

| Stage                      | Location                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Capability index           | [../../../products/apzqep/test-execution/README.md](../../../products/apzqep/test-execution/README.md)                  |
| Architecture               | [../../../products/apzqep/test-execution/OES-ARCH-015/](../../../products/apzqep/test-execution/OES-ARCH-015/README.md) |
| Engineering Specification  | [../../../products/apzqep/test-execution/OES-ENG-090A/](../../../products/apzqep/test-execution/OES-ENG-090A/README.md) |
| Waves                      | `docs/products/apzqep/test-execution/ENG-100A` … `ENG-100E`                                                             |
| Freeze                     | [../../../products/apzqep/test-execution/FREEZE-001/](../../../products/apzqep/test-execution/FREEZE-001/README.md)     |
| Release                    | [../../../products/apzqep/test-execution/RELEASE-001/](../../../products/apzqep/test-execution/RELEASE-001/README.md)   |
| Operating Model validation | [../../oes/APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md](../../oes/APZOR-ENGINEERING-OPERATING-MODEL-VALIDATION.md)  |

---

## How adopters SHALL use this example

1. Treat Test Execution as **proof of practice**, not as product-specific mandatory naming.
2. Adopt [../README.md](../README.md) (Lifecycle Standard v1.0) as the product-agnostic authority once Owner-accepted.
3. Do **not** copy Test Execution package code or re-open that capability under this provenance note.

---

## STOP

```text
TEST EXECUTION = REFERENCE PROVENANCE
LIFECYCLE STANDARD = PRODUCT-AGNOSTIC AUTHORITY
```
