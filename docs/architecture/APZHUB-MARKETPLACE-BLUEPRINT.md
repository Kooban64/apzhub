# APZHUB Marketplace Blueprint (design only)

| Field           | Value                                               |
| --------------- | --------------------------------------------------- |
| Status          | **BLUEPRINT** — partner storefront runtime deferred |
| Programme       | SPR-IAM-COMMERCIAL-001                              |
| Near-term store | APZHUB direct catalogue (`catalogue-service`)       |

## Intent

Enable third-party / partner extensions later without redesigning Billing or Entitlements.

## Near-term (shipped)

- Direct SKUs: org plans, pen-test, QA report
- PayFast checkout
- Entitlement gates in Platform Services

## Future partner marketplace (not in this sprint)

| Piece               | Notes                               |
| ------------------- | ----------------------------------- |
| Seller onboarding   | KYC, tax, payout bank               |
| Listing review      | Security + architecture compliance  |
| Revenue share       | Platform fee + seller settlement    |
| Extension install   | Manifest-first modules via registry |
| Entitlement mapping | Partner SKU → capability keys       |

## Non-goals now

- No public seller portal
- No multi-vendor storefront UI
- No payout engine

When Owner authorises marketplace runtime, open a new sprint guide that consumes this blueprint and `catalogue-service` extension points.
