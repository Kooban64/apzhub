# Platform Admin — mockup sequence

| Field  | Value                                            |
| ------ | ------------------------------------------------ |
| Status | **IN FORCE** — go slowly, one screen at a time   |
| Locked | IA + screen wireframes in this pack (2026-08-17) |

## Rule

Do **not** jump randomly through all menus. Mock and accept **one screen (or tightly coupled pair)** before the next.

## Sequence

| Step | Screen                                                                               | Why                                                                                                                        |
| ---- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| 0    | Shell + compact sidebar + secondary tabs                                             | Locks chrome for everything else                                                                                           |
| 1    | **Overview**                                                                         | First visual — operational control centre                                                                                  |
| 2    | **Tenants** master list                                                              | Most important list · APZOR as ordinary row                                                                                |
| 3    | **Tenant detail** Overview tab                                                       | Platform operator view of a tenant                                                                                         |
| 4    | **Tenant → Users → User Inspector**                                                  | **NEXT OWNER PRIORITY** — proves Stream 6 (org roles · product roles · scopes · granular permissions · professional tools) |
| 5    | Create / Edit User + Provisioning (tenant-scoped)                                    | Completes core admin UX loop                                                                                               |
| 6    | Provisioning (platform queue + failure drawer)                                       | Global honesty                                                                                                             |
| 7    | Products · Providers · Operations                                                    | Naming discipline (capability vs provider)                                                                                 |
| 8    | Billing · Identity & Access · Audit · Global search                                  | Fill secondary surfaces                                                                                                    |
| 9    | Remaining Configuration · Incidents · Jobs · Security · Compliance · Settings · Help | Complete IA coverage                                                                                                       |

## Acceptance per step

For each mockup step:

1. Match locked ASCII layout + visual standard.
2. Wire real data **or** honest empty/unavailable states (no fake healthy metrics).
3. Owner walkthrough before advancing.
4. Gap-map against existing `/ops` / `/console` / IAM surfaces — extend, do not fork.

## Current position

| Item                             | State                                                |
| -------------------------------- | ---------------------------------------------------- |
| Spec pack                        | **LOCKED**                                           |
| Step 1 — Overview                | **ACCEPTED** (2026-08-17) — see STEP-1-ACCEPTED.md   |
| Step 2 — Tenants master list     | **IMPLEMENTED** (2026-08-17) — stop for Owner review |
| Next after Owner accepts Tenants | Minimal Tenant Detail → **Users → User Inspector**   |
