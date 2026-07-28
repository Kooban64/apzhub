# Long-Term Support (LTS) Policy

> **Programme:** APZHUB-PRODUCT-LIFECYCLE-001  
> **Date:** 2026-07-20  
> **Baseline context:** Platform **1.2.0** is current Production Baseline (PRWL)

---

## LTS definition

An **LTS** baseline is an Owner-designated Production SemVer that continues to receive security and critical defect PATCH support after a newer baseline is current.

## Designation

| Rule            | Detail                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| Who designates  | Owner only                                                                                                         |
| What may be LTS | Platform and/or commercial product SemVer                                                                          |
| Default         | Newest Owner-accepted Production Baseline is **current**; prior baselines are **historical** unless designated LTS |
| Platform 1.2.0  | Current baseline at lifecycle start — **not** automatically LTS after a future promotion                           |

## Support while LTS

| Included                         | Excluded                            |
| -------------------------------- | ----------------------------------- |
| Security patches                 | New features                        |
| Critical production defect fixes | Strategic MINOR growth              |
| Documentation / KL honesty fixes | Redesign / freeze thaws without ADR |

## Exit from LTS

Owner declares end of LTS with notice period and migration guidance to the current baseline (see [END-OF-LIFE.md](./END-OF-LIFE.md)).
