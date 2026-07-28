# Programme Plan — Recommended Platform 1.3 Engineering Sequence

> **Programme:** APZHUB-PLAN-001  
> **Date:** 2026-07-22  
> **Note:** IDs are **recommendations**. Owner assigns formal Approval before any code.

| Programme ID              | Epic    | Objectives                           | Dependencies                                        | Est. duration | Expected outcomes                 |
| ------------------------- | ------- | ------------------------------------ | --------------------------------------------------- | ------------- | --------------------------------- |
| **Platform-1.3-ENG-001**  | P13-E01 | Live Search composition/drain        | 1.2.0 freeze · search publishers                    | 2–3 weeks     | KL-01 closed/narrowed · evidence  |
| **Platform-1.3-ENG-002**  | P13-E02 | Observe live evaluation/delivery     | Observe frozen baseline · ENG-001 optional parallel | 2–3 weeks     | KL-02 closed/narrowed             |
| **Platform-1.3-ENG-003**  | P13-E03 | Support realtime (+ optional delete) | ENG-0003/0004                                       | 2–4 weeks     | SUP-03 closed · KL-05 updated     |
| **Platform-1.3-ENG-004**  | P13-E04 | Notification delivery providers      | Notify SoR · **not** Email SoR                      | 2–3 weeks     | Provider certified · honesty docs |
| **Platform-1.3-ENG-005**  | P13-E05 | Analytics live embed                 | Metabase foundation                                 | 1–2 weeks     | Embed path · KL slice closed      |
| **Platform-1.3-ENG-006**  | P13-E06 | Workflow designer adjacency          | Workflow 1.0 · Execute stays gated                  | 2–3 weeks     | Designer UX · gated tests         |
| **Platform-1.3-ENG-007**  | P13-E07 | Law UX polish                        | Law 1.0                                             | 1–3 weeks     | UX AC met · no FIN/Email          |
| **Platform-1.3-ENG-008**  | P13-E08 | Time approvals/reporting UI          | Time 1.0 · prefer after ENG-001                     | 1–2 weeks     | Approvals path                    |
| **Platform-1.3-ENG-009**  | P13-E09 | Projects sprint/My Work              | Projects 1.1                                        | 2–3 weeks     | Sprint operations                 |
| **Platform-1.3-ENG-010**  | P13-E10 | Performance baselines                | OPS capacity                                        | 1–2 weeks     | Baseline pack                     |
| **Platform-1.3-ENG-011**  | P13-E11 | SemVer/portfolio hygiene             | Versioning policy                                   | 1 week        | KL-11/12 update                   |
| **Platform-1.3-CERT-001** | P13-E12 | Portfolio certification              | ENG-001…011 as scoped                               | 1–2 weeks     | Cert pack · PASS/FAIL classified  |

## Parallelism guidance

- Wave A: ENG-001 ∥ ENG-002 ∥ ENG-003 ∥ ENG-004 (integration risk managed via freeze)
- Wave B: ENG-005 ∥ ENG-006
- Wave C: ENG-007 ∥ ENG-008 ∥ ENG-009 ∥ ENG-010 ∥ ENG-011
- Wave D: CERT-001

## Explicitly not in this sequence

Platform-1.3 programmes must **not** include Email SoR, FIN-001, or Workflow Execute unlock.
