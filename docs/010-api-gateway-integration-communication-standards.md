# Document 010 — API Gateway, Integration & Communication Standards

> **Status:** Active — communication framework (official standard for all data exchange)  
> **Depends on:** [001](./001-project-vision-and-guiding-principles.md) through [009](./009-platform-service-layer-integration-framework.md)

## 1. Purpose

This document defines how every request, response, integration, and communication within APZHUB must occur.

It establishes a unified communication framework between:

- Desktop Client
- Platform Modules
- Platform Services
- Shared Services
- Service Connectors
- Backend Engines
- Future External Systems

Every communication path must comply with this standard.

---

## 2. Communication Philosophy

The platform must present a single unified API architecture.

Regardless of how many backend systems exist, the client experiences one API.

The client must never know:

- Which backend engine is responding
- Which connector is used
- Whether data originates from one or many systems

The API belongs to APZHUB.

---

## 3. Communication Layers

Every request follows this path.

```
Desktop Client
        ↓
API Gateway
        ↓
Authentication
        ↓
Authorisation
        ↓
Platform Service
        ↓
Connector
        ↓
Backend Engine
        ↓
Connector
        ↓
Platform Service
        ↓
Standard Response
        ↓
Desktop Client
```

No shortcuts are permitted.

This aligns with the Platform Service Layer ([009](./009-platform-service-layer-integration-framework.md)), IAM pipeline ([007](./007-identity-authentication-authorisation-rbac-architecture.md)), and module architecture ([008](./008-module-plugin-connector-architecture.md)).

Edge TLS and routing may be handled by Caddy or Nginx ([004](./004-technology-stack-repository-standards-development-environment.md)); the **APZHUB API Gateway** is the application boundary that enforces platform communication standards.

---

## 4. API Gateway Responsibilities

The API Gateway owns:

- Authentication
- Session Validation
- Rate Limiting
- Request Validation
- Routing
- Version Management
- Request Logging
- Audit Hooks
- Correlation IDs
- Error Standardisation
- Response Formatting

The Gateway never contains business logic.

---

## 5. API Design Principles

Every API must be:

- Predictable
- Strongly Typed
- Versioned
- Documented
- Consistent
- Secure
- Idempotent where appropriate
- Backward Compatible
- Business-oriented rather than backend-oriented

REST-first per [004](./004-technology-stack-repository-standards-development-environment.md); GraphQL only if later justified.

---

## 6. API Categories

The platform exposes:

- Identity APIs
- Platform APIs
- Module APIs
- Administration APIs
- Internal Service APIs
- Connector APIs (internal — not exposed to desktop client)
- Health APIs
- Metrics APIs
- Future AI APIs

Each category has clearly defined responsibilities.

Connector APIs are infrastructure-only; the desktop client calls Platform/Module APIs only.

---

## 7. Request Standard

Every request should include:

- Authentication Token
- Correlation ID
- Organisation Context
- Workspace Context
- Locale
- Time Zone
- Client Version
- Optional Feature Flags

The platform should never rely on implicit state.

---

## 8. Response Standard

Every response should follow a common envelope.

Include:

- Success Status
- Payload
- Metadata
- Pagination (where applicable)
- Warnings
- Validation Messages
- Correlation ID
- Execution Time

Users should experience identical response structures across the platform.

Backend models must not appear in payloads ([009](./009-platform-service-layer-integration-framework.md)).

---

## 9. Error Standard

Errors should be categorised consistently.

Examples:

- Validation Error
- Authentication Error
- Permission Error
- Business Rule Error
- Configuration Error
- Integration Error
- Connector Error
- Temporary Failure
- System Error

Backend implementation details must never appear in responses.

Permission errors must not leak existence of hidden resources ([005](./005-desktop-experience-workspace-framework.md)).

---

## 10. Validation

Validation occurs before business execution.

Levels include:

- Request Validation
- Schema Validation
- Business Validation
- Permission Validation
- Dependency Validation
- Connector Availability

Only valid requests reach business logic.

---

## 11. API Versioning

Platform APIs must support versioning.

Versioning should minimise breaking changes.

Connectors may evolve independently without affecting platform APIs.

Service contract stability per [009](./009-platform-service-layer-integration-framework.md).

---

## 12. Pagination

Large datasets must support:

- Pagination
- Sorting
- Filtering
- Searching

Cursor-based pagination may be introduced later where appropriate.

Responses should remain performant regardless of dataset size.

---

## 13. Filtering Standards

Filtering must be consistent across all modules.

Examples:

- Date Range
- Status
- Assigned User
- Owner
- Department
- Labels
- Tags
- Priority

Filtering behaviour should feel identical throughout the platform.

---

## 14. Search Standards

Every searchable module integrates with Platform Search.

Search should support:

- Global Search
- Workspace Search
- Advanced Filters
- Saved Searches
- Recent Searches

Backend-specific search behaviour must be abstracted.

Search indexing is owned by Platform Services ([009](./009-platform-service-layer-integration-framework.md)).

---

## 15. Batch Operations

The platform should support:

- Bulk Updates
- Bulk Deletes
- Bulk Assignments
- Bulk Imports
- Bulk Exports

Batch execution should generate progress events.

Long-running batches run asynchronously ([009](./009-platform-service-layer-integration-framework.md)).

---

## 16. File Transfers

Uploads and downloads should be managed centrally.

Support:

- Large Files
- Chunked Uploads
- Virus Scanning (future)
- Progress Indicators
- Retry
- Audit Logging

Files should never bypass the platform.

Use S3-compatible storage per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 17. Streaming

Future capabilities may require streaming.

Examples:

- Notifications
- AI Responses
- Live Logs
- Workflow Progress
- Monitoring

The communication architecture should support real-time updates.

---

## 18. External Integrations

Future integrations may include:

- Microsoft 365
- Google Workspace
- GitHub
- GitLab
- Slack
- 3CX
- ERP Systems
- CRM Systems
- Payment Providers
- Identity Providers

These integrations should follow the same connector architecture ([008](./008-module-plugin-connector-architecture.md)).

---

## 19. Correlation IDs

Every request receives a Correlation ID.

The Correlation ID follows the request through:

- Gateway
- Services
- Connectors
- Background Jobs
- Audit
- Logs

This enables end-to-end tracing.

---

## 20. Timeouts

Every connector should define:

- Connection Timeout
- Read Timeout
- Retry Policy
- Maximum Retries
- Circuit Breaker Behaviour

The platform should fail gracefully.

Retry policy complements [009](./009-platform-service-layer-integration-framework.md).

---

## 21. Rate Limiting

Rate limiting should be configurable.

Support:

- Per User
- Per Organisation
- Per API
- Per Connector
- Per Background Worker

Protect both the platform and backend engines.

Redis-backed rate limiting per [004](./004-technology-stack-repository-standards-development-environment.md).

---

## 22. Circuit Breakers

Connector failures should not cascade.

Support:

- Open
- Half Open
- Closed
- Automatic Recovery
- Health Monitoring
- Temporary Isolation

This improves resilience.

---

## 23. API Documentation

Every API requires:

- Description
- Examples
- Validation Rules
- Permission Requirements
- Error Responses
- Version Information
- Change History

Documentation is mandatory.

---

## 24. Testing

Every API requires:

- Unit Tests
- Integration Tests
- Contract Tests
- Security Tests
- Performance Tests
- Failure Tests
- Playwright End-to-End Tests where user journeys depend on the API

---

## 25. Monitoring

Every API should expose metrics.

Examples:

- Requests
- Latency
- Errors
- Retries
- Timeouts
- Success Rate
- Traffic
- Connector Health

Metrics support future observability dashboards.

---

## 26. Security

Every request must support:

- Authentication
- Permission Checks
- CSRF Protection
- Input Validation
- Output Encoding
- Rate Limiting
- Audit Logging
- Secure Headers

Security is enforced centrally — never frontend-only ([007](./007-identity-authentication-authorisation-rbac-architecture.md)).

---

## 27. Future Readiness

The communication architecture should support:

- Desktop Application
- Mobile Application
- CLI
- AI Agents
- Automation
- Public APIs (future)
- Partner APIs (future)

No redesign should be required.

---

## 28. Cursor Instructions

When implementing APIs:

- Never expose backend APIs directly.
- Route all client requests through the API Gateway.
- Maintain consistent request and response structures.
- Translate backend responses into platform models.
- Apply validation before business execution.
- Design APIs around business capabilities rather than backend technologies.
- Assume additional connectors and clients will be added over time.

The API layer is part of the APZHUB platform and not merely a transport mechanism.

---

## 29. Acceptance Criteria

The API Gateway & Communication Framework is complete when:

- All client requests pass through the API Gateway.
- Responses are consistent across all modules.
- Backend implementations remain hidden.
- Correlation IDs provide end-to-end traceability.
- Connectors are isolated.
- APIs are versioned and documented.
- External integrations follow the same architecture.
- Future clients can consume the platform without architectural changes.

This communication framework defines the official standard for all data exchange within APZHUB.
