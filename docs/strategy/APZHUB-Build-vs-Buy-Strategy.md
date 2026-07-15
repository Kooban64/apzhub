# APZHUB Build vs Buy Strategy

> **Milestone:** PCS-001  
> **Status:** Strategic classification — planning only  
> **Authority:** [Document 001](../001-project-vision-and-guiding-principles.md) · [Document 008](../008-module-plugin-connector-architecture.md)

---

## Decision framework

| Decision | When to use |
|----------|-------------|
| **Build** | Core differentiator; no suitable OSS; must own SoR; UX is the product |
| **Integrate OSS** | Mature CE engine; not differentiator; adapter cost < build cost |
| **Commercial purchase** | OSS gap too large; compliance cert required; time-to-market critical |
| **Future replacement** | Interim solution; abstraction boundary exists; revisit at milestone gate |

---

## Platform Core capabilities

| Capability | Decision | Justification |
|------------|----------|---------------|
| Workbench shell | **Build** | Core UX differentiator; no substitute |
| Platform Runtime | **Build** | Manifest orchestration is APZHUB identity |
| Identity (tenant model) | **Build** | Must own SoR; multi-product foundation |
| Authorization / RBAC | **Build** | Security boundary; never outsource policy |
| Operations Console | **Build** | Operator experience; consolidated diagnostics |
| Personalisation | **Build** | Platform metadata; Document 023 |
| Governance / feature flags | **Build** | Commercial entitlement foundation |
| Security / resilience | **Build** | Zero Trust posture; CSP, guards, probes |
| Action Framework | **Build** | Unified execution model (Document 019) |
| Knowledge / Search framework | **Build** | Permission-filtered discovery orchestration |
| Event / Notification framework | **Build** | Platform event model (Document 012) |
| Activity Timeline | **Build** | Audit-driven presentation |
| API envelope / gateway policy | **Build** | Trust boundary |
| Design System | **Build** | Brand and consistency (shadcn/Tailwind) |

---

## Authentication

| Capability | Decision | Justification |
|------------|----------|---------------|
| Session authentication | **Integrate OSS** (Better Auth) | Auth is not differentiator; own permissions |
| Legacy SSO (Authentik) | **Coexist → retire** | Migration path only |
| Enterprise SAML/OIDC | **Build config layer** on Better Auth | Per Document 007; per-engine adapters |

---

## Productivity domains

| Domain | Decision | Justification |
|--------|----------|---------------|
| Project management | **Integrate OSS** (Plane) | Mature PM; build = years |
| Document management | **Integrate OSS** (Paperless) | OCR/tagging complex |
| Time tracking | **Integrate OSS** (Kimai) | Standard; billing linkage via service |
| Ticketing | **Integrate OSS** (Zammad) | Support workflows standard |
| Analytics / BI | **Integrate OSS** (Metabase) | Dashboard engine not differentiator |
| Workflow automation | **Integrate OSS** (n8n) | Action gateway target |
| Quality Engineering / test management | **Build native** | Playwright-first; AI-native; platform SoR; commercial potential — [QE Strategy](./APZHUB-Quality-Engineering-Platform-Strategy.md) |
| ~~Test management (Kiwi TCMS)~~ | ~~Integrate OSS~~ | **Superseded by OSS-002** — build native Quality Engineering |

---

## Observability & security ops

| Capability | Decision | Justification |
|------------|----------|---------------|
| Metrics | **Integrate OSS** (Prometheus) | Industry standard |
| Dashboards | **Integrate OSS** (Grafana) | Behind admin connector |
| Logs | **Integrate OSS** (Loki) | Self-hosted log aggregation |
| Tracing | **Integrate OSS** (OpenTelemetry) | Standard instrumentation |
| Vulnerability scanning | **Integrate OSS** (Greenbone) | Enterprise pack; not core |
| Pen test management | **Integrate OSS** (Faraday) | Security ops add-on |
| Mobile security | **Integrate OSS** (MobSF) | Specialised |
| SIEM | **Commercial purchase** (future) | Splunk/Elastic if OSS insufficient; PCv2-05 evaluates |

---

## Vertical products

| Product | Decision | Justification |
|---------|----------|---------------|
| Law Platform (matters, clients) | **Build** | Primary commercial vertical; validated |
| Trust accounting engine | **Build** (extract later) | Regulated; generic ledger → Financial Engine |
| Exchange | **Build** (when chartered) | No suitable OSS vertical |
| Banking | **Build** (when chartered) | Regulated; uses Financial Engine |

---

## Financial Engine

| Capability | Decision | Justification |
|------------|----------|---------------|
| Double-entry ledger | **Build** (extract from Law) | Shared primitive; FIN-001 defer until validated |
| Payment processing | **Integrate OSS / commercial** | Stripe/Adyen adapters — never own payment rails |
| Bank feeds | **Commercial purchase** (future) | Open Banking aggregators |

---

## AI

| Capability | Decision | Justification |
|------------|----------|---------------|
| AI orchestration platform | **Build** | Governance, audit, permission boundaries |
| LLM inference (local) | **Integrate OSS** (Ollama) | Model hosting not differentiator |
| LLM inference (cloud) | **Commercial purchase** (API) | Optional; usage-based |
| Vector store | **Integrate OSS** (pgvector/Qdrant) | Infrastructure |
| RAG pipeline | **Build** | Permission-filtered; platform-owned index |

---

## Infrastructure

| Capability | Decision | Justification |
|------------|----------|---------------|
| PostgreSQL | **Integrate OSS** | Platform SoR |
| Redis | **Integrate OSS** | Cache, rate limits, sessions |
| Reverse proxy | **Integrate OSS** (Caddy) | TLS, routing |
| Secret management | **Integrate OSS** (Vault) | PCv2-04; not build |
| Object storage | **Integrate OSS** (S3-compatible) | MinIO etc. |
| CI/CD | **Integrate OSS** (GitHub Actions) | Self-hosted runners |
| Container orchestration | **Integrate OSS** (K8s optional) | Enterprise packaging |

---

## Never outsource (strategic answer)

These capabilities **must remain APZHUB-built**:

1. Permission and role model (authorization policy)
2. Tenant isolation and provisioning policy
3. Workbench user experience shell
4. API gateway security policy
5. Audit authority and envelope
6. Manifest/registry/discovery system
7. Platform event model and correlation
8. Commercial entitlement / governance logic
9. Security posture (headers, guards, validation)
10. Unified search permission filtering

---

## Future replacement candidates

| Current | Replacement trigger | Alternative |
|---------|---------------------|-------------|
| Better Auth | Limitation in enterprise SSO | Custom OIDC layer (still own permissions) |
| Plane | CE limitations | Native PM module or alternate adapter |
| Metabase | Embed restrictions | Superset |
| n8n | Scale limits | Temporal workflows |
| In-process Event Bus | Multi-instance scale | NATS/Kafka (PCv3) |
| Kimai | Billing integration gaps | Native time module |

---

## References

- [Capability Abstraction Standard](../architecture/APZHUB-Capability-Abstraction-Standard.md)
- [OSS vs Native Decision Model](../architecture/APZHUB-OSS-vs-Native-Capability-Decision-Model.md)
- [Quality Engineering Platform Strategy](./APZHUB-Quality-Engineering-Platform-Strategy.md)
- [OSS Integration Strategy](./APZHUB-OSS-Integration-Strategy.md)
- [Platform Core Strategy](./APZHUB-Platform-Core-Strategy.md)
- [AI Strategy](./APZHUB-AI-Strategy.md)
