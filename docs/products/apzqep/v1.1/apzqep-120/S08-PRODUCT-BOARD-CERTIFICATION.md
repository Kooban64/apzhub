# APZQEP-120-S08 — Product Board Certification

| Field                     | Value                                  |
| ------------------------- | -------------------------------------- |
| Programme                 | APZQEP-120                             |
| Slice                     | S08                                    |
| Title                     | Reliable Event Delivery (Outbox Drain) |
| Decision                  | **CERTIFIED**                          |
| Engineering certification | PASS (`S08-CERTIFICATION.md`)          |
| Decision (UTC)            | 20260802T142940Z                       |
| Governance                | UNCHANGED                              |
| Baseline                  | UNCHANGED                              |

---

## Product Board decision

```text
APZQEP-120-S08
Decision: CERTIFIED
```

## Assessment (accepted)

- Enterprise Outbox Platform (`@apzhub/platform-outbox` **0.2.0**)
- Durable event persistence
- Retry platform, locking, delivery lifecycle
- Transport abstraction with Null DeliveryPort
- Observability and DLQ preparation hooks
- Evidence integration without domain transport leakage
- Documentation, engineering certification, regression PASS
- Architectural balance: prove in product, abstract when justified — **justified**

## Architecture outcome (accepted)

```text
Application Service
  → Domain Events
    → Platform Outbox
      → DeliveryPort
        → Future Transport
```

- APZQEP owns business semantics
- Platform Outbox owns reliable delivery
- Future transports are adapters only

## Platform rule (recorded)

No APZHUB product may implement its own Outbox engine. Products SHALL consume `@apzhub/platform-outbox`. See [OUTBOX-ARCHITECTURE.md](./OUTBOX-ARCHITECTURE.md) § Platform Rule.

## Consequence

```text
Reliable delivery foundation: ESTABLISHED
Downstream slices may consume delivered events via processing (S09+)
S09: Reliable Processing — recommended next (awaits Owner authorisation)
S10–S13: operational processing, search, notifications, command palette — later
```

## Related

- [S08-COMPLETION.md](./S08-COMPLETION.md)
- [S08-CERTIFICATION.md](./S08-CERTIFICATION.md)
- [OUTBOX-ARCHITECTURE.md](./OUTBOX-ARCHITECTURE.md)
- [S09 recommendation](./S09-PRODUCT-BOARD-RECOMMENDATION.md)
