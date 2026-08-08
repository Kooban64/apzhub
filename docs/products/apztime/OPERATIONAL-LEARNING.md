# APZ Time — Operational Learning

| Field     | Value                        |
| --------- | ---------------------------- |
| Status    | **IN FORCE**                 |
| Timestamp | 20260808T204500Z             |
| Baseline  | Version 1.0 (`apz-time-1.0`) |

## Rule

Every completed APZ Time release records Operational Learning.  
Friction is classified: Engineering · Operational · User · Training · Documentation · Product Enhancement · Portfolio Capability.

## Where to record

| Artefact          | Path                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Friction Log      | [../apzqep/apzqep-adopt-001/FRICTION-LOG.md](../apzqep/apzqep-adopt-001/FRICTION-LOG.md)                                   |
| Learning Register | [../apzqep/apzqep-adopt-001/OPERATIONAL-LEARNING-REGISTER.md](../apzqep/apzqep-adopt-001/OPERATIONAL-LEARNING-REGISTER.md) |
| Emerging Patterns | [../framework/APZHUB-EMERGING-PORTFOLIO-PATTERNS.md](../framework/APZHUB-EMERGING-PORTFOLIO-PATTERNS.md)                   |

## Time-specific learning themes

- Did users stay on Overview → Timesheets, or drift into operator health/diagnostics?
- Were approvals / reporting UI demands correctly classified as Time 2.0 / Product Board?
- Did production in-memory attempts get blocked with honest failure?
- Did engine/adapter branding leak into user-facing copy or support tickets?
- Was partial tags search mis-reported as a platform outage?

## Anti-patterns

- Opening Time 2.0 from a single friction note
- Enabling `APZHUB_TIME_DOMAIN_MODE=in_memory` in production
- Treating missing reporting UI as Native Adoption failure
- Jumping to Platform Evolution before Portfolio Completion freeze
