# Search Configuration Service Guide

> **Milestone:** APZSEARCH-003

## Operations

create · get · list · update · create/list/get version · activate · validate · archive

## Secrets

Persist **secret references only**. Responses never return resolved secrets. Sensitive endpoint data is redacted where governed.

## Validation

`validateSearchConfiguration` is deterministic and does not probe engines or execute queries.
