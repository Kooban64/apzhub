# Product Testing Standard (Definition Stage)

> **Programme:** APZHUB-PRODUCTS-003 · Aligns with framework Quality / Certification standards

## Purpose

Definition must state how the product will prove quality — not execute tests yet.

## Mandatory testing strategy content

| Layer                  | Definition must state                              |
| ---------------------- | -------------------------------------------------- |
| Unit                   | Domains/services expected coverage intent          |
| Integration            | Service ↔ adapter boundary; mock engines preferred |
| UI                     | Playwright product journeys (APZHUB UI only)       |
| API                    | Route/handler contract tests                       |
| Performance            | Soft/hard targets if user-facing scale matters     |
| Security               | Authz denial cases; tenant isolation if applicable |
| Regression             | Suite ownership                                    |
| Accessibility          | WCAG AA target for UI changes                      |
| Operational            | Health, failover, backup restore intent            |
| Certification criteria | Which gates block release                          |

## Brand mask testing

Definition must require tests that fail if engine brand names appear in user-visible chrome.

## Certification alignment

Testing strategy must be compatible with [../framework/PRODUCT-CERTIFICATION-STANDARD.md](../framework/PRODUCT-CERTIFICATION-STANDARD.md) classifications.
