# APZHUB Platform Search — Product Adapter Guide

> **Milestone:** APZSEARCH-001  
> **Package:** `@apzhub/search-contracts`

---

## Rule

Products remain the System of Record. Adapters map product entities → `SearchMetadata` for future indexing. Adapters never store authoritative business data in the Search Platform.

## Contract

```ts
interface ProductSearchAdapter {
  productId: SearchProductId;
  label: string;
  describeSources(context): SearchSource[];
  mapToSearchMetadata?(context, ref): SearchMetadata | null;
  listIndexableEntityRefs?(context, options?): { items; nextCursor? };
}
```

## Declared products (no implementations)

| Product id | Notes |
|------------|-------|
| `projects` | Projects / tasks capability |
| `support` | Support requests / KB |
| `documents` | Document Platform |
| `testing` | APZ TCMS |
| `reporting` | Reporting Platform |
| `workflow` | Future workflow |
| `analytics` | Future analytics |
| `identity` | Identity metadata eligible for search |
| `administration` | Admin catalogue surfaces |

Use `DECLARED_PRODUCT_SEARCH_ADAPTERS` / `isDeclaredProductSearchAdapter`.

## Ownership

- Product services enforce tenant, organisation, classification, and permissions before exposing refs.
- Search Platform never invents product domain models.
- Backend engine role names must never appear in search UI (future Workbench milestones).
