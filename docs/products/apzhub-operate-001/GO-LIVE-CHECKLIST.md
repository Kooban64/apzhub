# Go-Live Checklist — Internal Rollout

| Field     | Value              |
| --------- | ------------------ |
| Programme | APZHUB-OPERATE-001 |
| Status    | **IN FORCE**       |

Use before controlled internal rollout. Owner signs off; this programme does not deploy production.

## Platform

- [ ] APZHUB reachable for intended internal users (URL, TLS, DNS)
- [ ] Authentication works (single sign-in; no engine login screens for staff)
- [ ] My Work loads at `/workspace/home`
- [ ] Activity Bar shows only permitted products
- [ ] Health endpoint / ops monitoring acceptable for internal use

## Products (RI set)

- [ ] APZ Projects usable for pilot cohort
- [ ] APZ Support usable for pilot cohort
- [ ] APZ Time usable for pilot cohort
- [ ] APZQEP process known to engineering cohort (ops packs in force)

## People

- [ ] Pilot cohort identified (roles per [ROLE-ENABLEMENT.md](./ROLE-ENABLEMENT.md))
- [ ] Accounts provisioned
- [ ] Onboarding path validated with at least one dry-run user
- [ ] Internal support contact published ([SUPPORT-MODEL.md](./SUPPORT-MODEL.md))

## Operations

- [ ] Support model accepted by Operations / Admin
- [ ] Metrics owners named ([OPERATIONAL-METRICS.md](./OPERATIONAL-METRICS.md))
- [ ] 30-day plan scheduled ([30-DAY-ADOPTION-PLAN.md](./30-DAY-ADOPTION-PLAN.md))
- [ ] 90-day learning cadence scheduled ([90-DAY-LEARNING-PLAN.md](./90-DAY-LEARNING-PLAN.md))
- [ ] My Work Review cadence agreed

## Explicit freeze at go-live

- [ ] No new product programmes opened as part of go-live
- [ ] No speculative capabilities in the go-live scope
- [ ] Rollout communication states Observe → Learn → Review → Invest

## Sign-off

| Role                   | Name | Date | Pass |
| ---------------------- | ---- | ---- | ---- |
| Platform Administrator |      |      | ☐    |
| Product Board / Owner  |      |      | ☐    |
