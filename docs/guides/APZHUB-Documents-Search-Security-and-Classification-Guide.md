# Documents Search Security and Classification Guide

**Milestone:** APZSEARCH-012

## Classification mapping (no downgrade)

Document codes → SearchClassification:

| Document                                                     | Search                                                    |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| public                                                       | public                                                    |
| internal, template, attachment                               | internal                                                  |
| confidential, legal, financial, compliance, generated_report | confidential                                              |
| restricted, evidence                                         | restricted                                                |
| custom / absent                                              | confidential (fail-closed) / reject if absent on Document |

## Allowlist design

Safe metadata keys are allowlisted in `DOCUMENTS_SEARCH_SAFE_METADATA_KEYS`. Forbidden patterns reject storage keys, buckets, signed URLs, credentials, checksum hex.

## Tenant / org

Trusted platform context wins. Entity tenant must match context. Cross-tenant publication rejected.

## Retention / legal hold

Publish only `legalHold` and `retentionPolicyKey`. Never retention notes. Legal-hold documents remain searchable only to authorised users via permission/classification metadata — no visibility broadening.
