# Search Integration Capability Model

| Field | Value |
| --- | --- |
| **Document** | APZHUB-Search-Integration-Capability-Model |
| **Milestone** | APZSEARCH-004 |
| **Status** | Declarative only |

## 1. Two layers

1. **Platform capability** — integration-sdk `IntegrationCapabilityId` value `"search"`.
2. **Fine-grained search capabilities** — SDK constants in `SEARCH_INTEGRATION_CAPABILITIES`.

## 2. Declared capabilities

| ID | Aligns to `SearchCapabilities` |
| --- | --- |
| `keyword_search` | `keywords` |
| `phrase_search` | `phrases` |
| `filtering` | `filters` |
| `sorting` | `sorting` |
| `facets` | `facets` |
| `highlighting` | `highlighting` |
| `suggestions` | `suggestions` |
| `pagination` | `pagination` |
| `index_lifecycle` | (SDK-only; not a contract boolean) |
| `health` | SDK health surface |
| `diagnostics` | SDK diagnostics surface |
| `configuration_validation` | SDK validator surface |

Contract flags `semantic`, `vector`, `fuzzy` remain **hard-false**. Declaring them `true` fails configuration validation and compatibility.

## 3. Registration

`SearchCapabilityRegistration`:

1. Requires manifest `declaredCapabilities` include `"search"`.
2. Registers fine-grained IDs in-memory.
3. Delegates platform registration to integration-sdk `CapabilityRegistration`.

## 4. Non-execution rule

Capability presence means **declared support metadata**, never runtime engine entitlement in this milestone.
