# Support Search Mapping Guide

**Package:** `@apzhub/search-support`  
**Milestone:** APZSEARCH-011

## Models

Imported from `@apzhub/platform-service-contracts` (`domain/support.ts`):

| Entity type | Type |
| ----------- | ---- |
| support_request | `SupportTicket` |
| support_article | `SupportArticle` |
| support_organisation | `SupportOrganization` |
| support_group | `SupportGroup` |
| support_user | `SupportUser` |

## Field mapping (summary)

- **Request:** title; metadata status/priority/groupId/requesterId/(assignee|organisation|displayId)
- **Article:** title = subject or “Article”; summary = HTML-stripped body excerpt (≤280); metadata ticket/channel/visibility/senderType; internal visibility → restricted classification
- **Organisation / Group / User:** name/displayName + note/role/active metadata

`productId` = **`support`** (via Search Integration context).

## Forbidden

Zammad provisional IDs · `originMetadata` · Meilisearch/OpenSearch keys · Project Task/Comment DTOs.
