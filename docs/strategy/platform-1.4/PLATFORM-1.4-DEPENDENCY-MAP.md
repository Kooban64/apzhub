# Platform 1.4 Dependency Map

```
Platform-1.4-ARCH-001 (this programme)
        │
        ▼
Owner Architecture Acceptance
        │
        ├─► ADR-0073 (Durable Notification Runtime) ──► ENG Durable Runtime (E01)
        │         │
        │         ├─► Admin Maturity (E05) [conditional]
        │         └─► ADR-0074 (Provider) ──► POPIA programme (E03) ──► Provider ENG (E06) [conditional]
        │
        ├─► Capacity & Resilience (E02) ──► optional ADR-0075 if fan-out required
        │
        ├─► Full Regression / Playwright (E04) [can parallel after ARCH acceptance]
        │
        ├─► Release Automation (E07) [parallel, non-conflicting]
        │
        └─► Platform-1.4-CERT-001 (after authorised epics accepted)
                 └─► RR if needed └─► CERT-002 └─► Owner Final Certification └─► Release Closure
```

## Parallelism rules

- Do **not** run conflicting programmes on the same notification delivery ownership packages without sequencing via ADR-0073.
- E04 quality may run in parallel with E01 once Owner Architecture Acceptance is recorded.
- E06 must not start before ADR-0073 + ADR-0074 + E03 compliance precondition.
- Workflow Execute / Email SoR / FIN-001 programmes must not be opened under Platform 1.4 MUST.

## Safest order

1. ARCH-001 Owner Acceptance
2. ADR-0073 → ENG E01
3. E02 capacity (parallel with late E01)
4. E03 POPIA pack
5. E04 full regression/Playwright
6. E05 admin (after E01)
7. ADR-0074 → E06 only if Owner includes in scope
8. CERT train
