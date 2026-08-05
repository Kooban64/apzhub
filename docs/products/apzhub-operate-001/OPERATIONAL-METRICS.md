# Operational Metrics — Internal Adoption

| Field     | Value                                              |
| --------- | -------------------------------------------------- |
| Programme | APZHUB-OPERATE-001                                 |
| Status    | **DEFINED**                                        |
| Kind      | User / adoption metrics — not engineering velocity |

## Purpose

Measure whether APZOR is **living in APZHUB**, and whether My Work reduces friction.

Complement (do not replace): [../framework/APZHUB-WORK-COMPLETION-JOURNEY.md](../framework/APZHUB-WORK-COMPLETION-JOURNEY.md).

## Core measures

| Metric                       | Meaning                                                           | Starting method           |
| ---------------------------- | ----------------------------------------------------------------- | ------------------------- |
| **Daily Active Users (DAU)** | Distinct staff using APZHUB per day                               | Auth / session evidence   |
| **My Work usage**            | Sessions that open `/workspace/home` or act on My Work cards      | Route / click observation |
| **Product adoption**         | Active use of Projects / Support / Time by cohort                 | Product activity samples  |
| **Time to first task**       | Onboarding → first meaningful action                              | Spot checks first week    |
| **Work completion**          | Obligations opened from My Work that reach done in owning product | Work Completion Journey   |
| **User satisfaction**        | Lightweight pulse (e.g. monthly 1–5 + free text)                  | Survey / standup ask      |
| **Operational friction**     | Count of friction tickets + My Work Review themes                 | Support + review notes    |

## Rules

1. Prefer existing signals before building telemetry programmes.
2. Never create a second System of Record for “adoption.”
3. Metrics inform Portfolio Review; they do not auto-authorise engineering.
4. Vanity pageviews alone are not success.

## Success (internal)

Staff stop asking “which tool?” and start in **My Work**.

## Owners

| Metric family        | Owner                                |
| -------------------- | ------------------------------------ |
| Access / DAU         | Platform Administrator               |
| My Work / completion | Product Board (with ops support)     |
| Product adoption     | Product Owners                       |
| Friction themes      | Support + My Work Review facilitator |
