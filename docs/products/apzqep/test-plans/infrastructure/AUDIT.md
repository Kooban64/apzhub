# Audit — APZQEP-ENG-060B

## Integration

Optional `PlanAuditAppender` dependency (`audits`) on `PlanApplicationService`, mirroring the Test Specifications `SpecificationAuditAppender` pattern.

Audited actions (when appender wired):

create · content/metadata/ownership/assignment/schedule update · item add/update/reorder/remove · submit · approve · reject · return-to-draft · ready · execute · complete · archive · cancel · supersede · clone

## Rules

- Append-only entries with tenant, actor, correlation id, action, details
- No duplicated Platform Audit subsystem inside the package
- Platform Service layer may centralise durable audit later without Domain changes
