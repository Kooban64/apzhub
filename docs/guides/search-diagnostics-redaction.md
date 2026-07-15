# Search Diagnostics and Redaction Guide

> **Milestone:** APZSEARCH-003

## Safe diagnostics may include

Registered/enabled/disabled provider counts · active provider id · invalid configuration flags · collection/source/scope/profile counts · provider health summary · capabilities · persistence readiness · audit/statistics metadata summaries · **search execution status = not implemented**

## Must never expose

Resolved secrets · credentials · secret-bearing URLs · raw provider error payloads · database internals · product content · indexed content · query text · PII beyond governed actor ids
