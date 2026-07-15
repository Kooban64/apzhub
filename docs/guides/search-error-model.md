# Search Error Model

> **Milestone:** APZSEARCH-003

Search domain errors (`SearchDomainError`) translate to `PlatformServiceError` at the platform-services boundary (`mapSearchDomainError`).

## Classifications (non-exhaustive)

provider not found · already registered / duplicate · unavailable · disabled · configuration invalid · capability missing · active provider conflict · configuration not found / invalid / revision conflict · collection/source/scope/profile not found · validation failed · tenant mismatch · organisation mismatch · persistence unavailable · capability unsupported · **search execution unavailable**

## Must not leak

SQL · table names · resolved credentials · stack traces · provider implementation internals · secret reference values when sensitive
