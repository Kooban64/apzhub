# APZHUB Notifications & Activity quick reference

Derived lookup for [021](./021-notification-activity-attention-management-framework.md).

> **Document Version:** 1.0 · **Platform Specification · Core Platform Standard**  
> DEF summary: [005 §14](./005-desktop-experience-workspace-framework.md). Shell delivery: [016](./016-desktop-shell-architecture-user-experience-framework.md). Events: [012](./012-event-driven-architecture-background-processing-workflow-framework.md). Search: [020](./020-unified-search-knowledge-discovery-framework.md). Platform services: [009](./009-platform-service-layer-integration-framework.md).

## Core rule

**Attention Management** is the platform capability; **notifications** are the delivery mechanism. Modules **publish events** — never send notifications directly (009, 012).

## Vision

Minimise interruption · never miss important work. Distinguish: information · action required · urgent · system health · background progress · personal/team activity · AI recommendations (future)

## Philosophy — framework decides

Whether/when/how to notify · who to notify · suppress · retain — Platform Services + Attention Engine, not modules

## Framework components

Notification Service · Activity Service · Attention Engine · Preference Service · Delivery Service · Subscription Service · Reminder Service · Digest Service · AI Recommendation (future)

## Notification types (predefined behaviour)

Information · success · warning · error · assignment · approval required · reminder · escalation · background completion · connector alert · security alert · maintenance notice (006 presentation)

## Activity stream (platform-owned)

Project created · task assigned · document uploaded · workflow completed · user provisioned · role changed · connector failed · module installed — immutable platform data (011); distinct from ops telemetry (014)

## Personal activity timeline

Recent work · assigned tasks · approvals · recently viewed · background jobs · mentions · comments (017, 018)

## Team activity (permission-gated)

Support queue · project team · compliance · security · management (007)

## Attention levels

Critical · high · normal · low · informational — determines delivery behaviour; set by Attention Engine

## Delivery channels

Desktop toast · notification centre · status bar · workspace banner · email · push/SMS/Teams/Slack (future) — user-configurable; shell surfaces in 016

## Notification centre

Unread · read · pinned · snoozed · archived · filtered · searchable (020)

## Reminder engine

Snooze · repeat · escalate · expire · follow-up

## Digests

Morning/evening/weekly summaries · connector health · approvals · AI daily briefing (future) — reduce fatigue via Attention Engine

## Subscriptions

Projects · teams · documents · dashboards · reports · tickets · workflows — eligibility + permission-checked (005)

## Mentions

@user · @team · @role — auto attention items; permission-validated targets

## Background progress

Report gen · OCR · imports · provisioning · exports — progress events; status bar; survives session switch (012, 016, 018)

## Activity timeline fields

Timestamp · actor · action · target · workspace · module · correlation ID · outcome (010, 012)

## Search integration (020)

"My approvals" · "yesterday's work" · "failed imports" · "unread alerts" — permission-filtered

## AI integration (future)

Summarise · prioritise · recommend · detect anomalies · overdue work · daily briefings — same activity data; no permission bypass (013)

## Attention Engine decides

Interrupt now? · wait? · digest? · escalate? · repeat? · ignore? — prevents overload; modules cannot override

## Context awareness

Current workspace/session · presence · current task · DND · working hours (future) — 018 sessions

## User preferences (platform-owned, 011)

Channels · priority thresholds · sounds · desktop alerts · email · digests · snooze rules

## Admin controls (centralised, permission-gated)

System announcements · maintenance · connector/security alerts · mandatory notifications — no raw backend dashboards for standard users (014, 002); superadmin = explicit tier (007)

## Security (mandatory)

Permissions · workspace visibility · document access · project membership · org policies — **never reveal inaccessible information**; no backend branding leak (002, 013)

## Performance

Async · batching · high volume · horizontal scale · never block UI (012)

## Self-hosted first (026)

SMTP · WebSockets · SSE · push (future) · message queues — **no proprietary notification platforms** (008, 004)

## Testing (015)

Unit · integration · preference · delivery · reminder · performance · Playwright · regression — **no inaccessible content in notifications/activity/search**

## Build rules

Events in · centralised logic · separate activity from notifications · Attention Engine for delivery · respect prefs · searchable activities · AI-ready

## Acceptance highlights

Modules publish events only · searchable activity history · permission + preference aware · attention levels drive delivery · digests reduce fatigue · consistent job progress · AI can prioritise/summarise · scales across modules · **no permission leakage** · **no module notification subsystems**
