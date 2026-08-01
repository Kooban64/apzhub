# Technical Roadmap — APZQEP v1.1 Programmes

Programmes are independently deliverable and closable under the Lifecycle Standard. Estimates are planning bands (S/M/L/XL), not commitments.

| Band | Meaning                                       |
| ---- | --------------------------------------------- |
| S    | ≤ 1 engineering wave equivalent               |
| M    | 1–2 waves / focused capability                |
| L    | Full capability track (ARCH→…→CERT or subset) |
| XL   | Multi-capability programme                    |

---

## Recommended programme sequence

| Programme      | Title                                              | Priority | Value     | Complexity | Risk | Deps                         | Size | Release |
| -------------- | -------------------------------------------------- | -------- | --------- | ---------- | ---- | ---------------------------- | ---- | ------- |
| **APZQEP-111** | v1.1 Architecture Baseline                         | P0       | High      | M          | Med  | Owner approval of APZQEP-110 | M    | 1.1     |
| **APZQEP-112** | LA Hardening — Evidence Storage & ACL              | P0       | Critical  | L          | High | 111; ADR-0088 decision       | L    | 1.1     |
| **APZQEP-113** | LA Hardening — TE Operability & Events             | P0       | Critical  | M          | Med  | 111                          | M    | 1.1     |
| **APZQEP-114** | Test Suites                                        | P0       | High      | L          | Med  | 111                          | L    | 1.1     |
| **APZQEP-115** | Test Runs                                          | P0       | High      | L          | Med  | 114, TE                      | L    | 1.1     |
| **APZQEP-116** | Defects                                            | P0       | High      | L          | Med  | 115 (soft)                   | L    | 1.1     |
| **APZQEP-117** | Unified Search + Notifications + Command Palette   | P1       | High      | M          | Med  | Platform search/notify; 111  | M    | 1.1     |
| **APZQEP-118** | Role Dashboards + QEP Home + Release Readiness MVP | P1       | High      | M          | Low  | 115–117                      | M    | 1.1     |
| **APZQEP-119** | AI Assist MVP (guardrails, RAG, 3–5 skills)        | P1       | High      | L          | High | 117; AI Framework            | L    | 1.1     |
| **APZQEP-120** | v1.1 Certification & Limited Release               | P1       | Critical  | M          | Med  | Prior 1.1 programmes         | M    | 1.1     |
| **APZQEP-121** | Coverage & Impact Engines                          | P2       | High      | XL         | High | 111+                         | XL   | 1.2     |
| **APZQEP-122** | Certification Engine (product)                     | P2       | Med       | L          | Med  | 121 soft                     | L    | 1.2     |
| **APZQEP-123** | ALM Integrations (Jira/Azure)                      | P2       | High      | L          | High | Integration SDK              | L    | 1.2     |
| **APZQEP-124** | Analytics & Executive Dashboards                   | P2       | Med       | L          | Med  | 118, 121                     | L    | 1.2     |
| **APZQEP-125** | Compliance & Unified Audit                         | P3       | Med       | M          | Med  | —                            | M    | 1.3     |
| **APZQEP-126** | GA Readiness (Evidence + TE)                       | P3       | High      | L          | High | 112–113, Owner               | L    | 1.3     |
| **APZQEP-200** | Portfolio QE / APZQEP 2.0 Architecture             | P3       | Strategic | XL         | High | 1.3 outcomes                 | XL   | 2.0     |

---

## Dependency graph (1.1)

```text
APZQEP-110 (this pack) — Owner Approve
        ↓
APZQEP-111 Architecture
        ↓
   ┌────┼────────────┐
   ↓    ↓            ↓
 112  113         114 Suites
   │    │            ↓
   │    │         115 Runs
   │    │            ↓
   │    │         116 Defects
   └────┴────→ 117 Search/Notify/Palette
                 ↓
              118 Dashboards
                 ↓
              119 AI MVP
                 ↓
              120 Cert + Limited Release
```

## Engineering constraints

- Business logic in Platform Services only
- Manifest-first modules/services/events
- No module→connector calls
- Evidence SoR decision is Owner-gated (ADR-0088)
- AI never bypasses services or permissions

## What “done” means per programme

Each programme produces: Owner instruction · design/spec as required · implementation · tests · evidence · acceptance · CLOSED — then stop.
