# Configuration Validation Guide

**Milestone:** APZCONFIG-001

Validation is **metadata only**. Rules are recorded; validators are **not executed** against live payloads in this foundation.

## Kinds

`string` · `number` · `boolean` · `enum` · `json` · `array` · `object` · `pattern` · `range` · `required` · `custom`

## Guardrails

- Range: `min <= max` when both set  
- Enum: requires `enumValues`  
- Pattern: requires `pattern`  
- Custom: requires `customValidatorKey`  
- Payloads must not look like secrets/credentials
