# Observability Traces Model

**Milestone:** APZOBSERVE-001

## TraceDefinition

Catalogue metadata for a traceable operation or service span family.

## TraceSpan

Span *reference* metadata (name, service key, start/end timestamps, provider refs). **Not** OpenTelemetry span storage.

## Non-goals

- No OTel exporters
- No trace backends
- No distributed tracing UI
