# Observability Logs Model

**Milestone:** APZOBSERVE-001

## LogSource

Registration metadata for a log source: key, name, kind (`application` | `platform` | `infrastructure` | `audit` | `other`), provider kind/ref, status.

## Non-goals

- No Loki log body storage
- No log query engine
- No shipping agents

Loki (or another provider) may later implement provider contracts against this metadata.
