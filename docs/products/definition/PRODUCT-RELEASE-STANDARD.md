# Product Release Standard (Definition Stage)

> **Programme:** APZHUB-PRODUCTS-003 · Complements framework certification / release practices

## Purpose

Definition must outline release shape before Architecture — SemVer intent, MVP boundary, support lifecycle.

## Mandatory release content

| Topic                  | Requirement                                              |
| ---------------------- | -------------------------------------------------------- |
| MVP                    | Explicit in/out scope                                    |
| Version roadmap        | Patch / Minor / Major naming intent                      |
| Release phases         | Phased delivery if any                                   |
| Migration              | Data/engine migration intent                             |
| Backward compatibility | API/event compatibility expectations                     |
| Feature flags          | What may be gated (Platform flags remain Platform-owned) |
| Deprecation            | How removals are announced                               |
| Support lifecycle      | How long versions are supported                          |

## Rules

1. Definition does not assign SemVer numbers as released — Release programmes do.
2. MVP must be shippable under Platform 1.4 freezes.
3. Enabling Platform feature flags (e.g. durable notifications) is **not** a product release decision alone.
4. Each SemVer bump later requires a named Owner Approval.
