# Recommendations — Platform 1.2.0 Operational Readiness

> **Programme:** APZHUB-OPS-001  
> **Date:** 2026-07-22

## Immediate (before cutover)

1. Treat [PRODUCTION-READINESS.md](./PRODUCTION-READINESS.md) actions **A1–A8** as Change prerequisites.
2. Do not copy `.env.example` into production without hardening.
3. Keep Workflow Execute gated; do not enable Email SoR claims.
4. Accept manual-triage monitoring (PL12-KL-02) with named on-call.

## Near-term (after cutover, Owner-authorised)

1. CD + image promotion pipeline.
2. Automated dependency vulnerability scanning.
3. Production restore drill cadence (≤90-day evidence).
4. Programme for live Observe delivery when prioritised.

## Do not

- Begin Platform 1.3 under this acceptance.
- Perform opportunistic engineering/refactors.
- Redesign architecture to “fix” ops gaps without a named programme.
