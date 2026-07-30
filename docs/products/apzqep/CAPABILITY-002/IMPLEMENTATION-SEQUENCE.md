# Implementation Sequence — APZQEP-CAPABILITY-002

## Recommended multi-capability sequence

```text
1. Evidence Management          ← CAPABILITY-002 recommendation
2. Test Runs                    ← campaign orchestration over TE
3. Defect Management            ← observations → defects (+ evidence links)
4. Test Suites                  ← organisational grouping
5. Coverage & Quality Analytics
6. Reporting & Dashboards
7. AI-Assisted Testing
```

## Per Evidence Management (when Architecture authorised)

```text
Architecture (Owner-authorised id)
  → Engineering Specification
  → Engineering Waves (manifest-first; Build Contract)
  → ECR → Certification → Freeze → Release
```

Parallel ops (not blocking Architecture authorisation): GA-001 browser readiness for TE Limited Availability → unrestricted GA decision later.
