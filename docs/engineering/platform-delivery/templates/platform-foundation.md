# {CAPABILITY} — Platform Foundation

> **Programme:** {PROGRAMME_ID}  
> **Lifecycle phase:** Platform Foundation  
> **Standard:** [Platform Delivery Standard](../PLATFORM-DELIVERY-STANDARD.md)

## Purpose

Establish {CAPABILITY} as a first-class platform concern.

## Boundaries

| Layer            | Owns           | Must not                 |
| ---------------- | -------------- | ------------------------ |
| Module           | Presentation   | Call connectors/backends |
| Platform Service | Business logic | Skip connector           |
| Connector        | Translation    | Business rules           |
| Engine           | Provider SoR   | Platform identity        |

## Provider strategy

- **Primary provider:** {PROVIDER}
- **Edition:** Community Edition / self-hosted first
- **Future providers:** …

## Capability catalogue

| Capability ID | Description | Phase readiness |
| ------------- | ----------- | --------------- |
|               |             |                 |

## Security model (summary)

- Auth: BetterAuth session
- AuthZ: PermissionService / operation map (TBD in Services phase)
- Secrets: …

## Operational model (summary)

- Health hierarchy contribution
- Observability expectations

## ADRs

| ADR | Title | Status              |
| --- | ----- | ------------------- |
|     |       | Proposed / Accepted |

## Known limitations

- …

## Compatibility

- …

## Single recommendation

**FOUNDATION READY** (or other authorised wording)

## Exit checklist

- [ ] Platform overview
- [ ] Architecture
- [ ] Provider strategy
- [ ] Capability catalogue
- [ ] Security/ops models
- [ ] Known limitations
- [ ] Compatibility
- [ ] ADRs Accepted
- [ ] Completion + Acceptance reports
- [ ] No business modules
