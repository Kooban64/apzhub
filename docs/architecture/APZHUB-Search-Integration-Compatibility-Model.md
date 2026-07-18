# Search Integration Compatibility Model

| Field         | Value                                         |
| ------------- | --------------------------------------------- |
| **Document**  | APZHUB-Search-Integration-Compatibility-Model |
| **Milestone** | APZSEARCH-004                                 |

## 1. Purpose

Classify whether a declared search adapter surface is compatible with platform expectations **without probing an engine**.

## 2. Classification

| Class         | Meaning                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| `supported`   | Required capabilities present; no forbidden flags; provider kind known          |
| `degraded`    | Keyword present but some non-critical required capabilities missing             |
| `unsupported` | Missing keyword (or equivalent critical) **or** forbidden semantic/vector/fuzzy |
| `unknown`     | Declarations OK but `providerKind` not supplied                                 |

## 3. Report fields

`SearchCompatibilityReport` includes:

- `sdkVersion` (`0.1.0`)
- `declaredCapabilities` / `contractCapabilities`
- `missingCapabilities` / `forbiddenFlags`
- `engineBound: false`
- `executionEnabled: false`

## 4. Evaluation API

```ts
evaluateSearchCompatibility({
  declaredCapabilities,
  requiredCapabilities, // optional
  providerKind, // optional
});
```

## 5. Engine binding

Compatibility never implies an engine is connected, certified, or executable. Certification of a concrete engine adapter is deferred to **APZSEARCH-005**.
