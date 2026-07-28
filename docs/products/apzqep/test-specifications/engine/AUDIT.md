# Audit — APZQEP-ENG-050B

## Integration

`SpecificationAuditAppender` optional dependency on the application service.

Audited actions (when appender wired):

create · update · approve · reject · withdraw · supersede · retire · cancel · review · relationship changes

## Rules

- Append-only entries with tenant, actor, correlation id, action, details
- No duplicated Platform Audit subsystem inside the package
- Platform Service layer may centralise durable audit later without Domain changes
